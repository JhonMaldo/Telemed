<?php
// 1. INCLUIR LA CONEXIÓN DESDE LA CARPETA 'database'
// Usamos '../' para subir un nivel desde 'php/'
require '../database/conexion.php';

// 2. RESPONDER SIEMPRE EN FORMATO JSON
header('Content-Type: application/json');

// 3. DETERMINAR LA ACCIÓN (desde GET o POST)
$accion = '';
if (isset($_GET['accion'])) {
    $accion = $_GET['accion'];
} elseif (isset($_POST['accion'])) {
    $accion = $_POST['accion'];
} else {
    // Error si no hay acción
    echo json_encode(['status' => 'error', 'message' => 'No se especificó ninguna acción.']);
    exit;
}

// 4. SWITCH PARA MANEJAR CADA ACCIÓN
switch ($accion) {
    case 'obtener_todos':
        obtener_todos($conn);
        break;
    case 'obtener_uno':
        obtener_uno($conn);
        break;
    case 'agregar':
        agregar($conn);
        break;
    case 'editar':
        editar($conn);
        break;
    case 'eliminar':
        eliminar($conn);
        break;
    default:
        echo json_encode(['status' => 'error', 'message' => 'Acción no válida.']);
        break;
}

// 5. CERRAR LA CONEXIÓN
$conn->close();

// --- FUNCIONES DEL CRUD ---

/**
 * OBTIENE TODOS LOS DOCTORES (para la tabla principal)
 */
function obtener_todos($conn) {
    // Unimos 'doctores' y 'usuarios' para traer la info completa
    $sql = "SELECT 
                d.id_doctor AS id,
                -- Dividimos el 'nombre_completo' en dos para el JS
                SUBSTRING_INDEX(u.nombre_completo, ' ', 1) AS nombre,
                SUBSTRING(u.nombre_completo, LENGTH(SUBSTRING_INDEX(u.nombre_completo, ' ', 1)) + 2) AS apellido,
                u.corre_electronico AS email,
                d.telefono_doctor AS telefono,
                d.especialidad AS especialidad,
                u.status AS estado
            FROM doctores d
            JOIN usuarios u ON d.id_usuario = u.id_usuario
            WHERE u.role = 'Doctor'";
    
    $result = $conn->query($sql);
    $doctores = [];
    if ($result) {
        while($row = $result->fetch_assoc()) {
            $doctores[] = $row;
        }
        echo json_encode($doctores); // Devuelve un array de doctores
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error al obtener doctores: ' . $conn->error]);
    }
}

/**
 * OBTIENE UN SOLO DOCTOR (para el modal 'Editar')
 */
function obtener_uno($conn) {
    if (!isset($_POST['id'])) {
        echo json_encode(['status' => 'error', 'message' => 'ID no proporcionado.']);
        exit;
    }
    $id = (int)$_POST['id'];
    
    // Esta consulta trae todos los campos necesarios para el formulario modal
    $sql = "SELECT 
                d.id_doctor AS id,
                SUBSTRING_INDEX(u.nombre_completo, ' ', 1) AS nombre,
                SUBSTRING(u.nombre_completo, LENGTH(SUBSTRING_INDEX(u.nombre_completo, ' ', 1)) + 2) AS apellido,
                u.corre_electronico AS email,
                d.telefono_doctor AS telefono,
                d.especialidad AS especialidad,
                d.numero_licencia AS licencia,
                u.status AS estado
            FROM doctores d
            JOIN usuarios u ON d.id_usuario = u.id_usuario
            WHERE d.id_doctor = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        echo json_encode($result->fetch_assoc()); // Devuelve un solo objeto doctor
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Doctor no encontrado.']);
    }
    $stmt->close();
}

/**
 * AGREGA UN NUEVO DOCTOR (requiere transacción)
 */
function agregar($conn) {
    // Recoger datos del formulario (enviados por admin.js)
    $nombre = $_POST['doctor-firstname'] ?? '';
    $apellido = $_POST['doctor-lastname'] ?? '';
    $email = $_POST['doctor-email'] ?? '';
    $telefono = $_POST['doctor-phone'] ?? '';
    $especialidad = $_POST['doctor-specialty'] ?? '';
    $licencia = $_POST['doctor-license'] ?? '';
    $estado = $_POST['doctor-status'] ?? 'Activo';
    
    $nombre_completo = $nombre . ' ' . $apellido;
    // Generamos un hash de contraseña aleatorio (en un sistema real, se enviaría por email)
    $password_hash = password_hash(uniqid(), PASSWORD_DEFAULT); 
    $role = 'Doctor';

    // Iniciar transacción
    $conn->begin_transaction();
    
    try {
        // 1. Insertar en 'usuarios'
        $sql_user = "INSERT INTO usuarios (nombre_completo, corre_electronico, contrasenia_hash, role, status) 
                     VALUES (?, ?, ?, ?, ?)";
        $stmt_user = $conn->prepare($sql_user);
        $stmt_user->bind_param("sssss", $nombre_completo, $email, $password_hash, $role, $estado);
        $stmt_user->execute();
        
        $id_usuario_nuevo = $conn->insert_id;
        
        if ($id_usuario_nuevo == 0) {
            throw new Exception("Error al crear el usuario: " . $stmt_user->error);
        }

        // 2. Obtener el siguiente ID para 'doctores' (ya que no es AUTO_INCREMENT)
        $result_max_id = $conn->query("SELECT MAX(id_doctor) + 1 AS next_id FROM doctores");
        $next_id = $result_max_id->fetch_assoc()['next_id'];
        if ($next_id == NULL) $next_id = 101; // Si es el primer doctor

        // 3. Insertar en 'doctores'
        $sql_doc = "INSERT INTO doctores (id_doctor, id_usuario, numero_licencia, especialidad, telefono_doctor) 
                    VALUES (?, ?, ?, ?, ?)";
        $stmt_doc = $conn->prepare($sql_doc);
        $stmt_doc->bind_param("iisss", $next_id, $id_usuario_nuevo, $licencia, $especialidad, $telefono);
        $stmt_doc->execute();

        if ($stmt_doc->affected_rows == 0) {
             throw new Exception("Error al crear el perfil del doctor: " . $stmt_doc->error);
        }

        // 4. Si todo salió bien, confirmar cambios
        $conn->commit();
        echo json_encode(['status' => 'success', 'message' => 'Doctor agregado exitosamente.']);

    } catch (Exception $e) {
        // 5. Si algo falló, revertir todo
        $conn->rollback();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    
    if (isset($stmt_user)) $stmt_user->close();
    if (isset($stmt_doc)) $stmt_doc->close();
}

/**
 * EDITA UN DOCTOR EXISTENTE (requiere transacción)
 */
function editar($conn) {
    // Recoger datos
    $id_doctor = (int)($_POST['doctor-id'] ?? 0);
    if ($id_doctor == 0) {
        echo json_encode(['status' => 'error', 'message' => 'ID de doctor no válido.']);
        exit;
    }
    
    $nombre = $_POST['doctor-firstname'] ?? '';
    $apellido = $_POST['doctor-lastname'] ?? '';
    $email = $_POST['doctor-email'] ?? '';
    $telefono = $_POST['doctor-phone'] ?? '';
    $especialidad = $_POST['doctor-specialty'] ?? '';
    $licencia = $_POST['doctor-license'] ?? '';
    $estado = $_POST['doctor-status'] ?? 'Activo';
    
    $nombre_completo = $nombre . ' ' . $apellido;

    $conn->begin_transaction();
    
    try {
        // 1. Obtener el 'id_usuario' del doctor
        $sql_get_user = "SELECT id_usuario FROM doctores WHERE id_doctor = ?";
        $stmt_get = $conn->prepare($sql_get_user);
        $stmt_get->bind_param("i", $id_doctor);
        $stmt_get->execute();
        $result_get = $stmt_get->get_result();
        if ($result_get->num_rows == 0) {
            throw new Exception("Doctor no encontrado.");
        }
        $id_usuario = $result_get->fetch_assoc()['id_usuario'];
        $stmt_get->close();

        // 2. Actualizar 'usuarios'
        $sql_user = "UPDATE usuarios SET nombre_completo = ?, corre_electronico = ?, status = ? WHERE id_usuario = ?";
        $stmt_user = $conn->prepare($sql_user);
        $stmt_user->bind_param("sssi", $nombre_completo, $email, $estado, $id_usuario);
        $stmt_user->execute();
        
        // 3. Actualizar 'doctores'
        $sql_doc = "UPDATE doctores SET numero_licencia = ?, especialidad = ?, telefono_doctor = ? WHERE id_doctor = ?";
        $stmt_doc = $conn->prepare($sql_doc);
        $stmt_doc->bind_param("sssi", $licencia, $especialidad, $telefono, $id_doctor);
        $stmt_doc->execute();
        
        // 4. Confirmar cambios
        $conn->commit();
        echo json_encode(['status' => 'success', 'message' => 'Doctor actualizado exitosamente.']);
        
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    
    if (isset($stmt_user)) $stmt_user->close();
    if (isset($stmt_doc)) $stmt_doc->close();
}

/**
 * ELIMINA UN DOCTOR (y su usuario asociado, gracias a ON DELETE CASCADE)
 */
function eliminar($conn) {
    if (!isset($_POST['id'])) {
        echo json_encode(['status' => 'error', 'message' => 'ID no proporcionado.']);
        exit;
    }
    $id_doctor = (int)$_POST['id'];
    
    $conn->begin_transaction();
    try {
        // 1. Obtener 'id_usuario' (para saber a quién borrar)
        $sql_get_user = "SELECT id_usuario FROM doctores WHERE id_doctor = ?";
        $stmt_get = $conn->prepare($sql_get_user);
        $stmt_get->bind_param("i", $id_doctor);
        $stmt_get->execute();
        $result_get = $stmt_get->get_result();
        
        if ($result_get->num_rows == 0) {
            throw new Exception("Doctor no encontrado.");
        }
        $id_usuario = $result_get->fetch_assoc()['id_usuario'];
        $stmt_get->close();

        // 2. Borrar el registro de 'usuarios'.
        // La BD está configurada con 'ON DELETE CASCADE',
        // así que esto borrará automáticamente el registro en 'doctores'
        // y también en 'citas', 'historial_medico', etc.
        $sql_delete = "DELETE FROM usuarios WHERE id_usuario = ?";
        $stmt_delete = $conn->prepare($sql_delete);
        $stmt_delete->bind_param("i", $id_usuario);
        $stmt_delete->execute();
        
        if ($stmt_delete->affected_rows > 0) {
            $conn->commit();
            echo json_encode(['status' => 'success', 'message' => 'Doctor eliminado exitosamente.']);
        } else {
            throw new Exception("No se pudo eliminar el usuario asociado.");
        }
        
        $stmt_delete->close();
        
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

?>