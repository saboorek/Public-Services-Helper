import {
    ModalSubmitInteraction,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    MessageFlags,
    TextChannel
} from "discord.js";
import { logger } from "../../utils/logger";
import { createTranscript } from "discord-html-transcripts";
import WarrantCase from "../../models/WarrantCase";
import { EmbedColors } from '../../config/colors';

export const denyWarrantModal = {
    customId: "denyWarrantModal",

    async execute(interaction: ModalSubmitInteraction): Promise<void> {
        if (interaction.replied || interaction.deferred) return;
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const judge = interaction.fields.getTextInputValue("denyJudge");
            const reason = interaction.fields.getTextInputValue("denyReason");
            const channelId = interaction.customId.split("_")[1];

            const warrantChannel = await interaction.guild!.channels.fetch(channelId).catch(() => null) as TextChannel | null;
            const warrantCase = await WarrantCase.findOne({ channelId });

            const transcript = warrantChannel
                ? await createTranscript(warrantChannel, {
                    filename: `transcript-${channelId}.html`,
                    poweredBy: false,
                })
                : null;

            let oldEmbed: any = null;

            const originalMessage = interaction.message;
            if (originalMessage) {
                oldEmbed = originalMessage.embeds[0];

                const fields = oldEmbed.fields
                    .filter((f: any) => f.name !== "Kanał wnioskującego o nakaz:")
                    .concat(
                        { name: '🧑‍⚖️ Sędzia rozpatrujący wniosek:', value: judge || '-', inline: false },
                        {name: "❌ Powód odrzucenia", value: reason, inline: false}
                    );

                const updatedEmbed = EmbedBuilder.from(oldEmbed)
                    .setColor(EmbedColors.denied)
                    .setFields(fields);

                const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId("deny_disabled")
                        .setLabel(`❌ Odrzucony przez ${interaction.user.tag}`)
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true),
                );

                await originalMessage.edit({
                    embeds: [updatedEmbed],
                    components: [disabledRow],
                    files: transcript ? [transcript] : []
                });
            }

            if (warrantChannel) {
                const denyEmbed = new EmbedBuilder()
                    .setColor(EmbedColors.denied)
                    .setTitle("❌ Wniosek został odrzucony")
                    .setDescription(`Twój wniosek został odrzucony przez <@${interaction.user.id}>.`)
                    .addFields(
                        { name: '🧑‍⚖️ Sędzia rozpatrujący wniosek:', value: judge || '-', inline: false },
                        { name: "❌ Powód odrzucenia", value: reason }
                    )
                    .setTimestamp();

                await warrantChannel.send({
                    embeds: [denyEmbed],
                    files: transcript ? [transcript] : []
                });

                const creatorId = warrantCase?.creatorId;
                logger.info(`Twórca kanału ${channelId}: ${creatorId ?? 'nieznany'}`);

                if (creatorId) {
                    try {
                        const creator = await interaction.client.users.fetch(creatorId).catch(() => null);
                        logger.info(`Pobrano usera: ${creator?.tag ?? 'null'} (${creatorId})`);
                        if (creator) {
                            const dmFields = (warrantCase?.fields ?? []).map(f => ({
                                name: f.name,
                                value: f.value,
                                inline: false
                            }));

                            const dmEmbed = new EmbedBuilder()
                                .setColor(EmbedColors.denied)
                                .setTitle("❌ Twój wniosek został odrzucony")
                                .addFields(
                                    ...dmFields,
                                    { name: '🧑‍⚖️ Sędzia rozpatrujący wniosek:', value: judge || '-', inline: false },
                                    { name: "❌ Powód odrzucenia", value: reason, inline: false }
                                )
                                .setTimestamp();

                            await creator.send({
                                embeds: [dmEmbed],
                                files: transcript ? [transcript] : []
                            });
                        }
                    } catch (error) {
                        logger.warn(`Nie udało się wysłać DM do twórcy wniosku — kanał ${channelId}: ${error}`);
                    }
                }

                await warrantChannel.permissionOverwrites.set([
                    { id: interaction.guild!.id, deny: ["ViewChannel", "SendMessages"] }
                ]);

                setTimeout(async () => {
                    await WarrantCase.deleteOne({ channelId }).catch(() => {});
                    await warrantChannel.delete().catch(() => {});
                }, 24 * 60 * 60 * 1000);
            }

            await interaction.editReply({ content: "❌ Wniosek został odrzucony." });
            logger.success(`Warrant odrzucony przez ${interaction.user.tag} — kanał ${channelId}`);

        } catch (error) {
            logger.error(`Błąd podczas odrzucania wniosku: ${error}`);
            await interaction.editReply({ content: "❌ Wystąpił błąd podczas odrzucania wniosku." });
        }
    }
};

export default denyWarrantModal;