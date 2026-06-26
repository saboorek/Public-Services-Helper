import cron from "node-cron";
import { Client, EmbedBuilder, TextChannel } from "discord.js";
import GuildConfig from "../models/GuildConfig";
import Zgp from "../models/Zgp";
import { logger } from "../utils/logger";

const MAIN_GUILD_ID = process.env.GUILD_ID as string;
const PAGE_SIZE = 10;

export async function generateZgpReport(client: Client): Promise<{ success: boolean; message: string }> {
    if (!MAIN_GUILD_ID) {
        return { success: false, message: "process.env.GUILD_ID jest nieoznaczone w pliku .env!" };
    }

    try {
        const config = await GuildConfig.findOne({ guildId: MAIN_GUILD_ID });
        if (!config) {
            return { success: false, message: `Nie znaleziono konfiguracji GuildConfig dla ID: ${MAIN_GUILD_ID}` };
        }

        const channelId = config.zgpChannelId;
        if (!channelId) {
            return { success: false, message: "Serwer główny nie posiada skonfigurowanego kanału 'zgpChannelId'." };
        }

        const guild = await client.guilds.fetch(MAIN_GUILD_ID).catch(() => null);
        if (!guild) {
            return { success: false, message: `Bot nie ma dostępu do serwera głównego o ID: ${MAIN_GUILD_ID}` };
        }

        const channel = await guild.channels.fetch(channelId).catch(() => null) as TextChannel | null;
        if (!channel || !channel.isTextBased()) {
            return { success: false, message: `Kanał o ID ${channelId} nie istnieje lub nie jest kanałem tekstowym.` };
        }

        const allItems = await Zgp.find({}).sort({ createdAt: -1 });
        if (allItems.length === 0) {
            await channel.send({ content: "📊 **Dzienny raport ZGP:** Aktualnie baza danych zgód jest pusta." });
            return { success: true, message: "Raport wysłany (baza była pusta)." };
        }

        const totalPages = Math.ceil(allItems.length / PAGE_SIZE);
        await channel.send({ content: `📢 **dobowe zestawienie bazy danych ZGP** (Łącznie aktywnych zgód: ${allItems.length})` });

        for (let page = 0; page < totalPages; page++) {
            const start = page * PAGE_SIZE;
            const items = allItems.slice(start, start + PAGE_SIZE);

            const description = items.map((item, i) => {
                const index = start + i + 1;
                const date = new Date(item.createdAt).toLocaleDateString('pl-PL');
                return (
                    `${index} — \`${item.zgpType}\`\n` +
                    `**Użytkownik:** <@${item.userId}> | [Profil](${item.userLink})\n` +
                    `**Główna grupa:** \`${item.mainGroup}\`\n` +
                    `**Grupa przestępcza:** [Link](${item.crimeLink})\n` +
                    `\n` +
                    `**Dodał:** <@${item.addedBy}> • 📅 **Data:** ${date}`
                );
            }).join("\n\n---\n\n");

            const reportEmbed = new EmbedBuilder()
                .setColor(0x5865f2)
                .setTitle(`Zestawienie zgód ZGP — Strona ${page + 1}/${totalPages}`)
                .setDescription(description)
                .setFooter({ text: `Wygenerowano automatycznie` })
                .setTimestamp();

            await channel.send({ embeds: [reportEmbed] });
        }

        return { success: true, message: "Pomyślnie wygenerowano i wysłano raport." };

    } catch (error) {
        logger.error(`Błąd w generateZgpReport: ${error}`);
        return { success: false, message: `Wystąpił błąd krytyczny: ${error}` };
    }
}

export function initZgpAutoList(client: Client) {
    if (!MAIN_GUILD_ID) {
        logger.error("[CRON] Brak GUILD_ID w .env. Nie można odpalić harmonogramu.");
        return;
    }

    cron.schedule("0 0 * * *", async () => {
        logger.info("Uruchamianie zaplanowanego raportu dobowego ZGP...");
        const res = await generateZgpReport(client);
        if (res.success) {
            logger.success("[CRON] Dobowy raport ZGP został opublikowany.");
        } else {
            logger.error(`[CRON] Problem z raportem: ${res.message}`);
        }
    }, {
        timezone: "Europe/Warsaw"
    });
}