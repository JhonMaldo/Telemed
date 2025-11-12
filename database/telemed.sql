-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: telemed
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `citas`
--

DROP TABLE IF EXISTS `citas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `citas` (
  `id_citas` int(11) NOT NULL AUTO_INCREMENT,
  `id_paciente` int(11) NOT NULL,
  `id_doctor` int(11) NOT NULL,
  `fecha_programada` datetime NOT NULL,
  `duracion_en_minutos` int(11) DEFAULT 30,
  `type` enum('virtual','en_persona') DEFAULT 'virtual',
  `status` enum('programado','completada','cancelada','no_llegó') DEFAULT 'programado',
  `razon` varchar(255) DEFAULT NULL,
  `creado_en` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_citas`),
  KEY `idx_citas_id_paciente` (`id_paciente`),
  KEY `idx_citas_id_doctor` (`id_doctor`),
  KEY `idx_citas_doctor_fecha` (`id_doctor`,`fecha_programada`),
  KEY `idx_citas_status_fecha` (`status`,`fecha_programada`),
  CONSTRAINT `citas_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE,
  CONSTRAINT `citas_ibfk_2` FOREIGN KEY (`id_doctor`) REFERENCES `doctores` (`id_doctor`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1009 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citas`
--

LOCK TABLES `citas` WRITE;
/*!40000 ALTER TABLE `citas` DISABLE KEYS */;
INSERT INTO `citas` VALUES (1001,201,101,'2025-10-01 09:00:00',30,'virtual','programado','Chequeo cardiológico anual','2025-09-28 12:00:00'),(1002,202,102,'2025-10-01 10:00:00',30,'en_persona','completada','Consulta por tos persistente','2025-09-29 09:15:00'),(1003,203,102,'2025-10-02 11:00:00',45,'virtual','programado','Control pediátrico','2025-09-30 14:40:00'),(1004,204,103,'2025-10-03 15:30:00',30,'virtual','programado','Dolor lumbar','2025-10-01 08:20:00'),(1005,205,101,'2025-09-20 16:00:00',30,'en_persona','completada','Mareo y palpitaciones','2025-09-18 11:00:00'),(1006,206,103,'2025-09-22 09:30:00',30,'en_persona','completada','Chequeo general','2025-09-20 10:10:00'),(1007,201,103,'2025-10-05 09:30:00',60,'en_persona','cancelada','Rehabilitación por esguince','2025-09-30 09:00:00'),(1008,202,101,'2025-10-06 14:00:00',30,'virtual','programado','Segunda opinión cardiológica','2025-10-01 10:00:00');
/*!40000 ALTER TABLE `citas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consultas`
--

DROP TABLE IF EXISTS `consultas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consultas` (
  `id_consulta` int(11) NOT NULL AUTO_INCREMENT,
  `id_citas` int(11) DEFAULT NULL,
  `fecha_inicio` datetime DEFAULT NULL,
  `fecha_fin` datetime DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `url_video` varchar(255) DEFAULT NULL,
  `grabado` tinyint(1) DEFAULT 0,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_consulta`),
  UNIQUE KEY `id_citas` (`id_citas`),
  KEY `idx_consultas_id_citas` (`id_citas`),
  KEY `idx_consultas_fecha_creacion` (`fecha_creacion`),
  CONSTRAINT `consultas_ibfk_1` FOREIGN KEY (`id_citas`) REFERENCES `citas` (`id_citas`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3004 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consultas`
--

LOCK TABLES `consultas` WRITE;
/*!40000 ALTER TABLE `consultas` DISABLE KEYS */;
INSERT INTO `consultas` VALUES (3001,1005,'2025-09-20 16:00:00','2025-09-20 16:25:00','Paciente refiere mareo intermitente; se solicita ECG y laboratorio.','https://videos.telemed/consultas/3001',1,'2025-09-20 16:30:00'),(3002,1006,'2025-09-22 09:30:00','2025-09-22 09:50:00','Chequeo general: signos vitales estables. Recomendado control anual.','https://videos.telemed/consultas/3002',0,'2025-09-22 10:00:00'),(3003,1002,'2025-10-01 10:00:00','2025-10-01 10:20:00','Tos aguda: se indica tratamiento sintomático y control en 7 días.','https://videos.telemed/consultas/3003',0,'2025-10-01 10:25:00');
/*!40000 ALTER TABLE `consultas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctores`
--

DROP TABLE IF EXISTS `doctores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctores` (
  `id_doctor` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `numero_licencia` varchar(50) DEFAULT NULL,
  `especialidad` varchar(100) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `telefono_doctor` varchar(30) DEFAULT NULL,
  `creado_en` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_doctor`),
  UNIQUE KEY `numero_licencia` (`numero_licencia`),
  KEY `idx_doctores_id_usuario` (`id_usuario`),
  CONSTRAINT `doctores_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctores`
--

LOCK TABLES `doctores` WRITE;
/*!40000 ALTER TABLE `doctores` DISABLE KEYS */;
INSERT INTO `doctores` VALUES (101,2,'LIC-DF-2020-001','Cardiología','Cardiólogo con 10 años de experiencia en intervenciones mínimamente invasivas.','555-0101','2025-09-02 10:30:00'),(102,3,'LIC-DF-2018-114','Pediatría','Pediatra apasionada por la atención integral del niño y la familia.','555-0102','2025-09-02 10:35:00'),(103,4,'LIC-DF-2016-210','Medicina General','Amplia experiencia en atención primaria y manejo integral de enfermedades crónicas.','555-0103','2025-09-05 09:00:00');
/*!40000 ALTER TABLE `doctores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_medico`
--

DROP TABLE IF EXISTS `historial_medico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_medico` (
  `id_historial_medico` int(11) NOT NULL AUTO_INCREMENT,
  `id_paciente` int(11) NOT NULL,
  `id_doctor` int(11) DEFAULT NULL,
  `tipo_registro` varchar(100) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `creado_en` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_historial_medico`),
  KEY `idx_historial_id_paciente` (`id_paciente`),
  KEY `idx_historial_id_doctor` (`id_doctor`),
  CONSTRAINT `historial_medico_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE,
  CONSTRAINT `historial_medico_ibfk_2` FOREIGN KEY (`id_doctor`) REFERENCES `doctores` (`id_doctor`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5005 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_medico`
--

LOCK TABLES `historial_medico` WRITE;
/*!40000 ALTER TABLE `historial_medico` DISABLE KEYS */;
INSERT INTO `historial_medico` VALUES (5001,205,101,'Alergia','Alergia conocida a la penicilina. Anotar en expediente.','2024-06-15 12:00:00'),(5002,201,103,'Trauma','Esguince de tobillo derecho en 2023; rehabilitación completada.','2023-11-02 09:20:00'),(5003,206,103,'Crónico','Hipertensión controlada con dieta y ejercicio. No medicamentos actuales.','2020-01-20 08:00:00'),(5004,202,102,'Vacunación','Vacunación completa según esquema nacional.','2019-05-10 10:00:00');
/*!40000 ALTER TABLE `historial_medico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
  `id_notificaciones` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) DEFAULT NULL,
  `tipo_notificacion` varchar(50) DEFAULT NULL,
  `mensaje` varchar(500) DEFAULT NULL,
  `leido` tinyint(1) DEFAULT 0,
  `creado_en` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_notificaciones`),
  KEY `idx_notif_id_usuario` (`id_usuario`),
  KEY `idx_notif_usuario_leido_fecha` (`id_usuario`,`leido`,`creado_en`),
  CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7006 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
INSERT INTO `notificaciones` VALUES (1,1,'Bienvenida','¡Hola Mariana López! Te damos la bienvenida a TeleMed.',0,'2025-11-06 22:12:53'),(2,2,'Bienvenida','¡Hola Carlos Méndez! Te damos la bienvenida a TeleMed.',0,'2025-11-06 22:12:53'),(3,3,'Bienvenida','¡Hola Ana Rivera! Te damos la bienvenida a TeleMed.',0,'2025-11-06 22:12:53'),(4,4,'Bienvenida','¡Hola Javier Torres! Te damos la bienvenida a TeleMed.',0,'2025-11-06 22:12:53'),(5,5,'Bienvenida','¡Hola Sofía García! Te damos la bienvenida a TeleMed.',0,'2025-11-06 22:12:53'),(6,6,'Bienvenida','¡Hola Luis Fernández! Te damos la bienvenida a TeleMed.',0,'2025-11-06 22:12:53'),(7,7,'Bienvenida','¡Hola Martín Pérez! Te damos la bienvenida a TeleMed.',0,'2025-11-06 22:12:53'),(8,8,'Bienvenida','¡Hola Valeria Ortiz! Te damos la bienvenida a TeleMed.',0,'2025-11-06 22:12:53'),(9,9,'Bienvenida','¡Hola Diego Hernández! Te damos la bienvenida a TeleMed.',0,'2025-11-06 22:12:53'),(10,10,'Bienvenida','¡Hola Lucía Martínez! Te damos la bienvenida a TeleMed.',0,'2025-11-06 22:12:53'),(11,9,'Consulta completada','Tu consulta (Cita ID: 1005) ha finalizado. Revisa tus notas y recetas.',0,'2025-11-06 22:12:53'),(12,2,'Consulta registrada','Se ha registrado correctamente la consulta para la cita ID: 1005.',0,'2025-11-06 22:12:53'),(13,10,'Consulta completada','Tu consulta (Cita ID: 1006) ha finalizado. Revisa tus notas y recetas.',0,'2025-11-06 22:12:53'),(14,4,'Consulta registrada','Se ha registrado correctamente la consulta para la cita ID: 1006.',0,'2025-11-06 22:12:53'),(15,6,'Consulta completada','Tu consulta (Cita ID: 1002) ha finalizado. Revisa tus notas y recetas.',0,'2025-11-06 22:12:53'),(16,3,'Consulta registrada','Se ha registrado correctamente la consulta para la cita ID: 1002.',0,'2025-11-06 22:12:53'),(7001,1,'AvisoSistema','La base de datos TeleMed fue creada y configurada.',1,'2025-09-01 09:05:00'),(7002,5,'Recordatorio','Tienes una cita programada el 2025-10-01 a las 09:00.',0,'2025-09-29 08:00:00'),(7003,2,'NuevoPaciente','Se ha registrado un nuevo paciente: Sofía García.',0,'2025-09-10 14:10:00'),(7004,9,'Informe','Tu consulta del 20/09 quedó registrada. Revisa tu expediente.',0,'2025-09-20 17:05:00'),(7005,9,'Bienvenida','¡Hola Diego Hernández! Te damos la bienvenida a TeleMed.',0,'2025-09-22 19:06:00');
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pacientes`
--

DROP TABLE IF EXISTS `pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pacientes` (
  `id_paciente` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `genero` enum('M','F') DEFAULT NULL,
  `telefono_paciente` varchar(30) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `contacto_de_emergencia` varchar(150) DEFAULT NULL,
  `creado_en` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_paciente`),
  KEY `idx_pacientes_id_usuario` (`id_usuario`),
  CONSTRAINT `pacientes_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pacientes`
--

LOCK TABLES `pacientes` WRITE;
/*!40000 ALTER TABLE `pacientes` DISABLE KEYS */;
INSERT INTO `pacientes` VALUES (201,5,'1990-04-12','F','555-1001','Calle Luna 123, Cuernavaca, Morelos','Mariana López - 555-0001','2025-09-10 14:05:00'),(202,6,'1985-11-03','M','555-1002','Av. Sol 45, Ciudad de México','Sofía García - 555-1001','2025-09-12 11:35:00'),(203,7,'2002-07-21','M','555-1003','Calle Río 9, Puebla','Valeria Ortiz - 555-1004','2025-09-15 16:50:00'),(204,8,'1998-02-02','F','555-1004','Blvd. Central 77, Toluca','Luis Fernández - 555-1002','2025-09-20 09:15:00'),(205,9,'2000-12-30','M','555-1005','Av. Reforma 1000, CDMX','Lucía Martínez - 555-1006','2025-09-22 19:10:00'),(206,10,'1975-06-14','F','555-1006','Calle Verde 3, Monterrey','Carlos Méndez - 555-0101','2025-09-25 08:00:00');
/*!40000 ALTER TABLE `pacientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagos`
--

DROP TABLE IF EXISTS `pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagos` (
  `id_pagos` int(11) NOT NULL AUTO_INCREMENT,
  `id_citas` int(11) DEFAULT NULL,
  `cantidad` decimal(10,2) DEFAULT 0.00,
  `status` enum('pendiente','pagado','reembolsado') DEFAULT 'pendiente',
  `pagado_en` datetime DEFAULT NULL,
  `creado_en` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_pagos`),
  KEY `idx_pagos_id_citas` (`id_citas`),
  KEY `idx_pagos_status_pagado_en` (`status`,`pagado_en`),
  CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`id_citas`) REFERENCES `citas` (`id_citas`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6007 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos`
--

LOCK TABLES `pagos` WRITE;
/*!40000 ALTER TABLE `pagos` DISABLE KEYS */;
INSERT INTO `pagos` VALUES (6001,1005,500.00,'pagado','2025-09-19 12:00:00','2025-09-18 11:05:00'),(6002,1006,350.00,'pagado','2025-09-22 10:00:00','2025-09-22 09:55:00'),(6003,1001,700.00,'pendiente',NULL,'2025-09-28 12:05:00'),(6004,1002,250.00,'pendiente',NULL,'2025-09-29 09:20:00'),(6005,1003,0.00,'reembolsado','2025-09-30 17:00:00','2025-09-30 15:00:00'),(6006,1008,800.00,'pendiente',NULL,'2025-10-01 10:02:00');
/*!40000 ALTER TABLE `pagos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receta_medica`
--

DROP TABLE IF EXISTS `receta_medica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receta_medica` (
  `id_receta_medica` int(11) NOT NULL AUTO_INCREMENT,
  `id_consulta` int(11) DEFAULT NULL,
  `id_doctor` int(11) DEFAULT NULL,
  `id_paciente` int(11) DEFAULT NULL,
  `la_receta` text DEFAULT NULL,
  `url_pdf` varchar(255) DEFAULT NULL,
  `fecha_emision` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_receta_medica`),
  KEY `idx_receta_id_consulta` (`id_consulta`),
  KEY `idx_receta_id_doctor` (`id_doctor`),
  KEY `idx_receta_id_paciente` (`id_paciente`),
  CONSTRAINT `receta_medica_ibfk_1` FOREIGN KEY (`id_consulta`) REFERENCES `consultas` (`id_consulta`) ON DELETE SET NULL,
  CONSTRAINT `receta_medica_ibfk_2` FOREIGN KEY (`id_doctor`) REFERENCES `doctores` (`id_doctor`) ON DELETE SET NULL,
  CONSTRAINT `receta_medica_ibfk_3` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4004 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receta_medica`
--

LOCK TABLES `receta_medica` WRITE;
/*!40000 ALTER TABLE `receta_medica` DISABLE KEYS */;
INSERT INTO `receta_medica` VALUES (4001,3001,101,205,'Reposo relativo, omeprazol 20 mg 1 vez al día por 4 semanas.','https://docs.telemed/recetas/4001.pdf','2025-09-20 17:00:00'),(4002,3003,102,202,'Jarabe expectorante 10 ml cada 8 horas por 5 días. Hidratación frecuente.','https://docs.telemed/recetas/4002.pdf','2025-10-01 10:30:00'),(4003,3002,103,206,'Multivitamínico diario durante un mes. Control en 6 meses.','https://docs.telemed/recetas/4003.pdf','2025-09-22 10:05:00');
/*!40000 ALTER TABLE `receta_medica` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registros_chatbot`
--

DROP TABLE IF EXISTS `registros_chatbot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registros_chatbot` (
  `id_registro` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) DEFAULT NULL,
  `mensaje_usuario` text DEFAULT NULL,
  `respuesta_bot` text DEFAULT NULL,
  `creado_en` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_registro`),
  KEY `idx_chat_id_usuario` (`id_usuario`),
  CONSTRAINT `registros_chatbot_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8005 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registros_chatbot`
--

LOCK TABLES `registros_chatbot` WRITE;
/*!40000 ALTER TABLE `registros_chatbot` DISABLE KEYS */;
INSERT INTO `registros_chatbot` VALUES (8001,5,'¿Cómo agendo una cita?','Puedes agendar desde tu perfil -> Citas -> Nueva cita.','2025-09-10 14:12:00'),(8002,6,'¿Puedo cambiar la cita?','Sí — revisa la cita y selecciona \"Reprogramar\".','2025-09-29 09:25:00'),(8003,9,'¿Dónde veo mi receta?','En tu consulta, sección Recetas -> Descargar PDF.','2025-09-20 17:10:00'),(8004,9,'¿Cómo elimino mi cuenta?','Contacta al administrador para solicitar desactivación.','2025-09-25 08:05:00');
/*!40000 ALTER TABLE `registros_chatbot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_completo` varchar(150) NOT NULL,
  `corre_electronico` varchar(150) NOT NULL,
  `contrasenia_hash` varchar(255) NOT NULL,
  `role` enum('Administrador','Doctor','Paciente') NOT NULL,
  `creado_en` datetime DEFAULT current_timestamp(),
  `status` enum('Activo','Inactivo','Suspendido') DEFAULT 'Activo',
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `corre_electronico` (`corre_electronico`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Mariana López','mariana.lopez@admin.com','$2y$10$hash_admin1','Administrador','2025-09-01 09:00:00','Activo'),(2,'Carlos Méndez','carlos.mendez@clinica.com','$2y$10$hash_doc1','Doctor','2025-09-02 10:15:00','Activo'),(3,'Ana Rivera','ana.rivera@clinica.com','$2y$10$hash_doc2','Doctor','2025-09-02 10:20:00','Activo'),(4,'Javier Torres','javier.torres@clinica.com','$2y$10$hash_doc3','Doctor','2025-09-05 08:45:00','Activo'),(5,'Sofía García','sofia.garcia@gmail.com','$2y$10$hash_pac1','Paciente','2025-09-10 14:00:00','Activo'),(6,'Luis Fernández','luis.fernandezg@mail.com','$2y$10$hash_pac2','Paciente','2025-09-12 11:30:00','Activo'),(7,'Martín Pérez','martin.perez@gmail.com','$2y$10$hash_pac3','Paciente','2025-09-15 16:45:00','Activo'),(8,'Valeria Ortiz','valeria.ortiz@gmail.com','$2y$10$hash_pac4','Paciente','2025-09-20 09:10:00','Activo'),(9,'Diego Hernández','diego.hernandez@gmail.com','$2y$10$hash_pac5','Paciente','2025-09-22 19:05:00','Activo'),(10,'Lucía Martínez','lucia.martinez@gmail.com','$2y$10$hash_pac6','Paciente','2025-09-25 07:55:00','Activo');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-06 22:34:01
