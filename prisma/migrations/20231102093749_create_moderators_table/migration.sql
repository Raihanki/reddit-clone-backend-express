-- CreateTable
CREATE TABLE `moderators` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `subredditId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `moderators` ADD CONSTRAINT `moderators_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `moderators` ADD CONSTRAINT `moderators_subredditId_fkey` FOREIGN KEY (`subredditId`) REFERENCES `subreddits`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
