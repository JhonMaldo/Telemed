<?php
require '../database/conexion.php';
header('Content-Type: application/json');

$accion = $_POST['accion'] ?? $_GET['accion'] ?? null;

if (!$accion) {
    echo json_encode(['status' => 'error', 'message' => 'No se especificó ninguna acción.']);
    exit;
}

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

$conn->close();

/**
 * OBTIENE TODOS LOS PACIENTES (para la tabla principal)
 * Incluye un cálculo de EDAD usando la fecha de nacimiento
 */
function obtener_todos($conn) {
    $sql = "SELECT 
                p.id_paciente AS id,
                SUBSTRING_INDEX(u.nombre_completo, ' ', 1) AS nombre,
                SUBSTRING(u.nombre_completo, LENGTH(SUBSTRING_INDEX(u.nombre_completo, ' ', 1)) + 2) AS apellido,
                u.corre_electronico AS email,
                p.telefono_paciente AS telefono,
                TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS edad,
                p.genero,
                u.status AS estado
            FROM pacientes p
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            WHERE u.role = 'Paciente'";
    
    $result = $conn->query($sql);
    $pacientes = [];
    if ($result) {
        while($row = $result->fetch_assoc()) {
            $pacientes[] = $row;
        }
        echo json_encode($pacientes);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error al obtener pacientes: ' . $conn->error]);
    }
}

/**
 * OBTIENE UN SOLO PACIENTE (para el modal 'Editar')
 */
function obtener_uno($conn) {
    if (!isset($_POST['id'])) {
        echo json_encode(['status' => 'error', 'message' => 'ID no proporcionado.']);
        exit;
    }
    $id = (int)$_POST['id'];
    
    $sql = "SELECT 
                p.id_paciente AS id,
                SUBSTRING_INDEX(u.nombre_completo, ' ', 1) AS nombre,
                SUBSTRING(u.nombre_completo, LENGTH(SUBSTRING_INDEX(u.nombre_completo, ' ', 1)) + 2) AS apellido,
                u.corre_electronico AS email,
                p.telefono_paciente AS telefono,
                p.fecha_nacimiento,
                p.genero,
                p.direccion,
                u.status AS estado
            FROM pacientes p
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            WHERE p.id_paciente = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        echo json_encode($result->fetch_assoc());
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Paciente no encontrado.']);
    }
    $stmt->close();
}

/**
 * AGREGA UN NUEVO PACIENTE (requiere transacción)
 */
function agregar($conn) {
    // Recoger datos del formulario (gracias a los atributos 'name')
    $nombre = $_POST['patient-firstname'] ?? '';
    $apellido = $_POST['patient-lastname'] ?? '';
    $email = $_POST['patient-email'] ?? '';
    $telefono = $_POST['patient-phone'] ?? '';
    $fecha_nacimiento = $_POST['patient-birthdate'] ?? '';
    $genero = $_POST['patient-gender'] ?? '';
    $direccion = $_POST['patient-address'] ?? '';
    $estado = $_POST['patient-status'] ?? 'Activo';
    
    $nombre_completo = $nombre . ' ' . $apellido;
    $password_hash = password_hash(uniqid(), PASSWORD_DEFAULT);
    $role = 'Paciente';

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

        // 2. Obtener el siguiente ID para 'pacientes' (no es AUTO_INCREMENT)
        // Usamos 201 como base (según tu .sql)
        $result_max_id = $conn->query("SELECT MAX(id_paciente) + 1 AS next_id FROM pacientes");
        $next_id = $result_max_id->fetch_assoc()['next_id'];
        if ($next_id == NULL) $next_id = 201;

        // 3. Insertar en 'pacientes'
        $sql_pac = "INSERT INTO pacientes (id_paciente, id_usuario, fecha_nacimiento, genero, telefono_paciente, direccion) 
                    VALUES (?, ?, ?, ?, ?, ?)";
        $stmt_pac = $conn->prepare($sql_pac);
        $stmt_pac->bind_param("iissss", $next_id, $id_usuario_nuevo, $fecha_nacimiento, $genero, $telefono, $direccion);
        $stmt_pac->execute();

        if ($stmt_pac->affected_rows == 0) {
             throw new Exception("Error al crear el perfil del paciente: " . $stmt_pac->error);
        }

        $conn->commit();
        echo json_encode(['status' => 'success', 'message' => 'Paciente agregado exitosamente.']);

    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    
    if (isset($stmt_user)) $stmt_user->close();
    if (isset($stmt_pac)) $stmt_pac->close();
}

/**
 * EDITA UN PACIENTE EXISTENTE (requiere transacción)
 */
function editar($conn) {
    $id_paciente = (int)($_POST['patient-id'] ?? 0);
    if ($id_paciente == 0) {
        echo json_encode(['status' => 'error', 'message' => 'ID de paciente no válido.']);
        exit;
    }
    
    $nombre = $_POST['patient-firstname'] ?? '';
    $apellido = $_POST['patient-lastname'] ?? '';
    $email = $_POST['patient-email'] ?? '';
    $telefono = $_POST['patient-phone'] ?? '';
    $fecha_nacimiento = $_POST['patient-birthdate'] ?? '';
    $genero = $_POST['patient-gender'] ?? '';
    $direccion = $_POST['patient-address'] ?? '';
    $estado = $_POST['patient-status'] ?? 'Activo';
    
    $nombre_completo = $nombre . ' ' . $apellido;

    $conn->begin_transaction();
    
    try {
        // 1. Obtener el 'id_usuario' del paciente
        $stmt_get = $conn->prepare("SELECT id_usuario FROM pacientes WHERE id_paciente = ?");
        $stmt_get->bind_param("i", $id_paciente);
        $stmt_get->execute();
        $result_get = $stmt_get->get_result();
        if ($result_get->num_rows == 0) {
            throw new Exception("Paciente no encontrado.");
        }
        $id_usuario = $result_get->fetch_assoc()['id_usuario'];
        $stmt_get->close();

        // 2. Actualizar 'usuarios'
        $stmt_user = $conn->prepare("UPDATE usuarios SET nombre_completo = ?, corre_electronico = ?, status = ? WHERE id_usuario = ?");
        $stmt_user->bind_param("sssi", $nombre_completo, $email, $estado, $id_usuario);
        $stmt_user->execute();
        
        // 3. Actualizar 'pacientes'
        $stmt_pac = $conn->prepare("UPDATE pacientes SET fecha_nacimiento = ?, genero = ?, telefono_paciente = ?, direccion = ? WHERE id_paciente = ?");
        $stmt_pac->bind_param("ssssi", $fecha_nacimiento, $genero, $telefono, $direccion, $id_paciente);
        $stmt_pac->execute();
        
        $conn->commit();
        echo json_encode(['status' => 'success', 'message' => 'Paciente actualizado exitosamente.']);
        
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    
    if (isset($stmt_user)) $stmt_user->close();
    if (isset($stmt_pac)) $stmt_pac->close();
}

/**
 * ELIMINA UN PACIENTE (y su usuario asociado, gracias a ON DELETE CASCADE)
 */
function eliminar($conn) {
    if (!isset($_POST['id'])) {
        echo json_encode(['status' => 'error', 'message' => 'ID no proporcionado.']);
        exit;
    }
    $id_paciente = (int)$_POST['id'];
    
    $conn->begin_transaction();
    try {
        // 1. Obtener 'id_usuario'
        $stmt_get = $conn->prepare("SELECT id_usuario FROM pacientes WHERE id_paciente = ?");
        $stmt_get->bind_param("i", $id_paciente);
        $stmt_get->execute();
        $result_get = $stmt_get->get_result();
        
        if ($result_get->num_rows == 0) {
            throw new Exception("Paciente no encontrado.");
        }
        $id_usuario = $result_get->fetch_assoc()['id_usuario'];
        $stmt_get->close();

        // 2. Borrar el registro de 'usuarios'.
        // ON DELETE CASCADE borrará automáticamente 'pacientes' y sus 'citas'.
        $stmt_delete = $conn->prepare("DELETE FROM usuarios WHERE id_usuario = ?");
        $stmt_delete->bind_param("i", $id_usuario);
        $stmt_delete->execute();
        
        if ($stmt_delete->affected_rows > 0) {
            $conn->commit();
            echo json_encode(['status' => 'success', 'message' => 'Paciente eliminado exitosamente.']);
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