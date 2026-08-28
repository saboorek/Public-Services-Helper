import { Client, EmbedBuilder } from "discord.js";
import TicketCase from "../models/TicketCase";
import { logger } from "./logger";
import { sendToChannel } from "./sendToChannel";
import { EmbedColors } from "../config/colors";

export async function checkExpiredTickets(client: Client): Promise<void> {
    try {
        const expired = await TicketCase.find({
            deleteAt: { $lte: new Date(), $exists: true, $ne: null }
        });

        for (const ticketCase of expired) {
            try {
                const guild = await client.guilds.fetch(ticketCase.guildId).catch(() => null);
                if (guild) {
                    const channel = await guild.channels.fetch(ticketCase.channelId).catch(() => null);
                    if (channel) {
                        await channel.delete().catch(() => {});
                    }

                    const embed = new EmbedBuilder()
                        .setColor(EmbedColors.denied)
                        .setTitle("🗑️ Kanał ticketu usunięty")
                        .setDescription(`Kanał ticketu **#${channel?.name ?? ticketCase.channelId}** został automatycznie usunięty po upływie 12 godzin od zamknięcia.`)
                        .setTimestamp();
                }
                await TicketCase.deleteOne({ channelId: ticketCase.channelId });
                logger.info(`🗑️ Usunięto zamknięty ticket ${ticketCase.channelId}`);
            } catch (err) {
                logger.error(`Błąd przy usuwaniu ticketu ${ticketCase.channelId}: ${err}`);
            }
        }
    } catch (err) {
        logger.error(`Błąd podczas sprawdzania wygasłych ticketów: ${err}`);
    }
}