import { Client, Collection, ModalSubmitInteraction } from 'discord.js';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

interface Modal {
    customId: string;
    execute: (interaction: ModalSubmitInteraction) => Promise<void>;
}

function getModalFiles(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...getModalFiles(fullPath));
        } else if ((entry.name.endsWith('.ts') || entry.name.endsWith('.js')) && !entry.name.endsWith('.d.ts')) {
            files.push(fullPath);
        }
    }

    return files;
}

export function loadModals(client: Client): void {
    const modalsPath = path.join(__dirname, '../modals');

    if (!fs.existsSync(modalsPath)) {
        logger.warn('Modals folder does not exist');
        return;
    }

    const modals = new Collection<string, Modal>();

    logger.info(`🔄 Rozpoczynam ładowanie modali...`);

    const modalFiles = getModalFiles(modalsPath);

    for (const filePath of modalFiles) {
        const modalModule = require(filePath);
        const modal: Modal = modalModule.default || Object.values(modalModule).find((exp: any) => exp && 'customId' in exp && 'execute' in exp) as Modal;

        if (modal && 'customId' in modal && 'execute' in modal) {
            modals.set(modal.customId, modal);
            logger.success(`🟢 Załadowano modal: ${modal.customId}`);
        } else {
            logger.warn(`⚠️ Modal w pliku ${filePath} nie posiada wymaganych właściwości`);
        }
    }

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isModalSubmit()) return;

        const baseCustomId = interaction.customId.split(/[_:]/)[0];
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