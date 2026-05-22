-- CreateTable
CREATE TABLE `orcamento_itens` (
    `id` VARCHAR(191) NOT NULL,
    `usuario_id` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(255) NOT NULL,
    `quantidade` INTEGER NOT NULL DEFAULT 1,
    `valor_unitario` DECIMAL(10, 2) NOT NULL,
    `data_compra` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `orcamento_itens` ADD CONSTRAINT `orcamento_itens_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
