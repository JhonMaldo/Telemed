<?php
require '../database/conexion.php';
header('Content-Type: application/json');

$accion = $_REQUEST['accion'] ?? null;

if (!$accion) {
    echo json_encode(['status' => 'error', 'message' => 'No se especificó ninguna acción.']);
    exit;
}

$response = ['status' => 'error', 'message' => 'Acción no válida.'];

switch ($accion) {
    case 'stats_citas':
        $response = obtener_stats_citas($conn);
        break;
    case 'stats_financiero':
        $response = obtener_stats_financiero($conn);
        break;
}

echo json_encode($response);
$conn->close();


/**
 * OBTIENE ESTADÍSTICAS DE CITAS
 */
function obtener_stats_citas($conn) {
    try {
        $stats = [];

        // Tarjetas de estadísticas
        $stats['total'] = $conn->query("SELECT COUNT(*) as total FROM citas")->fetch_assoc()['total'] ?? 0;
        $stats['completadas'] = $conn->query("SELECT COUNT(*) as total FROM citas WHERE status = 'completada'")->fetch_assoc()['total'] ?? 0;
        $stats['programadas'] = $conn->query("SELECT COUNT(*) as total FROM citas WHERE status = 'programado'")->fetch_assoc()['total'] ?? 0;
        $stats['canceladas'] = $conn->query("SELECT COUNT(*) as total FROM citas WHERE status = 'cancelada'")->fetch_assoc()['total'] ?? 0;

        // Top 3 Doctores
        $sql_top_docs = "SELECT 
                            u.nombre_completo, 
                            d.especialidad, 
                            COUNT(c.id_citas) AS total_citas
                        FROM citas c
                        JOIN doctores d ON c.id_doctor = d.id_doctor
                        JOIN usuarios u ON d.id_usuario = u.id_usuario
                        WHERE c.status = 'completada'
                        GROUP BY c.id_doctor
                        ORDER BY total_citas DESC
                        LIMIT 3";
        
        $result_docs = $conn->query($sql_top_docs);
        $top_doctores = [];
        if ($result_docs) {
            while($row = $result_docs->fetch_assoc()) {
                $top_doctores[] = $row;
            }
        }
        $stats['top_doctores'] = $top_doctores;

        return ['status' => 'success', 'data' => $stats];

    } catch (Exception $e) {
        return ['status' => 'error', 'message' => $e->getMessage()];
    }
}


/**
 * OBTIENE ESTADÍSTICAS FINANCIERAS
 */
function obtener_stats_financiero($conn) {
    try {
        $stats = [];

        // Tarjetas de estadísticas (usando la tabla 'pagos')
        $stats['ingresos_totales'] = $conn->query("SELECT SUM(cantidad) as total FROM pagos WHERE status = 'pagado'")->fetch_assoc()['total'] ?? 0;
        $stats['pagos_pendientes'] = $conn->query("SELECT COUNT(*) as total FROM pagos WHERE status = 'pendiente'")->fetch_assoc()['total'] ?? 0;
        $stats['total_reembolsado'] = $conn->query("SELECT SUM(cantidad) as total FROM pagos WHERE status = 'reembolsado'")->fetch_assoc()['total'] ?? 0;

        // Últimas 5 Transacciones
        $sql_ultimos_pagos = "SELECT 
                                p.id_pagos,
                                u.nombre_completo AS paciente_nombre,
                                p.cantidad,
                                p.pagado_en
                            FROM pagos p
                            JOIN citas c ON p.id_citas = c.id_citas
                            JOIN pacientes pac ON c.id_paciente = pac.id_paciente
                            JOIN usuarios u ON pac.id_usuario = u.id_usuario
                            WHERE p.status = 'pagado' AND p.pagado_en IS NOT NULL
                            ORDER BY p.pagado_en DESC
                            LIMIT 5";
        
        $result_pagos = $conn->query($sql_ultimos_pagos);
        $ultimos_pagos = [];
        if ($result_pagos) {
            while($row = $result_pagos->fetch_assoc()) {
                $ultimos_pagos[] = $row;
            }
        }
        $stats['ultimos_pagos'] = $ultimos_pagos;

        return ['status' => 'success', 'data' => $stats];

    } catch (Exception $e) {
        return ['status' => 'error', 'message' => $e->getMessage()];
    }
}
?>