-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: ganesh_festival
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_user`
--

DROP TABLE IF EXISTS `admin_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('ADMIN','SUPERADMIN') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_6etwowal6qxvr7xuvqcqmnnk7` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_user`
--

LOCK TABLES `admin_user` WRITE;
/*!40000 ALTER TABLE `admin_user` DISABLE KEYS */;
INSERT INTO `admin_user` VALUES (1,'admin@ganeshfest.local','Committee Admin','$2a$10$OEioFv6xrMYzXuMuR8gWsei/TB2KtuBBvJyXDO4wzu/iAHLLALgZS','SUPERADMIN');
/*!40000 ALTER TABLE `admin_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `annadanam_sponsor`
--

DROP TABLE IF EXISTS `annadanam_sponsor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `annadanam_sponsor` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(12,2) DEFAULT NULL,
  `contact` varchar(255) DEFAULT NULL,
  `meal_count` int DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `sponsor_name` varchar(255) NOT NULL,
  `festival_day_id` bigint NOT NULL,
  `festival_year_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKlswrjrlkdao0jtn4oarc88cw7` (`festival_day_id`),
  KEY `FKsd5kgacr630hqqs8vuwi62d42` (`festival_year_id`),
  CONSTRAINT `FKlswrjrlkdao0jtn4oarc88cw7` FOREIGN KEY (`festival_day_id`) REFERENCES `festival_day` (`id`),
  CONSTRAINT `FKsd5kgacr630hqqs8vuwi62d42` FOREIGN KEY (`festival_year_id`) REFERENCES `festival_year` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `annadanam_sponsor`
--

LOCK TABLES `annadanam_sponsor` WRITE;
/*!40000 ALTER TABLE `annadanam_sponsor` DISABLE KEYS */;
INSERT INTO `annadanam_sponsor` VALUES (1,NULL,'',NULL,'','GAJULAPALLI VENKATASUBBAREDDY',1,1),(2,NULL,'',NULL,'','GAJULAPALLI SUDHAKAR REDDY',2,1),(3,NULL,'',NULL,'','MANYAM RAVINDRA REDDY',3,1);
/*!40000 ALTER TABLE `annadanam_sponsor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `donation_collection`
--

DROP TABLE IF EXISTS `donation_collection`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `donation_collection` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(12,2) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `donor_contact` varchar(255) DEFAULT NULL,
  `donor_name` varchar(255) NOT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `payment_mode` enum('CASH','UPI','BANK_TRANSFER','OTHER') NOT NULL,
  `transaction_date` date NOT NULL,
  `festival_day_id` bigint DEFAULT NULL,
  `festival_year_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKcqah6m67bsyepakpn3b75753` (`festival_day_id`),
  KEY `FKs93ommj9l7ggelbdggr1io8pi` (`festival_year_id`),
  CONSTRAINT `FKcqah6m67bsyepakpn3b75753` FOREIGN KEY (`festival_day_id`) REFERENCES `festival_day` (`id`),
  CONSTRAINT `FKs93ommj9l7ggelbdggr1io8pi` FOREIGN KEY (`festival_year_id`) REFERENCES `festival_year` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donation_collection`
--

LOCK TABLES `donation_collection` WRITE;
/*!40000 ALTER TABLE `donation_collection` DISABLE KEYS */;
INSERT INTO `donation_collection` VALUES (1,2000.00,'2026-08-19 15:28:46.777124','admin@ganeshfest.local','','Gajulapalli Chinna','','CASH','2026-08-19',NULL,1);
/*!40000 ALTER TABLE `donation_collection` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense`
--

DROP TABLE IF EXISTS `expense`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(12,2) NOT NULL,
  `category` varchar(255) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `paid_to` varchar(255) DEFAULT NULL,
  `transaction_date` date NOT NULL,
  `festival_day_id` bigint DEFAULT NULL,
  `festival_year_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKqamcf828ygky88blnpca06puy` (`festival_day_id`),
  KEY `FKm1tv2syj5njp98dlux8cosglh` (`festival_year_id`),
  CONSTRAINT `FKm1tv2syj5njp98dlux8cosglh` FOREIGN KEY (`festival_year_id`) REFERENCES `festival_year` (`id`),
  CONSTRAINT `FKqamcf828ygky88blnpca06puy` FOREIGN KEY (`festival_day_id`) REFERENCES `festival_day` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense`
--

LOCK TABLES `expense` WRITE;
/*!40000 ALTER TABLE `expense` DISABLE KEYS */;
/*!40000 ALTER TABLE `expense` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `festival_day`
--

DROP TABLE IF EXISTS `festival_day`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `festival_day` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `day_number` int NOT NULL,
  `label` varchar(255) DEFAULT NULL,
  `festival_year_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKog8cdc8uskqn1o7ikvtulw89e` (`festival_year_id`,`date`),
  CONSTRAINT `FKmksbwftx9p2qlxlvrht6pacd4` FOREIGN KEY (`festival_year_id`) REFERENCES `festival_year` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `festival_day`
--

LOCK TABLES `festival_day` WRITE;
/*!40000 ALTER TABLE `festival_day` DISABLE KEYS */;
INSERT INTO `festival_day` VALUES (1,'2026-09-14',1,'Chaturdi',1),(2,'2026-09-15',2,'Second Day',1),(3,'2026-09-16',3,'Nimarjanam',1);
/*!40000 ALTER TABLE `festival_day` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `festival_year`
--

DROP TABLE IF EXISTS `festival_year`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `festival_year` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `opening_balance` decimal(12,2) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `year` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_qhkkiqgsvxqve6n6uedxyiv6u` (`year`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `festival_year`
--

LOCK TABLES `festival_year` WRITE;
/*!40000 ALTER TABLE `festival_year` DISABLE KEYS */;
INSERT INTO `festival_year` VALUES (1,_binary '','2026-09-16',200000.00,'2026-09-14',2026);
/*!40000 ALTER TABLE `festival_year` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loan`
--

DROP TABLE IF EXISTS `loan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loan` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `borrower_contact` varchar(255) DEFAULT NULL,
  `borrower_name` varchar(255) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `interest_period_note` varchar(255) DEFAULT NULL,
  `interest_rate_percent` decimal(5,2) DEFAULT NULL,
  `loan_date` date NOT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `principal_amount` decimal(12,2) NOT NULL,
  `status` enum('ACTIVE','CLOSED') DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loan`
--

LOCK TABLES `loan` WRITE;
/*!40000 ALTER TABLE `loan` DISABLE KEYS */;
INSERT INTO `loan` VALUES (1,'','Suneel','2026-08-19 16:30:01.336730','admin@ganeshfest.local','per month',2.00,'2026-08-19','',5000.00,'ACTIVE');
/*!40000 ALTER TABLE `loan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loan_repayment`
--

DROP TABLE IF EXISTS `loan_repayment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loan_repayment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `interest_paid` decimal(12,2) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `payment_date` date NOT NULL,
  `principal_paid` decimal(12,2) DEFAULT NULL,
  `loan_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK2m5rsmybqgnk8kx60pknaq21b` (`loan_id`),
  CONSTRAINT `FK2m5rsmybqgnk8kx60pknaq21b` FOREIGN KEY (`loan_id`) REFERENCES `loan` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loan_repayment`
--

LOCK TABLES `loan_repayment` WRITE;
/*!40000 ALTER TABLE `loan_repayment` DISABLE KEYS */;
/*!40000 ALTER TABLE `loan_repayment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `program`
--

DROP TABLE IF EXISTS `program`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `program` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `description` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `time_slot` varchar(255) DEFAULT NULL,
  `festival_day_id` bigint DEFAULT NULL,
  `festival_year_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK213jv9wucuvjjusko7p4lnkge` (`festival_day_id`),
  KEY `FKivayrt5qrp15cbpcsymu5q6e8` (`festival_year_id`),
  CONSTRAINT `FK213jv9wucuvjjusko7p4lnkge` FOREIGN KEY (`festival_day_id`) REFERENCES `festival_day` (`id`),
  CONSTRAINT `FKivayrt5qrp15cbpcsymu5q6e8` FOREIGN KEY (`festival_year_id`) REFERENCES `festival_year` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `program`
--

LOCK TABLES `program` WRITE;
/*!40000 ALTER TABLE `program` DISABLE KEYS */;
INSERT INTO `program` VALUES (1,'Nellore','Archestra','9PM TO 1 PM',1,1),(2,'','Kumkuma Archana','7PM TO 9 PM',2,1),(3,'','Bajana','Whole Night',2,1),(4,'','Chekka Bajana','4PM TO 8 PM',3,1);
/*!40000 ALTER TABLE `program` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sponsor`
--

DROP TABLE IF EXISTS `sponsor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sponsor` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(12,2) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `contact` varchar(255) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `sponsor_name` varchar(255) NOT NULL,
  `festival_year_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKhegqgs0lj725aejf2hjw4a1rn` (`festival_year_id`),
  CONSTRAINT `FKhegqgs0lj725aejf2hjw4a1rn` FOREIGN KEY (`festival_year_id`) REFERENCES `festival_year` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sponsor`
--

LOCK TABLES `sponsor` WRITE;
/*!40000 ALTER TABLE `sponsor` DISABLE KEYS */;
INSERT INTO `sponsor` VALUES (1,NULL,'LADDU','','','MANYAM CHANDRAKALA',1);
/*!40000 ALTER TABLE `sponsor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `velam_item`
--

DROP TABLE IF EXISTS `velam_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `velam_item` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `base_price` decimal(12,2) DEFAULT NULL,
  `buyer_contact` varchar(255) DEFAULT NULL,
  `buyer_name` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `final_price` decimal(12,2) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `item_name` varchar(255) NOT NULL,
  `status` enum('AVAILABLE','SOLD') DEFAULT NULL,
  `festival_year_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKhyeqkyk2btmps70q6jv4lyh6s` (`festival_year_id`),
  CONSTRAINT `FKhyeqkyk2btmps70q6jv4lyh6s` FOREIGN KEY (`festival_year_id`) REFERENCES `festival_year` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `velam_item`
--

LOCK TABLES `velam_item` WRITE;
/*!40000 ALTER TABLE `velam_item` DISABLE KEYS */;
INSERT INTO `velam_item` VALUES (1,5000.00,'','RAMANA','VENDI',90000.00,'/uploads/velam-items/8bfd89f2-6c1d-48ff-9b95-d656e8a90a9f.png','KALASHAM','SOLD',1);
/*!40000 ALTER TABLE `velam_item` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-19 17:12:22
