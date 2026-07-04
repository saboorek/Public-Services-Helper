import { Client, EmbedBuilder, Guild } from "discord.js";
import RoleMapping from "../models/RoleMapping";
import GuildConfig from "../models/GuildConfig";
import { logger } from "./logger";
import { sendToChannel } from "./sendToChannel";

export async function syncRoles(userId: string, mainGuildId: string, client: Client, silent = false) {
    let mainGuild: Guild | null = null;

    try {
        const [config, mappings] = await Promise.all([
            GuildConfig.findOne({ guildId: mainGuildId }),
            RoleMapping.find({ guildId: mainGuildId }),
        ]);

        if (!config) return;

        mainGuild = await client.guilds.fetch(mainGuildId);
        const mainMember = await mainGuild.members.fetch(userId).catch(() => null);
        if (!mainMember) return;

        const assignedRoles: string[] = [];

        for (const mapping of mappings) {
            try {
                const targetGuild = await client.guilds.fetch(mapping.targetGuildId);
                const targetMember = await targetGuild.members.fetch(userId);
                const hasRequiredRole = targetMember.roles.cache.has(mapping.requiredRoleId);

                if (hasRequiredRole) {
                    await mainMember.roles.add(mapping.assignedRoleId);
                    assignedRoles.push(mapping.assignedRoleId);
                    logger.info(`✅ [${userId}] Nadano rolę ${mapping.assignedRoleId} (posiada ${mapping.requiredRoleId} na ${mapping.targetGuildId})`);
                } else {
                    await mainMember.roles.remove(mapping.assignedRoleId).catch(() => {});
                }
            } catch {
                await mainMember.roles.remove(mapping.assignedRoleId).catch(() => {});
            }
        }

        await mainMember.roles.add(config.defaultRoleId!).catch(() => {});

        if (!silent) {
            const lines = [
                `<@&${config.defaultRoleId}> *(rola domyślna)*`,
                ...assignedRoles.map(id => `<@&${id}>`),
            ];

            const successEmbed = new EmbedBuilder()
                .setColor(0x57f287)
                .setTitle("🔄 Synchronizacja ról")
                .setDescription(`Role zostały nadane poprawnie dla <@${userId}>\n\n${lines.join("\n")}`)
                .setTimestamp();

            //await sendToChannel(mainGuild, "logChannel", successEmbed);
        }

    } catch (error) {
        logger.error(`Błąd synchronizacji ról dla ${userId}: ${error}`);

        if (!silent && mainGuild) {
            const errorEmbed = new EmbedBuilder()
                .setColor(0xed4245)
                .setTitle("❌ Błąd synchronizacji ról")
                .setDescription(`Wystąpił błąd podczas synchronizacji ról dla <@${userId}>\n\`\`\`${error}\`\`\``)
                .setTimestamp();

            await sendToChannel(mainGuild, "logChannel", errorEmbed).catch(() => {});
        }
    }
}