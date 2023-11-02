-- CreateTable
CREATE TABLE `subreddits` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `avatar` VARCHAR(191) NULL,
    `description` VARCHAR(191) NOT NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `allowPost` BOOLEAN NOT NULL DEFAULT true,
    `country` VARCHAR(191) NULL,
    `topicId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `subreddits_name_key`(`name`),
    UNIQUE INDEX `subreddits_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `subreddits` ADD CONSTRAINT `subreddits_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `topics`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
