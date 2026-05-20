import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
    MessageFlags
} from "discord.js";
import WarrantConfig from "../../models/WarrantConfig";
import { logger } from "../../utils/logger";
import { sendToChannel } from "../../utils/sendToChannel";

export const setRoleSubcommand = {
    data: (sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName('setrole')
            .setDescription('Przypisuje rolę do wybranego typu')
            .addStringOption(option =>
                option
                    .setName('type')
                    .setDescription('Wybierz typ roli')
                    .setRequired(true)
                    .addChoices(
                        { name: '⚖️ DAO: Warrants', value: 'daoRole' },
                        { name: '🔍 Criminal Division Judge', value: 'criminalDivisionRole' },
                        { name: '🏛️ Leader FBI', value: 'leaderFbiRole' },
                        { name: '🤝 Helper', value: 'helperRole' },
                        { name: '👔 Supervisor', value: 'supervisorRole' },
                        { name: '🧑‍⚖️ LSC Superior Court', value: 'superiorCourtRole'}
                    )
            )
            .addRoleOption(option =>
                option
                    .setName('role')
                    .setDescription('Wybierz rolę do przypisania')
                    .setRequired(true)
            ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const roleType = interaction.options.getString('type', true);
        const role = interaction.options.getRole('role', true);

        try {
            let config = await WarrantConfig.findOne({ guildId: interaction.guildId });

            if (!config) {
                config = new WarrantConfig({ guildId: interaction.guildId });
            }

            switch (roleType) {
                case 'daoRole':
                    config.role.daoRoleId = role.id;
                    break;
                case 'criminalDivisionRole':
                    config.role.criminalDivisionRoleId = role.id;
                    break;
                case 'leaderFbiRole':
                    config.role.leaderFbiRoleId = role.id;
                    break;
                case 'helperRole':
                    config.role.helperRoleId = role.id;
                    break;
                case 'supervisorRole':
                    config.role.supervisorRoleId = role.id;
                    break;
                case 'superiorCourtRole':
                    config.role.superiorCourtRoleId = role.id;
                    break;
                default:
                    await interaction.editReply({ content: '❌ Wybrano nieprawidłowy typ roli.' });
                    return;
            }

            await config.save();

            const logEmbed = new EmbedBuilder()
                .setTitle('⚙️ Zaaktualizowano konfigurację ról')
                .setColor('#f8ef0d')
                .setDescription(`Użytkownik <@${interaction.user.id}> przypisał rolę <@&${role.id}> do **${roleType.replace('Role', '')}**`)
                .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            const logResult = await sendToChannel(interaction.guild, 'logChannel', logEmbed);
            if (!logResult.success) {
                logger.warn(`Role set but no logChannelId configured for guild ${interaction.guildId}`);
            }

            await interaction.editReply({
                content: `✅ Rola <@&${role.id}> została przypisana do **${roleType.replace('Role', '')}**.`
            });

            logger.success(`Role ${roleType} set to ${role.id} in guild ${interaction.guildId}`);
        } catch (error) {
            logger.error(`Błąd podczas ustawiania roli: ${error}`);
            await interaction.editReply({ content: '❌ Wystąpił błąd podczas ustawiania roli.' });
        }
    }
};