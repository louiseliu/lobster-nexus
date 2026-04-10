-- ============================================================================
-- 昆明龙虾局 - 数据库初始化脚本
-- 使用方式: mysql -u root -p < database/schema.sql
-- ============================================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `lobster_nexus` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户并授权（根据需要修改密码）
-- CREATE USER IF NOT EXISTS 'lobster'@'%' IDENTIFIED BY 'your_password';
-- GRANT ALL PRIVILEGES ON `lobster_nexus`.* TO 'lobster'@'%';
-- FLUSH PRIVILEGES;

USE `lobster_nexus`;

-- ============================================================================
-- 参与者表
-- ============================================================================
CREATE TABLE IF NOT EXISTS `Participant` (
  `id`           VARCHAR(191) NOT NULL,
  `name`         VARCHAR(191) NOT NULL,
  `phone`        VARCHAR(191) NOT NULL,
  `industry`     VARCHAR(191) NOT NULL,
  `company`      VARCHAR(191) NOT NULL,
  `title`        VARCHAR(191) NOT NULL,
  `bio`          TEXT,
  `avatar`       VARCHAR(191),
  `checkedIn`    TINYINT(1) NOT NULL DEFAULT 0,
  `checkinTime`  DATETIME(3),
  `checkinCode`  VARCHAR(191) NOT NULL,
  `groupId`      VARCHAR(191),
  `avatarSeed`   VARCHAR(191),
  `shrimpGender` VARCHAR(191),
  `shrimpReason` TEXT,
  `shrimpSkills` TEXT,
  `shrimpWish`   VARCHAR(191),
  `shrimpTitle`  VARCHAR(191),
  `createdAt`    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`    DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Participant_phone_key` (`phone`),
  UNIQUE KEY `Participant_checkinCode_key` (`checkinCode`),
  KEY `Participant_phone_idx` (`phone`),
  KEY `Participant_checkinCode_idx` (`checkinCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 盲盒配对表
-- ============================================================================
CREATE TABLE IF NOT EXISTS `BlindboxMatch` (
  `id`        VARCHAR(191) NOT NULL,
  `user1Id`   VARCHAR(191) NOT NULL,
  `user2Id`   VARCHAR(191) NOT NULL,
  `revealed`  TINYINT(1) NOT NULL DEFAULT 0,
  `round`     INT NOT NULL DEFAULT 1,
  `source`    VARCHAR(191) NOT NULL DEFAULT 'manual',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `BlindboxMatch_user1Id_idx` (`user1Id`),
  KEY `BlindboxMatch_user2Id_idx` (`user2Id`),
  CONSTRAINT `BlindboxMatch_user1Id_fkey` FOREIGN KEY (`user1Id`) REFERENCES `Participant` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `BlindboxMatch_user2Id_fkey` FOREIGN KEY (`user2Id`) REFERENCES `Participant` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 游戏会话表（商业盲盒）
-- ============================================================================
CREATE TABLE IF NOT EXISTS `GameSession` (
  `id`            VARCHAR(191) NOT NULL,
  `currentRound`  INT NOT NULL DEFAULT 0,
  `currentPrompt` TEXT,
  `roundStartAt`  DATETIME(3),
  `roundDuration` INT NOT NULL DEFAULT 300,
  `status`        VARCHAR(191) NOT NULL DEFAULT 'waiting',
  `createdAt`     DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`     DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 游戏提交表（商业盲盒 - 参与者回答）
-- ============================================================================
CREATE TABLE IF NOT EXISTS `GameSubmission` (
  `id`        VARCHAR(191) NOT NULL,
  `sessionId` VARCHAR(191) NOT NULL,
  `round`     INT NOT NULL,
  `userId`    VARCHAR(191) NOT NULL,
  `userName`  VARCHAR(191) NOT NULL,
  `industry`  VARCHAR(191) NOT NULL,
  `keyword`   TEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `GameSubmission_sessionId_idx` (`sessionId`),
  KEY `GameSubmission_userId_idx` (`userId`),
  CONSTRAINT `GameSubmission_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `GameSession` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
