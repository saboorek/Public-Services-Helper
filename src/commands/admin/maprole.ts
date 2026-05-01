import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import GuildConfig from '../../models/GuildConfig';
import RoleMapping from '../../models/RoleMapping';
import { logger } from '../../utils/logger';
import { sendToChannel } from '../../utils/sendToChannel';
import { syncRoles } from '../../utils/syncRoles';

export const mapRoleSubcommand = {
    data: (sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName('maprole')
            .setDescription('Mapuje rolę z innego serwera na rolę tego serwera')
            .addStringOption(option =>
                option
                    .setName('target-guild')
                    .setDescription('ID serwera, z którego chcesz zmapować rolę')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName('target-role')
                    .setDescription('ID roli na docelowym serwerze (wymagana do nadania)')
                    .setRequired(true)
            )
            .addRoleOption(option =>
                option
                    .setName('mapped-role')
                    .setDescription('Rola nadawana na tym serwerze')
                    .setRequired(true)
            ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const targetGuildId = interaction.options.getString('target-guild', true);
        const targetRoleId  = interaction.options.getString('target-role', true);
        const mappedRole    = interaction.options.getRole('mapped-role', true);

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const targetGuild = await interaction.client.guilds.fetch(targetGuildId).catch(() => null);
            if (!targetGuild) {
                await interaction.editReply({
                    content: '❌ Bot nie jest na podanym serwerze lub podane ID jest nieprawidłowe.',
                });
                return;
            }

            const targetRole = await targetGuild.roles.fetch(targetRoleId).catch(() => null);
            if (!targetRole) {
                await interaction.editReply({
                    content: `❌ Rola o ID \`${targetRoleId}\` nie istnieje na serwerze **${targetGuild.name}**.`,
                });
                return;
            }

            const existing = await RoleMapping.findOne({
                guildId: interaction.guildId,
                targetGuildId,
                requiredRoleId: targetRoleId,
            });

            if (existing) {
                await interaction.editReply({
                    content: `⚠️ Mapowanie dla tej roli na serwerze **${targetGuild.name}** już istnieje.`,
                });
                return;
            }

            await RoleMapping.create({
                guildId:        interaction.guildId,
                targetGuildId,
                requiredRoleId: targetRoleId,
                assignedRoleId: mappedRole.id,
            });

            if (interaction.guild) {
                const members = await interaction.guild.members.fetch();
                for (const [, member] of members) {
                    await syncRoles(member.id, interaction.guildId!, interaction.client);
                }
            }

            logger.info(`✅ Dodano mapowanie: ${targetGuildId}/${targetRoleId} → ${mappedRole.id}`);

            const successEmbed = new EmbedBuilder()
                .setColor(0x57f287)
                .setTitle('✅ Mapowanie zostało dodane')
                .addFields(
                    { name: 'Serwer docelowy', value: `${targetGuild.name} (\`${targetGuildId}\`)`, inline: true },
                    { name: 'Wymagana rola',   value: `${targetRole.name} (\`${targetRoleId}\`)`,   inline: true },
                    { name: 'Nadawana rola',   value: `<@&${mappedRole.id}>`,                        inline: true },
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [successEmbed] });

            const guild = interaction.guild;
            if (guild) {
                await sendToChannel(guild, 'logChannel', successEmbed);
            }

        } catch (error) {
            logger.error(`Błąd maprole: ${error}`);

            const errorEmbed = new EmbedBuilder()
                .setColor(0xed4245)
                .setTitle('❌ Błąd podczas dodawania mapowania')
                .setDescription(`\`\`\`${error}\`\`\``)
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });

            if (interaction.guild) {
                await sendToChannel(interaction.guild, 'logChannel', errorEmbed);
            }
        }
    }
};