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
    case 'obtener_listado_pacientes':
        obtener_listado_pacientes($conn);
        break;
    case 'obtener_listado_doctores':
        obtener_listado_doctores($conn);
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
        echo json_encode(['status' => 'error', 'message' => 'Acción no válida: ' . $accion]);
        break;
}

$conn->close();

/**
 * OBTIENE TODAS LAS CITAS (para la tabla principal)
 * Esta es una consulta compleja que une 4 tablas
 */
function obtener_todos($conn) {
    $sql = "SELECT 
                c.id_citas AS id,
                up.nombre_completo AS paciente_nombre,
                ud.nombre_completo AS doctor_nombre,
                DATE_FORMAT(c.fecha_programada, '%d %b, %Y') AS fecha,
                DATE_FORMAT(c.fecha_programada, '%h:%i %p') AS hora,
                c.type AS tipo,
                c.status AS estado
            FROM citas c
            JOIN pacientes p ON c.id_paciente = p.id_paciente
            JOIN usuarios up ON p.id_usuario = up.id_usuario
            JOIN doctores d ON c.id_doctor = d.id_doctor
            JOIN usuarios ud ON d.id_usuario = ud.id_usuario
            ORDER BY c.fecha_programada DESC";
    
    $result = $conn->query($sql);
    $citas = [];
    if ($result) {
        while($row = $result->fetch_assoc()) {
            $citas[] = $row;
        }
        echo json_encode($citas);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error al obtener citas: ' . $conn->error]);
    }
}

/**
 * OBTIENE LISTA SIMPLE DE PACIENTES (para el modal)
 */
function obtener_listado_pacientes($conn) {
    $sql = "SELECT p.id_paciente, u.nombre_completo 
            FROM pacientes p
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            WHERE u.status = 'Activo'
            ORDER BY u.nombre_completo";
    $result = $conn->query($sql);
    $pacientes = [];
    if ($result) {
        while($row = $result->fetch_assoc()) {
            $pacientes[] = $row;
        }
        echo json_encode(['status' => 'success', 'data' => $pacientes]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error al obtener pacientes: ' . $conn->error]);
    }
}

/**
 * OBTIENE LISTA SIMPLE DE DOCTORES (para el modal)
 */
function obtener_listado_doctores($conn) {
    $sql = "SELECT d.id_doctor, u.nombre_completo 
            FROM doctores d
            JOIN usuarios u ON d.id_usuario = u.id_usuario
            WHERE u.status = 'Activo'
            ORDER BY u.nombre_completo";
    $result = $conn->query($sql);
    $doctores = [];
    if ($result) {
        while($row = $result->fetch_assoc()) {
            $doctores[] = $row;
        }
        echo json_encode(['status' => 'success', 'data' => $doctores]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error al obtener doctores: ' . $conn->error]);
    }
}

/**
 * OBTIENE UNA SOLA CITA (para el modal 'Editar')
 */
function obtener_uno($conn) {
    if (!isset($_POST['id'])) {
        echo json_encode(['status' => 'error', 'message' => 'ID no proporcionado.']);
        exit;
    }
    $id = (int)$_POST['id'];
    
    // Necesitamos la fecha y hora por separado para los inputs
    $sql = "SELECT 
                id_citas,
                id_paciente,
                id_doctor,
                DATE(fecha_programada) AS fecha,
                TIME(fecha_programada) AS hora,
                type,
                status,
                razon
            FROM citas
            WHERE id_citas = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        echo json_encode($result->fetch_assoc());
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Cita no encontrada.']);
    }
    $stmt->close();
}

/**
 * AGREGA UNA NUEVA CITA
 */
function agregar($conn) {
    $id_paciente = (int)$_POST['cita-paciente'];
    $id_doctor = (int)$_POST['cita-doctor'];
    // Combinamos fecha y hora en un DATETIME
    $fecha_programada = $_POST['cita-fecha'] . ' ' . $_POST['cita-hora'];
    $tipo = $_POST['cita-tipo'];
    $status = $_POST['cita-status'];
    $razon = $_POST['cita-razon'] ?? '';

    // Tu tabla 'citas' SÍ tiene id_citas como AUTO_INCREMENT, así que no necesitamos calcularlo
    $sql = "INSERT INTO citas (id_paciente, id_doctor, fecha_programada, type, status, razon) 
            VALUES (?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iissss", $id_paciente, $id_doctor, $fecha_programada, $tipo, $status, $razon);
    
    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Cita agregada exitosamente.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error al agregar la cita: ' . $stmt->error]);
    }
    $stmt->close();
}

/**
 * EDITA UNA CITA EXISTENTE
 */
function editar($conn) {
    $id_citas = (int)$_POST['cita-id'];
    if ($id_citas == 0) {
        echo json_encode(['status' => 'error', 'message' => 'ID de cita no válido.']);
        exit;
    }

    $id_paciente = (int)$_POST['cita-paciente'];
    $id_doctor = (int)$_POST['cita-doctor'];
    $fecha_programada = $_POST['cita-fecha'] . ' ' . $_POST['cita-hora'];
    $tipo = $_POST['cita-tipo'];
    $status = $_POST['cita-status'];
    $razon = $_POST['cita-razon'] ?? '';

    $sql = "UPDATE citas SET 
                id_paciente = ?,
                id_doctor = ?,
                fecha_programada = ?,
                type = ?,
                status = ?,
                razon = ?
            WHERE id_citas = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iissssi", $id_paciente, $id_doctor, $fecha_programada, $tipo, $status, $razon, $id_citas);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Cita actualizada exitosamente.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error al actualizar la cita: ' . $stmt->error]);
    }
    $stmt->close();
}

/**
 * ELIMINA UNA CITA
 */
function eliminar($conn) {
    if (!isset($_POST['id'])) {
        echo json_encode(['status' => 'error', 'message' => 'ID no proporcionado.']);
        exit;
    }
    $id_citas = (int)$_POST['id'];

    // Esto es un borrado simple, ya que 'citas' no es padre de otras tablas críticas
    $sql = "DELETE FROM citas WHERE id_citas = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id_citas);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(['status' => 'success', 'message' => 'Cita eliminada exitosamente.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'No se encontró la cita para eliminar.']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error al eliminar la cita: ' . $stmt->error]);
    }
    $stmt->close();
}
?>