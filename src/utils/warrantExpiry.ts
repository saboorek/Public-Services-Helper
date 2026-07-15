import { Client, EmbedBuilder } from "discord.js";
import WarrantCase from "../models/WarrantCase";
import { logger } from "./logger";
import { sendToChannel } from "./sendToChannel";
import { EmbedColors } from "../config/colors";

export async function checkExpiredWarrants(client: Client): Promise<void> {
    try {
        const expired = await WarrantCase.find({
            expiresAt: { $lte: new Date(), $exists: true, $ne: null }
        });

        for (const warrantCase of expired) {
            try {
                const guild = await client.guilds.fetch(warrantCase.guildId).catch(() => null);
                if (guild) {
                    const channel = await guild.channels.fetch(warrantCase.channelId).catch(() => null);
                    const channelName = channel?.name ?? warrantCase.channelId;
                    if (channel) {
                        await channel.delete().catch(() => {});
                    }
                    const embed = new EmbedBuilder()
                        .setColor(EmbedColors.denied)
                        .setTitle("🗑️ Kanał wniosku o nakaz usunięty")
                        .setDescription(`Kanał wniosku **#${channelName}** został automatycznie usunięty po upływie 24 godzin.`)
                        .addFields(
                            { name: "👤 Wnioskujący", value: `<@${warrantCase.creatorId}>`, inline: true },
                            { name: "📋 Typ wniosku", value: warrantCase.type, inline: true },
                        )
                        .setTimestamp();

                    await sendToChannel(guild, "logChannel", embed);
                }
                await WarrantCase.deleteOne({
                    channelId: warrantCase.channelId
                });
                logger.info(`🗑️ Usunięto zakończony kanał wniosku o nakaz ${warrantCase.channelId}`)
            } catch (err) {
                logger.error(`Błąd przy usuwaniu wygasłego wniosku ${warrantCase.channelId}: ${err}`);
            }
        }
    } catch (err) {
        logger.error(`Błąd podczas sprawdzania wygasłych wniosków: ${err}`);
    }
}