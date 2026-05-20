import { Client } from "discord.js";
import WarrantCase, { IWarrantCase } from "../models/WarrantCase";
import WarrantConfig from "../models/WarrantConfig";
import { logger } from "./logger";

export async function checkWarrantReminders(client: Client): Promise<void> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const pendingCases: IWarrantCase[] = await WarrantCase.find({
        createdAt: { $lte: sevenDaysAgo },
        reminded: false,
        reviewChannelId: { $ne: null }
    }).catch(() => []);

    if (pendingCases.length === 0) return;

    const byChannel = new Map<string, IWarrantCase[]>();
    for (const c of pendingCases) {
        const key = c.reviewChannelId!;
        if (!byChannel.has(key)) byChannel.set(key, []);
        byChannel.get(key)!.push(c);
    }

    for (const [reviewChannelId, cases] of byChannel) {
        try {
            const guildId = cases[0].guildId;
            const config = await WarrantConfig.findOne({ guildId });
            if (!config?.role?.superiorCourtRoleId) continue;

            const reviewChannel = await client.channels.fetch(reviewChannelId).catch(() => null);
            if (!reviewChannel || !reviewChannel.isTextBased()) continue;

            const lines = await Promise.all(cases.map(async (c) => {
                const elapsed = Math.floor((Date.now() - c.createdAt.getTime()) / (1000 * 60 * 60 * 24));
                const messageLink = `https://discord.com/channels/${guildId}/${c.reviewChannelId}/${c.reviewMessageId}`;

                const guild = await client.guilds.fetch(guildId).catch(() => null);
                const member = await guild?.members.fetch(c.creatorId).catch(() => null);
                const displayName = member?.displayName ?? c.creatorId;

                return `* Wniosek użytkownika \`${displayName}\` oczekuje na decyzję od \`${elapsed} dni\`→ [przejdź do wniosku](${messageLink})`;
            }));

            const message =
                `<@&${config.role.superiorCourtRoleId}>\n\n` +
                `**Wnioski oczekujące na sprawdzenie:**\n` +
                lines.join('\n');

            await (reviewChannel as any).send({ content: message });

            await WarrantCase.updateMany(
                { _id: { $in: cases.map(c => c._id) } },
                { reminded: true }
            );

            logger.info(`Wysłano przypomnienie dla ${cases.length} wniosków na kanale ${reviewChannelId}`);
        } catch (error) {
            logger.error(`Błąd podczas wysyłania przypomnienia: ${error}`);
        }
    }
}