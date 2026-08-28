import { SlashCommandSubcommandBuilder, ChatInputCommandInteraction, MessageFlags, TextChannel, EmbedBuilder } from 'discord.js';
import { logger } from "../../utils/logger";
import { EmbedColors } from "../../config/colors";

export const removeSubcommand = {
    data: (sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName('remove')
            .setDescription('Usuwa użytkownika lub rolę z aktualnego ticketu.')
            .addUserOption(option =>
                option
                    .setName('user')
                    .setDescription('Użytkownik do usunięcia.')
                    .setRequired(false)
            )
            .addRoleOption(option =>
                option
                    .setName('role')
                    .setDescription('Rola do usunięcia.')
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
                await channel.permissionOverwrites.delete(user.id);

                const embed = new EmbedBuilder()
                    .setColor(EmbedColors.denied)
                    .setDescription(`✅ <@${user.id}> został usunięty z ticketu.`)
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            }

            if (role) {
                await channel.permissionOverwrites.delete(role.id);

                const embed = new EmbedBuilder()
                    .setColor(EmbedColors.denied)
                    .setDescription(`✅ <@&${role.id}> została usunięta z ticketu.`)
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            }

        } catch (error) {
            logger.error(`Błąd podczas usuwania z ticketu: ${error}`);
            await interaction.editReply({ content: '❌ Wystąpił błąd podczas usuwania z ticketu.' });
        }
    }
};