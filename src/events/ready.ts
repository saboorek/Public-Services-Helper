
import { Client } from "discord.js";
import { logger } from '../utils/logger';
import GuildConfig from '../models/GuildConfig';
import RoleMapping from '../models/RoleMapping';
import { syncRoles } from '../utils/syncRoles';
import { checkWarrantReminders } from '../utils/warrantReminder';

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
                    const mainGuild = await client.guilds.fetch(config.guildId).catch(() => null);
                    if (!mainGuild) continue;

                    const mappings = await RoleMapping.find({ guildId: config.guildId });
                    const targetGuildIds = [...new Set(mappings.map(m => m.targetGuildId))];

                    const userIdsToSync = new Set<string>();

                    for (const targetGuildId of targetGuildIds) {
                        const targetGuild = await client.guilds.fetch(targetGuildId).catch(() => null);
                        if (!targetGuild) continue;

                        const targetMembers = await targetGuild.members.fetch();

                        for (const [, member] of targetMembers) {
                            const mainMember = await mainGuild.members.fetch(member.id).catch(() => null);
                            if (mainMember) {
                                userIdsToSync.add(member.id);
                            }
                        }
                    }

                    logger.info(`🔄 Synchronizuję ${userIdsToSync.size} memberów na serwerze ${mainGuild.name}...`);

                    for (const userId of userIdsToSync) {
                        await syncRoles(userId, config.guildId, client, true);
                    }

                    logger.success(`✅ Synchronizacja zakończona dla serwera ${mainGuild.name}`);
                } catch (err) {
                    logger.error(`❌ Błąd synchronizacji dla serwera ${config.guildId}: ${err}`);
                }
            }
        } catch (err) {
            logger.error(`❌ Błąd podczas startu synchronizacji: ${err}`);
        }

        await checkWarrantReminders(client);
        setInterval(async () => {
            await checkWarrantReminders(client);
        }, 12 * 60 * 60 * 1000);
        logger.info("🔄 Uruchomiono cykliczne sprawdzanie przypomnień o wnioskach (co 12h)");
    },
};