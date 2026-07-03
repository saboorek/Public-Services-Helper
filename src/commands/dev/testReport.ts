import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, MessageFlags } from "discord.js";
import { generateZgpReport } from "../../tasks/zgpAutoList";
import { logger } from "../../utils/logger";

export const testReportSubcommand = {
    data: (sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("testreport")
            .setDescription("🤖 [DEV] Wymusza natychmiastowe wygenerowanie i wysłanie dziennego zestawienia ZGP"),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        logger.info(`[DEV] Użytkownik ${interaction.user.tag} uruchomił ręczne generowanie raportu ZGP.`);

        const result = await generateZgpReport(interaction.client);

        if (result.success) {
            await interaction.editReply({
                content: `🚀 **Test ukończony sukcesem!**\nSystem raportowania wykonał zadanie i wysłał embedy na zdefiniowany kanał.\n*Komunikat: ${result.message}*`
            });
        } else {
            await interaction.editReply({
                content: `❌ **Test nieudany!**\nPodczas generowania raportu wystąpił problem:\n\`\`\`text\n${result.message}\n\`\`\``
            });
        }
    }
};