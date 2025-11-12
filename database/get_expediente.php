<?php
include 'conexion.php';

header('Content-Type: application/json');

$id_paciente = $_GET['id_paciente'] ?? '';

if (empty($id_paciente)) {
    echo json_encode(['success' => false, 'error' => 'ID de paciente requerido']);
    exit;
}

try {
    $sql = "SELECT e.*, u.nombre_completo as nombre_paciente, u.corre_electronico
            FROM expedientes e 
            JOIN usuarios u ON e.id_paciente = u.id_usuario 
            WHERE e.id_paciente = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id_paciente);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $expediente = $result->fetch_assoc();
    
    if ($expediente) {
        echo json_encode([
            'success' => true,
            'expediente' => $expediente
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Expediente no encontrado'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
?>