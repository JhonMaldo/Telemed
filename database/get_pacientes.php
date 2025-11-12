<?php
include 'conexion.php';

header('Content-Type: application/json');

try {
    // CORREGIDO: 'Activo' en lugar de 'Active'
    $sql = "SELECT id_usuario, nombre_completo, corre_electronico, creado_en 
            FROM usuarios 
            WHERE role = 'Paciente' AND status = 'Activo' 
            ORDER BY nombre_completo";
    
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception("Error en consulta: " . $conn->error);
    }
    
    $pacientes = [];
    while($row = $result->fetch_assoc()) {
        $pacientes[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'pacientes' => $pacientes,
        'total' => count($pacientes)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
?>