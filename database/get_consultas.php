<?php
include 'conexion.php';

header('Content-Type: application/json');

try {
    // Asegúrate que el nombre de la tabla sea correcto
    $sql = "SELECT * FROM consultas ORDER BY fecha_inicio DESC";
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception("Error en consulta: " . $conn->error);
    }
    
    $consultas = [];
    while($row = $result->fetch_assoc()) {
        $consultas[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'consultas' => $consultas,
        'total' => count($consultas)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
?>