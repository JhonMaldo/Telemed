<?php
// 1. Incluir la conexión y la librería FPDF
require '../database/conexion.php';
require 'lib/fpdf.php'; // <-- La librería que descargamos

/**
 * Clase extendida para crear Encabezado y Pie de página
 */
class PDF extends FPDF
{
    // Encabezado
    function Header()
    {
        // Logo (Opcional - puedes poner tu propio logo)
        // $this->Image('path/to/logo.png', 10, 6, 30);
        
        // Arial bold 15
        $this->SetFont('Arial', 'B', 15);
        // Movernos a la derecha
        $this->Cell(80);
        // Título
        $this->Cell(30, 10, utf8_decode('Reporte de Doctores'), 0, 0, 'C');
        // Fecha
        $this->SetFont('Arial', '', 10);
        $this->Cell(80, 10, 'Fecha: ' . date('d/m/Y'), 0, 0, 'R');
        // Salto de línea
        $this->Ln(20);
    }

    // Pie de página
    function Footer()
    {
        // Posición: a 1,5 cm del final
        $this->SetY(-15);
        // Arial italic 8
        $this->SetFont('Arial', 'I', 8);
        // Número de página
        $this->Cell(0, 10, utf8_decode('Página ') . $this->PageNo() . '/{nb}', 0, 0, 'C');
    }
}

// --- CREACIÓN DEL REPORTE ---

// 1. Obtener los datos de la BD
$sql = "SELECT 
            u.nombre_completo, 
            u.corre_electronico, 
            d.especialidad, 
            d.telefono_doctor, 
            u.status 
        FROM doctores d
        JOIN usuarios u ON d.id_usuario = u.id_usuario
        WHERE u.role = 'Doctor'
        ORDER BY u.nombre_completo";

$result = $conn->query($sql);

// 2. Crear el objeto PDF
// 'L' para Landscape (horizontal), 'mm' para milímetros, 'A4' para tamaño
$pdf = new PDF('L', 'mm', 'A4');
$pdf->AliasNbPages(); // Habilita el conteo de páginas
$pdf->AddPage();
$pdf->SetFont('Arial', '', 10);

// 3. Crear el encabezado de la tabla
$pdf->SetFont('Arial', 'B', 10);
$pdf->SetFillColor(230, 230, 230); // Color de fondo gris claro
$pdf->Cell(65, 10, 'Nombre Completo', 1, 0, 'C', true);
$pdf->Cell(65, 10, 'Email', 1, 0, 'C', true);
$pdf->Cell(45, 10, 'Especialidad', 1, 0, 'C', true);
$pdf->Cell(40, 10, utf8_decode('Teléfono'), 1, 0, 'C', true);
$pdf->Cell(25, 10, 'Estado', 1, 1, 'C', true); // 1 al final = Salto de línea
$pdf->SetFont('Arial', '', 9);

// 4. Llenar la tabla con los datos de la BD
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Usamos utf8_decode() para manejar acentos y caracteres especiales
        $pdf->Cell(65, 8, utf8_decode($row['nombre_completo']), 1);
        $pdf->Cell(65, 8, utf8_decode($row['corre_electronico']), 1);
        $pdf->Cell(45, 8, utf8_decode($row['especialidad']), 1);
        $pdf->Cell(40, 8, utf8_decode($row['telefono_doctor']), 1);
        $pdf->Cell(25, 8, utf8_decode($row['status']), 1, 1); // Salto de línea
    }
} else {
    $pdf->Cell(240, 10, 'No se encontraron doctores registrados.', 1, 1, 'C');
}

$conn->close();

// 5. Enviar el PDF al navegador para descarga
$pdf->Output('D', 'Reporte_Doctores_' . date('Y-m-d') . '.pdf');
exit;
?>