<?php
include 'conexion.php';

header('Content-Type: application/json');

try {
    // TEMPORAL: Mostrar todos los usuarios para debug
    $sql = "SELECT id_usuario, nombre_completo, corre_electronico, role, status, creado_en 
            FROM usuarios 
            ORDER BY role, nombre_completo";
    
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception("Error en consulta: " . $conn->error);
    }
    
    $usuarios = [];
    while($row = $result->fetch_assoc()) {
        $usuarios[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'usuarios' => $usuarios,
        'total_usuarios' => count($usuarios),
        'mensaje' => 'Esto muestra TODOS los usuarios. Los pacientes deben tener role="Paciente"'
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
?>