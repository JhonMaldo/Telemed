<?php
// Usamos la misma conexión del admin
require '../database/conexion.php'; 
session_start(); // Iniciamos sesión para guardar quién es el usuario

header('Content-Type: application/json');
$response = ['status' => 'error', 'message' => 'Acción no válida.'];

// --- INICIO DE LA CORRECCIÓN ---

// 1. Intentar leer JSON (para el login)
$data = json_decode(file_get_contents('php://input'), true);

// 2. Asignar $accion desde JSON (si existe) o desde $_POST (si no)
// Esto permite que el script acepte tanto JSON (login) como FormData (registro)
$accion = $data['accion'] ?? $_POST['accion'] ?? null; 

// --- FIN DE LA CORRECCIÓN ---


if ($accion === 'login_usuario') {
    // Si la acción es login, los datos DEBEN estar en $data (JSON)
    $response = login_usuario($conn, $data);
} elseif ($accion === 'registrar_paciente') {
    // Si la acción es registro, los datos DEBEN estar en $_POST (FormData)
    $response = registrar_paciente($conn, $_POST);
}

echo json_encode($response);
$conn->close();


/**
 * MANEJA EL INICIO DE SESIÓN
 * (Función sin cambios)
 */
function login_usuario($conn, $data) {
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $role_esperado = $data['role'] ?? ''; // 'Paciente', 'Doctor', 'Administrador'

    if (empty($email) || empty($password) || empty($role_esperado)) {
        return ['status' => 'error', 'message' => 'Faltan datos.'];
    }

    $sql = "SELECT id_usuario, nombre_completo, contrasenia_hash, role 
            FROM usuarios 
            WHERE corre_electronico = ? AND role = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $email, $role_esperado);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        
        if (password_verify($password, $user['contrasenia_hash'])) {
            $_SESSION['id_usuario'] = $user['id_usuario'];
            $_SESSION['nombre_usuario'] = $user['nombre_completo'];
            $_SESSION['role'] = $user['role'];

            $redirect_url = 'login.html'; // Default
            if ($user['role'] === 'Administrador') $redirect_url = 'admin.html';
            // if ($user['role'] === 'Doctor') $redirect_url = 'doctor.html';
            // if ($user['role'] === 'Paciente') $redirect_url = 'paciente.html';

            return ['status' => 'success', 'message' => 'Inicio de sesión exitoso.', 'redirect' => $redirect_url];
        }
    }
    
    return ['status' => 'error', 'message' => 'Correo o contraseña incorrectos para este tipo de usuario.'];
}


/**
 * MANEJA EL REGISTRO DE PACIENTES
 * (Función sin cambios)
 */
function registrar_paciente($conn, $data) {
    $nombre = $data['patient-name'] ?? '';
    $email = $data['patient-email'] ?? '';
    $telefono = $data['patient-phone'] ?? '';
    $fecha_nacimiento = $data['patient-birthdate'] ?? '';
    $genero = $data['patient-gender'] ?? '';
    $password = $data['patient-password'] ?? '';
    
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    $role = 'Paciente';
    $estado = 'Activo';

    $conn->begin_transaction();
    
    try {
        // 1. Insertar en 'usuarios'
        $sql_user = "INSERT INTO usuarios (nombre_completo, corre_electronico, contrasenia_hash, role, status) 
                     VALUES (?, ?, ?, ?, ?)";
        $stmt_user = $conn->prepare($sql_user);
        $stmt_user->bind_param("sssss", $nombre, $email, $password_hash, $role, $estado);
        $stmt_user->execute();
        
        $id_usuario_nuevo = $conn->insert_id;
        
        if ($id_usuario_nuevo == 0) {
            throw new Exception("Error al crear el usuario: " . $stmt_user->error);
        }

        // 2. Obtener el siguiente ID para 'pacientes' (base 201)
        $result_max_id = $conn->query("SELECT MAX(id_paciente) + 1 AS next_id FROM pacientes");
        $next_id = $result_max_id->fetch_assoc()['next_id'];
        if ($next_id == NULL) $next_id = 201;

        // 3. Insertar en 'pacientes'
        $sql_pac = "INSERT INTO pacientes (id_paciente, id_usuario, fecha_nacimiento, genero, telefono_paciente) 
                    VALUES (?, ?, ?, ?, ?)";
        $stmt_pac = $conn->prepare($sql_pac);
        $stmt_pac->bind_param("iisss", $next_id, $id_usuario_nuevo, $fecha_nacimiento, $genero, $telefono);
        $stmt_pac->execute();

        if ($stmt_pac->affected_rows == 0) {
             throw new Exception("Error al crear el perfil del paciente: " . $stmt_pac->error);
        }

        $conn->commit();
        return ['status' => 'success', 'message' => '¡Registro exitoso! Ya puedes iniciar sesión.'];

    } catch (Exception $e) {
        $conn->rollback();
        if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
             return ['status' => 'error', 'message' => 'Error: El correo electrónico ya está registrado.'];
        }
        return ['status' => 'error', 'message' => 'Error en el registro: ' . $e->getMessage()];
    }
}
?>