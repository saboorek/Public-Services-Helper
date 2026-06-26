import {
    ModalSubmitInteraction,
    EmbedBuilder,
    MessageFlags,
    PermissionFlagsBits,
    ChannelType,
    ActionRowBuilder
} from "discord.js";
import { sendToChannel } from "../utils/sendToChannel";
import {logger} from "../utils/logger";
import Zgp from '../models/Zgp';

export const addZgpModal = {
    customId: 'addZgpModal',

    async execute( interaction: ModalSubmitInteraction ): Promise<void> {
        if ( interaction.replied || interaction.deferred ) return;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const zgpType = interaction.fields.getStringSelectValues('zgpTypeSelect')[0];
            const userSelectedCollection = interaction.fields.getSelectedUsers('zgpUserSelect');
            const userId = userSelectedCollection ? userSelectedCollection.first()?.id : undefined;
            const userLink = interaction.fields.getTextInputValue('zgpUserLink');
            const mainGroup = interaction.fields.getTextInputValue('zgpMainGroup');
            const crimeLink = interaction.fields.getTextInputValue('zgpCrimeGroupLink');

            await Zgp.create({
                guildId: interaction.guildId,
                addedBy: interaction.user.id,
                zgpType,
                userId: userId,
                userLink,
                mainGroup,
                crimeLink,
            });

            const successEmbed = new EmbedBuilder()
                .setColor(0x57f287)
                .setTitle("✅ Dodano nową zgodę na grę w grupie przestępczej")
                .addFields(
                    { name: "📦 Typ zgody", value: zgpType, inline: false },
                    { name: "👤 Użytkownik", value: `<@${userId}>`, inline: true },
                    { name: "🔗 Link do użytkownika", value: userLink, inline: true },
                    { name: "🔶 Główna grupa", value: mainGroup, inline: false },
                    { name: "🔗 Link do grupy przestępczej", value: crimeLink, inline: false },

                )
                .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.editReply({
                embeds: [successEmbed]
            });

            const logEmbed = new EmbedBuilder()
                .setColor(0xf8ef0d)
                .setTitle("📋 Nowa zgoda na grę w grupie przestępczej")
                .setDescription(`Użytkownik <@${interaction.user.id}> dodał nową zgodę na grę w grupie przestępczej`)
                .addFields(
                    { name: "📦 Typ zgody", value: zgpType, inline: false },
                    { name: "👤 Użytkownik", value: `<@${userId}>`, inline: true },
                    { name: "🔗 Link do użytkownika", value: userLink, inline: true },
                    { name: "🔶 Główna grupa", value: mainGroup, inline: false },
                    { name: "🔗 Link do grupy przestępczej", value: crimeLink, inline: false },
                )
                .setTimestamp();

            const logResult = await sendToChannel(interaction.guild, "logChannel", logEmbed);
            if (!logResult.success) {
                logger.warn(`Brak kanału logów dla serwera ${interaction.guildId}`);
            }
            logger.success(`Dodano zgodę na grę w ZGP ${interaction.guildId} przez ${interaction.user.id}`);
        } catch ( error ) {
            logger.error(`Błąd podczas dodawania zgody: ${error}`);

            await interaction.editReply({
                content: `❌ Wystąpił błąd podczas dodawania zgody.`
            });
        }
    }
}