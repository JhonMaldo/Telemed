<?php
include 'conexion.php';

header('Content-Type: application/json');

try {
    $sql = "SELECT e.*, u.nombre_completo as nombre_paciente 
            FROM expedientes e 
            JOIN usuarios u ON e.id_paciente = u.id_usuario 
            ORDER BY u.nombre_completo";
    
    $result = $conn->query($sql);
    
    $expedientes = [];
    while($row = $result->fetch_assoc()) {
        $expedientes[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'expedientes' => $expedientes
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
?>