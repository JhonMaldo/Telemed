<?php
include 'conexion.php';

header('Content-Type: application/json');

// DEBUG: Agrega esto temporalmente
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $sql = "SELECT rm.*, u.nombre_completo as nombre_paciente 
            FROM receta_medica rm 
            JOIN usuarios u ON rm.id_paciente = u.id_usuario 
            ORDER BY rm.fecha_emision DESC";
    
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception("Error en consulta: " . $conn->error);
    }
    
    $recetas = [];
    while($row = $result->fetch_assoc()) {
        $recetas[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'recetas' => $recetas,
        'total' => count($recetas)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
?>