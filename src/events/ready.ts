import { Client } from "discord.js";
import { logger } from '../utils/logger';
import GuildConfig from '../models/GuildConfig';
import RoleMapping from '../models/RoleMapping';
import { syncRoles } from '../utils/syncRoles';
import { checkWarrantReminders } from '../utils/warrantReminder';
import { checkExpiredWarrants } from "../utils/warrantExpiry";

async function syncAllRoles(client: Client): Promise<void> {
    try {
        const configs = await GuildConfig.find({});

        for (const config of configs) {
            try {
                const mainGuild = await client.guilds.fetch(config.guildId).catch(() => null);
                if (!mainGuild) continue;

                const mappings = await RoleMapping.find({ guildId: config.guildId });
                const targetGuildIds = [...new Set(mappings.map(m => m.targetGuildId))];

                const userIdsToSync = new Set<string>();

                const mainMembers = await mainGuild.members.fetch();

                for (const targetGuildId of targetGuildIds) {
                    const targetGuild = await client.guilds.fetch(targetGuildId).catch(() => null);
                    if (!targetGuild) continue;

                    const targetMembers = await targetGuild.members.fetch();

                    for (const [, member] of targetMembers) {
                        if (mainMembers.has(member.id)) {
                            userIdsToSync.add(member.id);
                        }
                    }
                }

                logger.info(`🔄 Synchronizuję ${userIdsToSync.size} memberów na serwerze ${mainGuild.name}...`);

                const userIds = [...userIdsToSync];
                const BATCH_SIZE = 10;

                for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
                    const batch = userIds.slice(i, i + BATCH_SIZE);
                    await Promise.all(batch.map(userId => syncRoles(userId, config.guildId, client, true)));
                }

                logger.success(`✅ Synchronizacja zakończona dla serwera ${mainGuild.name}`);
            } catch (err) {
                logger.error(`❌ Błąd synchronizacji dla serwera ${config.guildId}: ${err}`);
            }
        }
    } catch (err) {
        logger.error(`❌ Błąd podczas startu synchronizacji: ${err}`);
    }
}

export default {
    name: "ready",
    once: true,
    async execute(client: Client) {
        logger.success(`Bot zalogowany jako ${client.user?.tag}`);

        await checkWarrantReminders(client);
        setInterval(async () => {
            await checkWarrantReminders(client);
        }, 12 * 60 * 60 * 1000);
        logger.info("🔄 Uruchomiono cykliczne sprawdzanie przypomnień o wnioskach (co 12h)");

        await checkExpiredWarrants(client);
        setInterval(async () => {
            await checkExpiredWarrants(client);
        }, 5 * 60 * 1000);
        logger.info("🔄 Uruchomiono cykliczne sprawdzanie zamkniętych wniosków (co 5 min)");

        logger.info("🔄 Uruchamiam synchronizację ról przy starcie...");
        syncAllRoles(client).catch(err => logger.error(`❌ Błąd synchronizacji ról: ${err}`));
    },
};