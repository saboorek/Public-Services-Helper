import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
    MessageFlags
} from "discord.js";
import TicketsConfig from "../../models/TicketsConfig";
import { logger } from "../../utils/logger";
import { sendToChannel } from "../../utils/sendToChannel";

export const setRoleSubcommand = {
    data: (sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName('setrole')
            .setDescription('Przypisuje rolę do wybranego typu w systemie ticketów')
            .addStringOption(option =>
                option
                    .setName('type')
                    .setDescription('Wybierz typ roli')
                    .setRequired(true)
                    .addChoices(
                        { name: '👔 Opiekun: Strefa publiczna', value: 'publicOrgManager' },
                        { name: '🚔 Opiekun: LEA', value: 'leaManager' },
                        { name: '🚑 Opiekun: Rescue', value: 'rescueManager' },
                        { name: '🤝 Pomocnik: Strefa publiczna', value: 'publicOrgAssistant' },
                        { name: '🤝 Pomocnik: LEA', value: 'leaAssistant' },
                        { name: '🤝 Pomocnik: Rescue', value: 'rescueAssistant' },
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
            let config = await TicketsConfig.findOne({ guildId: interaction.guildId });

            if (!config) {
                config = new TicketsConfig({ guildId: interaction.guildId });
            }

            switch (roleType) {
                case 'publicOrgManager':
                    config.supportRoles.publicOrgManager = role.id;
                    break;
                case 'leaManager':
                    config.supportRoles.leaManager = role.id;
                    break;
                case 'rescueManager':
                    config.supportRoles.rescueManager = role.id;
                    break;
                case 'publicOrgAssistant':
                    config.supportRoles.publicOrgAssistant = role.id;
                    break;
                case 'leaAssistant':
                    config.supportRoles.leaAssistant = role.id;
                    break;
                case 'rescueAssistant':
                    config.supportRoles.rescueAssistant = role.id;
                    break;
                default:
                    await interaction.editReply({ content: '❌ Wybrano nieprawidłowy typ roli.' });
                    return;
            }

            await config.save();

            const roleTypeNames: Record<string, string> = {
                publicOrgManager: 'Opiekun: Strefa publiczna',
                leaManager: 'Opiekun: LEA',
                rescueManager: 'Opiekun: Rescue',
                publicOrgAssistant: 'Pomocnik: Strefa publiczna',
                leaAssistant: 'Pomocnik: LEA',
                rescueAssistant: 'Pomocnik: Rescue',
            };

            const logEmbed = new EmbedBuilder()
                .setTitle('⚙️ Zaaktualizowano konfigurację ról ticketów')
                .setColor('#f8ef0d')
                .setDescription(`Użytkownik <@${interaction.user.id}> przypisał rolę <@&${role.id}> do **${roleTypeNames[roleType]}**`)
                .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            const logResult = await sendToChannel(interaction.guild, 'logChannel', logEmbed);
            if (!logResult.success) {
                logger.warn(`Role set but no logChannelId configured for guild ${interaction.guildId}`);
            }

            await interaction.editReply({
                content: `✅ Rola <@&${role.id}> została przypisana do **${roleTypeNames[roleType]}**.`
            });

            logger.success(`Tickets role ${roleType} set to ${role.id} in guild ${interaction.guildId}`);
        } catch (error) {
            logger.error(`Błąd podczas ustawiania roli ticketów: ${error}`);
            await interaction.editReply({ content: '❌ Wystąpił błąd podczas ustawiania roli.' });
        }
    }
};