import { SlashCommandSubcommandBuilder, ChatInputCommandInteraction, MessageFlags, TextChannel, EmbedBuilder } from 'discord.js';
import { logger } from "../../utils/logger";
import { EmbedColors } from "../../config/colors";

export const addSubcommand = {
    data: (sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName('add')
            .setDescription('Dodaje użytkownika lub rolę do aktualnego ticketu.')
            .addUserOption(option =>
                option
                    .setName('user')
                    .setDescription('Użytkownik do dodania.')
                    .setRequired(false)
            )
            .addRoleOption(option =>
                option
                    .setName('role')
                    .setDescription('Rola do dodania.')
                    .setRequired(false)
            ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const channel = interaction.channel as TextChannel;
            const user = interaction.options.getUser('user');
            const role = interaction.options.getRole('role');

            if (!user && !role) {
                await interaction.editReply({ content: '❌ Musisz podać użytkownika lub rolę.' });
                return;
            }

            if (user) {
                await channel.permissionOverwrites.edit(user.id, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true,
                });

                const embed = new EmbedBuilder()
                    .setColor(EmbedColors.approved)
                    .setDescription(`✅ <@${user.id}> został dodany do ticketu.`)
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            }

            if (role) {
                await channel.permissionOverwrites.edit(role.id, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true,
                });

                const embed = new EmbedBuilder()
                    .setColor(EmbedColors.approved)
                    .setDescription(`✅ <@&${role.id}> została dodana do ticketu.`)
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            }

        } catch (error) {
            logger.error(`Błąd podczas dodawania do ticketu: ${error}`);
            await interaction.editReply({ content: '❌ Wystąpił błąd podczas dodawania do ticketu.' });
        }
    }
};