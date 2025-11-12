<?php
// 1. Incluir conexión
require '../database/conexion.php';

// 2. Nombre del archivo
$filename = "reporte_pacientes_" . date('Y-m-d') . ".csv";

// 3. Encabezados para forzar descarga de CSV
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Pragma: no-cache');
header('Expires: 0');

// 4. Abrir puntero de salida de PHP
$output = fopen('php://output', 'w');

// 5. Escribir la fila de encabezado (columnas)
fputcsv($output, [
    'ID Paciente', 
    'Nombre Completo', 
    'Email', 
    'Telefono', 
    'Fecha Nacimiento', 
    'Genero', 
    'Estado'
]);

// 6. Consulta SQL
$sql = "SELECT p.id_paciente, u.nombre_completo, u.corre_electronico, p.telefono_paciente, p.fecha_nacimiento, p.genero, u.status 
        FROM pacientes p
        JOIN usuarios u ON p.id_usuario = u.id_usuario
        WHERE u.role = 'Paciente'";
$result = $conn->query($sql);

// 7. Escribir los datos fila por fila
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        fputcsv($output, [
            $row['id_paciente'],
            $row['nombre_completo'],
            $row['corre_electronico'],
            $row['telefono_paciente'],
            $row['fecha_nacimiento'],
            $row['genero'],
            $row['status']
        ]);
    }
}

$conn->close();
exit;
?>