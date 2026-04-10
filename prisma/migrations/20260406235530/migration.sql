-- CreateTable
CREATE TABLE `Participant` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `industry` VARCHAR(191) NOT NULL,
    `company` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `wechat` VARCHAR(191) NULL,
    `bio` TEXT NULL,
    `checkedIn` BOOLEAN NOT NULL DEFAULT false,
    `checkinTime` DATETIME(3) NULL,
    `checkinCode` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NULL,
    `avatarSeed` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Participant_phone_key`(`phone`),
    UNIQUE INDEX `Participant_checkinCode_key`(`checkinCode`),
    INDEX `Participant_phone_idx`(`phone`),
    INDEX `Participant_checkinCode_idx`(`checkinCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlindboxMatch` (
    `id` VARCHAR(191) NOT NULL,
    `user1Id` VARCHAR(191) NOT NULL,
    `user2Id` VARCHAR(191) NOT NULL,
    `revealed` BOOLEAN NOT NULL DEFAULT false,
    `round` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `BlindboxMatch_user1Id_idx`(`user1Id`),
    INDEX `BlindboxMatch_user2Id_idx`(`user2Id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BlindboxMatch` ADD CONSTRAINT `BlindboxMatch_user1Id_fkey` FOREIGN KEY (`user1Id`) REFERENCES `Participant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlindboxMatch` ADD CONSTRAINT `BlindboxMatch_user2Id_fkey` FOREIGN KEY (`user2Id`) REFERENCES `Participant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
