# ************************************************************
# Sequel Pro SQL dump
# Version 4096
#
# http://www.sequelpro.com/
# http://code.google.com/p/sequel-pro/
#
# Host: 107.170.102.101 (MySQL 10.0.10-MariaDB-1~trusty-log)
# Database: ORM_test
# Generation Time: 2014-06-13 09:38:23 +0000
# ************************************************************

CREATE DATABASE ORM_test;
USE ORM_test;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table __permission__
# ------------------------------------------------------------

DROP TABLE IF EXISTS `__permission__`;

CREATE TABLE `__permission__` (
  `ID` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(32) NOT NULL DEFAULT '',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `__permission__` WRITE;
/*!40000 ALTER TABLE `__permission__` DISABLE KEYS */;

INSERT INTO `__permission__` (`ID`, `title`)
VALUES
	(1,'user.create'),
	(2,'user.read'),
	(3,'user.update'),
	(4,'user.delete');

/*!40000 ALTER TABLE `__permission__` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table sresu
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sresu`;

CREATE TABLE `sresu` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `firstName` varchar(32) NOT NULL DEFAULT '',
  `lastName` varchar(32) NOT NULL DEFAULT '',
  `email` varchar(255) NOT NULL DEFAULT '',
  `username` varchar(32) NOT NULL DEFAULT '',
  `password` varchar(64) NOT NULL DEFAULT '',
  `createdTimestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedTimestamp` timestamp NULL DEFAULT NULL,
  `lastPasswordChangeDate` date DEFAULT NULL,
  `requirePasswordChangeFlag` tinyint(3) unsigned NOT NULL DEFAULT '0',
  `status` enum('active','inactive','banned','registered') NOT NULL DEFAULT 'registered',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `sresu` WRITE;
/*!40000 ALTER TABLE `sresu` DISABLE KEYS */;

INSERT INTO `sresu` (`id`, `firstName`, `lastName`, `email`, `username`, `password`, `createdTimestamp`, `updatedTimestamp`, `lastPasswordChangeDate`, `requirePasswordChangeFlag`, `status`)
VALUES
	(1,'John','Doe','john.doe@example.com','john.doe','password','2014-05-17 15:50:15',NULL,NULL,1,'registered'),
	(2,'Jane','Doe','jane.doe@example.com','jane.doe','password','2014-05-17 15:50:49',NULL,NULL,0,'inactive'),
	(3,'John','Doe2','john.doe2@example.com','john.doe2','password','2014-05-17 15:51:49',NULL,NULL,0,'active'),
	(4,'Jane','Doe2','jane.doe2@example.com','jane.doe2','password','2014-05-17 15:52:20',NULL,NULL,0,'banned');

/*!40000 ALTER TABLE `sresu` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table user_email
# ------------------------------------------------------------

DROP TABLE IF EXISTS `user_email`;

CREATE TABLE `user_email` (
  `Id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `userid` int(11) unsigned NOT NULL,
  `email` varchar(256) NOT NULL DEFAULT '',
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `user_email` WRITE;
/*!40000 ALTER TABLE `user_email` DISABLE KEYS */;

INSERT INTO `user_email` (`Id`, `userid`, `email`)
VALUES
	(1,1,'one@example.com'),
	(2,2,'two@example.com'),
	(3,3,'three@example.com'),
	(4,4,'four@example.com'),
	(5,1,'five@example.com'),
	(6,2,'six@example.com'),
	(7,3,'seven@example.com'),
	(8,4,'eight@example.com');

/*!40000 ALTER TABLE `user_email` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table userDetails
# ------------------------------------------------------------

DROP TABLE IF EXISTS `userDetails`;

CREATE TABLE `userDetails` (
  `i_d` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `USER_ID` int(11) unsigned DEFAULT NULL,
  `details` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`i_d`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `userDetails` WRITE;
/*!40000 ALTER TABLE `userDetails` DISABLE KEYS */;

INSERT INTO `userDetails` (`i_d`, `USER_ID`, `details`)
VALUES
	(1,1,'one'),
	(2,2,'two'),
	(3,3,'three'),
	(4,4,'four'),
	(5,NULL,'no link');

/*!40000 ALTER TABLE `userDetails` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table useremails__Test1
# ------------------------------------------------------------

DROP TABLE IF EXISTS `useremails__Test1`;

CREATE TABLE `useremails__Test1` (
  `I__D` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `__u_s_e_r_i_d__` int(11) unsigned NOT NULL,
  `email` varchar(256) NOT NULL DEFAULT '',
  PRIMARY KEY (`I__D`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `useremails__Test1` WRITE;
/*!40000 ALTER TABLE `useremails__Test1` DISABLE KEYS */;

INSERT INTO `useremails__Test1` (`I__D`, `__u_s_e_r_i_d__`, `email`)
VALUES
	(1,1,'one@example.com'),
	(2,2,'two@example.com'),
	(3,3,'three@example.com'),
	(4,4,'four@example.com'),
	(5,1,'five@example.com'),
	(6,2,'six@example.com'),
	(7,3,'seven@example.com'),
	(8,4,'eight@example.com');

/*!40000 ALTER TABLE `useremails__Test1` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table UsErPeRmIsSiOnMaP
# ------------------------------------------------------------

DROP TABLE IF EXISTS `UsErPeRmIsSiOnMaP`;

CREATE TABLE `UsErPeRmIsSiOnMaP` (
  `__user_Id__` int(11) unsigned NOT NULL,
  `PER_mission_iD` int(11) unsigned NOT NULL,
  PRIMARY KEY (`__user_Id__`,`PER_mission_iD`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `UsErPeRmIsSiOnMaP` WRITE;
/*!40000 ALTER TABLE `UsErPeRmIsSiOnMaP` DISABLE KEYS */;

INSERT INTO `UsErPeRmIsSiOnMaP` (`__user_Id__`, `PER_mission_iD`)
VALUES
	(1,1),
	(2,1),
	(2,2),
	(2,3),
	(3,1),
	(3,2),
	(3,3),
	(3,4);

/*!40000 ALTER TABLE `UsErPeRmIsSiOnMaP` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table v_a_l_i_d_a_t_e
# ------------------------------------------------------------

DROP TABLE IF EXISTS `v_a_l_i_d_a_t_e`;

CREATE TABLE `v_a_l_i_d_a_t_e` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `not_Empty` int(11) unsigned NOT NULL,
  `email` varchar(256) NOT NULL DEFAULT '',
  `__min_Value__` int(11) unsigned NOT NULL,
  `maxValue` int(11) unsigned NOT NULL,
  `rangeValue` int(11) unsigned NOT NULL,
  `minlength` varchar(16) NOT NULL DEFAULT '',
  `maxLength` varchar(16) NOT NULL DEFAULT '',
  `rangeLength` varchar(16) NOT NULL DEFAULT '',
  `MATCH` varchar(32) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `v_a_l_i_d_a_t_e` WRITE;
/*!40000 ALTER TABLE `v_a_l_i_d_a_t_e` DISABLE KEYS */;

INSERT INTO `v_a_l_i_d_a_t_e` (`id`, `not_Empty`, `email`, `__min_Value__`, `maxValue`, `rangeValue`, `minlength`, `maxLength`, `rangeLength`, `MATCH`)
VALUES
	(1,1,'example@example.com',1,12,6,'t','testtesttest','testte','match');

/*!40000 ALTER TABLE `v_a_l_i_d_a_t_e` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
