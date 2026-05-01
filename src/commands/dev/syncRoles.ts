import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
    MessageFlags
} from "discord.js";
import GuildConfig from "../../models/GuildConfig";
import { syncRoles } from "../../utils/syncRoles";
import { logger } from "../../utils/logger";

export const syncRolesSubcommand = {
    data: (sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("syncroles")
            .setDescription("Wymusza synchronizację ról na wszystkich serwerach"),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const configs = await GuildConfig.find({});

            if (configs.length === 0) {
                await interaction.editReply({ content: "⚠️ Brak skonfigurowanych serwerów w bazie danych." });
                return;
            }

            let totalMembers = 0;
            let totalServers = 0;

            for (const config of configs) {
                const guild = await interaction.client.guilds.fetch(config.guildId).catch(() => null);
                if (!guild) continue;

                const members = await guild.members.fetch();
                totalMembers += members.size;
                totalServers++;

                for (const [, member] of members) {
                    await syncRoles(member.id, config.guildId, interaction.client, true);
                }

                logger.success(`✅ Sync zakończony dla serwera ${guild.name}`);
            }

            await interaction.editReply({
                content: `✅ Synchronizacja zakończona.\nPrzetworzono **${totalMembers}** użytkowników na **${totalServers}** serwerach.`
            });
        } catch (error) {
            logger.error(`Błąd podczas ręcznego sync: ${error}`);
            await interaction.editReply({
                content: `❌ Wystąpił błąd podczas synchronizacji: \`${error}\``
            });
        }
    }
};