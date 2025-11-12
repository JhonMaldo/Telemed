<?php
require '../database/conexion.php';
header('Content-Type: application/json');

// Usamos $_REQUEST para aceptar tanto GET (para obtener) como POST (para guardar)
$accion = $_REQUEST['accion'] ?? null;

if (!$accion) {
    echo json_encode(['status' => 'error', 'message' => 'No se especificó ninguna acción.']);
    exit;
}

switch ($accion) {
    case 'obtener':
        obtener_config($conn);
        break;
    case 'guardar':
        guardar_config($conn);
        break;
    default:
        echo json_encode(['status' => 'error', 'message' => 'Acción no válida.']);
        break;
}

$conn->close();

/**
 * OBTIENE LA FILA ÚNICA de configuración
 */
function obtener_config($conn) {
    $sql = "SELECT * FROM configuracion WHERE id = 1";
    $result = $conn->query($sql);
    
    if ($result && $result->num_rows > 0) {
        $config = $result->fetch_assoc();
        echo json_encode(['status' => 'success', 'data' => $config]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No se pudo cargar la configuración: ' . $conn->error]);
    }
}

/**
 * ACTUALIZA LA FILA ÚNICA de configuración
 */
function guardar_config($conn) {
    // Recoger todos los datos del formulario POST
    $nombre = $_POST['clinic-name'] ?? '';
    $direccion = $_POST['clinic-address'] ?? '';
    $telefono = $_POST['clinic-phone'] ?? '';
    $email = $_POST['clinic-email'] ?? '';
    $duracion = (int)($_POST['appointment-duration'] ?? 30);
    $inicio = $_POST['work-start'] ?? '08:00';
    $fin = $_POST['work-end'] ?? '18:00';

    $sql = "UPDATE configuracion SET 
                nombre_clinica = ?,
                direccion_clinica = ?,
                telefono_clinica = ?,
                email_clinica = ?,
                duracion_cita = ?,
                hora_inicio = ?,
                hora_fin = ?
            WHERE id = 1"; // Siempre actualizamos la fila con id=1

    $stmt = $conn->prepare($sql);
    // s = string, i = integer
    $stmt->bind_param("ssssiss", $nombre, $direccion, $telefono, $email, $duracion, $inicio, $fin);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Configuración guardada exitosamente.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error al guardar la configuración: ' . $stmt->error]);
    }
    $stmt->close();
}
?>