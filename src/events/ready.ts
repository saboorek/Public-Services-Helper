import { Client } from "discord.js";
import { logger } from '../utils/logger';
import GuildConfig from '../models/GuildConfig';
import { syncRoles } from '../utils/syncRoles';

export default {
    name: "ready",
    once: true,
    async execute(client: Client) {
        logger.success(`Bot zalogowany jako ${client.user?.tag}`);
        logger.info("🔄 Uruchamiam synchronizację ról przy starcie...");

        try {
            const configs = await GuildConfig.find({});

            for (const config of configs) {
                try {
                    const guild = await client.guilds.fetch(config.guildId).catch(() => null);
                    if (!guild) continue;

                    const members = await guild.members.fetch();
                    logger.info(`🔄 Synchronizuję ${members.size} memberów na serwerze ${guild.name}...`);

                    for (const [, member] of members) {
                        await syncRoles(member.id, config.guildId, client, true);
                    }

                    logger.success(`✅ Synchronizacja zakończona dla serwera ${guild.name}`);
                } catch (err) {
                    logger.error(`❌ Błąd synchronizacji dla serwera ${config.guildId}: ${err}`);
                }
            }
        } catch (err) {
            logger.error(`❌ Błąd podczas startu synchronizacji: ${err}`);
        }
    },
};