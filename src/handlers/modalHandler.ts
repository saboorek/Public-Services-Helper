import { Client, Collection, ModalSubmitInteraction } from 'discord.js';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

interface Modal {
    customId: string;
    execute: (interaction: ModalSubmitInteraction) => Promise<void>;
}

export function loadModals(client: Client): void {
    const modalsPath = path.join(__dirname, '../modals');

    if (!fs.existsSync(modalsPath)) {
        logger.warn('Modals folder does not exist');
        return;
    }

    const modals = new Collection<string, Modal>();
    const modalFiles = fs.readdirSync(modalsPath)
        .filter(file => (file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts'));

    logger.info(`🔄 Rozpoczynam ładowanie modali...`);

    for (const file of modalFiles) {
        const filePath = path.join(modalsPath, file);

        if (!fs.statSync(filePath).isFile()) continue;

        const modalModule = require(filePath);
        const modal: Modal = modalModule.default || Object.values(modalModule).find((exp: any) => exp && 'customId' in exp && 'execute' in exp) as Modal;

        if (modal && 'customId' in modal && 'execute' in modal) {
            modals.set(modal.customId, modal);
            logger.success(`🟢 Załadowano modal: ${modal.customId}`);
        } else {
            logger.warn(`⚠️ Modal w pliku ${file} nie posiada wymaganych właściwości`);
        }
    }

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isModalSubmit()) return;

        // Obsługa dynamicznych customId (np. "createTicketPanel:channelId")
        const baseCustomId = interaction.customId.split(':')[0];
        const modal = modals.get(baseCustomId) || modals.get(interaction.customId);

        if (!modal) return;

        try {
            await modal.execute(interaction);
        } catch (error) {
            logger.error(`Error executing modal ${interaction.customId}: ${error}`);

            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ Wystąpił błąd podczas przetwarzania modalu.',
                    ephemeral: true
                }).catch(() => {});
            }
        }
    });

    logger.success(`✅ Wszystkie modale zostały pomyślnie załadowane (${modalFiles.length})`);
}
