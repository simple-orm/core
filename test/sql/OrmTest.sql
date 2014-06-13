# ************************************************************
# Sequel Pro SQL dump
# Version 4096
#
# http://www.sequelpro.com/
# http://code.google.com/p/sequel-pro/
#
# Host: 107.170.102.101 (MySQL 10.0.10-MariaDB-1~trusty-log)
# Database: OrmTest
# Generation Time: 2014-06-13 09:37:46 +0000
# ************************************************************

CREATE DATABASE OrmTest;
USE OrmTest;


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table Permissions
# ------------------------------------------------------------

DROP TABLE IF EXISTS `Permissions`;

CREATE TABLE `Permissions` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(32) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `Permissions` WRITE;
/*!40000 ALTER TABLE `Permissions` DISABLE KEYS */;

INSERT INTO `Permissions` (`id`, `title`)
VALUES
	(1,'user.create'),
	(2,'user.read'),
	(3,'user.update'),
	(4,'user.delete');

/*!40000 ALTER TABLE `Permissions` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table UserDetails
# ------------------------------------------------------------

DROP TABLE IF EXISTS `UserDetails`;

CREATE TABLE `UserDetails` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `userId` int(11) unsigned DEFAULT NULL,
  `details` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `UserDetails` WRITE;
/*!40000 ALTER TABLE `UserDetails` DISABLE KEYS */;

INSERT INTO `UserDetails` (`id`, `userId`, `details`)
VALUES
	(1,1,'one'),
	(2,2,'two'),
	(3,3,'three'),
	(4,4,'four'),
	(5,NULL,'no link');

/*!40000 ALTER TABLE `UserDetails` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table UserEmails
# ------------------------------------------------------------

DROP TABLE IF EXISTS `UserEmails`;

CREATE TABLE `UserEmails` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `userId` int(11) unsigned NOT NULL,
  `email` varchar(256) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `UserEmails` WRITE;
/*!40000 ALTER TABLE `UserEmails` DISABLE KEYS */;

INSERT INTO `UserEmails` (`id`, `userId`, `email`)
VALUES
	(1,1,'one@example.com'),
	(2,2,'two@example.com'),
	(3,3,'three@example.com'),
	(4,4,'four@example.com'),
	(5,1,'five@example.com'),
	(6,2,'six@example.com'),
	(7,3,'seven@example.com'),
	(8,4,'eight@example.com');

/*!40000 ALTER TABLE `UserEmails` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table UserEmailsTest1
# ------------------------------------------------------------

DROP TABLE IF EXISTS `UserEmailsTest1`;

CREATE TABLE `UserEmailsTest1` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `userId` int(11) unsigned NOT NULL,
  `email` varchar(256) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `UserEmailsTest1` WRITE;
/*!40000 ALTER TABLE `UserEmailsTest1` DISABLE KEYS */;

INSERT INTO `UserEmailsTest1` (`id`, `userId`, `email`)
VALUES
	(1,1,'one@example.com'),
	(2,2,'two@example.com'),
	(3,3,'three@example.com'),
	(4,4,'four@example.com'),
	(5,1,'five@example.com'),
	(6,2,'six@example.com'),
	(7,3,'seven@example.com'),
	(8,4,'eight@example.com');

/*!40000 ALTER TABLE `UserEmailsTest1` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table UserPermissionMap
# ------------------------------------------------------------

DROP TABLE IF EXISTS `UserPermissionMap`;

CREATE TABLE `UserPermissionMap` (
  `userId` int(11) unsigned NOT NULL,
  `permissionId` int(11) unsigned NOT NULL,
  PRIMARY KEY (`userId`,`permissionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `UserPermissionMap` WRITE;
/*!40000 ALTER TABLE `UserPermissionMap` DISABLE KEYS */;

INSERT INTO `UserPermissionMap` (`userId`, `permissionId`)
VALUES
	(1,1),
	(2,1),
	(2,2),
	(2,3),
	(3,1),
	(3,2),
	(3,3),
	(3,4);

/*!40000 ALTER TABLE `UserPermissionMap` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table Users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `Users`;

CREATE TABLE `Users` (
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

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;

INSERT INTO `Users` (`id`, `firstName`, `lastName`, `email`, `username`, `password`, `createdTimestamp`, `updatedTimestamp`, `lastPasswordChangeDate`, `requirePasswordChangeFlag`, `status`)
VALUES
	(1,'John','Doe','john.doe@example.com','john.doe','password','2014-05-17 15:50:15',NULL,NULL,1,'registered'),
	(2,'Jane','Doe','jane.doe@example.com','jane.doe','password','2014-05-17 15:50:49',NULL,NULL,0,'inactive'),
	(3,'John','Doe2','john.doe2@example.com','john.doe2','password','2014-05-17 15:51:49',NULL,NULL,0,'active'),
	(4,'Jane','Doe2','jane.doe2@example.com','jane.doe2','password','2014-05-17 15:52:20',NULL,NULL,0,'banned');

/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table Validate
# ------------------------------------------------------------

DROP TABLE IF EXISTS `Validate`;

CREATE TABLE `Validate` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `notEmpty` int(11) unsigned NOT NULL,
  `email` varchar(256) NOT NULL DEFAULT '',
  `minValue` int(11) unsigned NOT NULL,
  `maxValue` int(11) unsigned NOT NULL,
  `rangeValue` int(11) unsigned NOT NULL,
  `minLength` varchar(16) NOT NULL DEFAULT '',
  `maxLength` varchar(16) NOT NULL DEFAULT '',
  `rangeLength` varchar(16) NOT NULL DEFAULT '',
  `match` varchar(32) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `Validate` WRITE;
/*!40000 ALTER TABLE `Validate` DISABLE KEYS */;

INSERT INTO `Validate` (`id`, `notEmpty`, `email`, `minValue`, `maxValue`, `rangeValue`, `minLength`, `maxLength`, `rangeLength`, `match`)
VALUES
	(1,1,'example@example.com',1,12,6,'t','testtesttest','testte','match');

/*!40000 ALTER TABLE `Validate` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
