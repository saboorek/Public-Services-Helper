import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, MessageFlags } from "discord.js";
import GuildConfig from "../../models/GuildConfig";
import { logger } from '../../utils/logger'

export const zgpLimitSubcommand = {
    data: (sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("zgplimit")
            .setDescription("Ustawia limit zgód na grę w grupach przestępczych dla serwera")
            .addStringOption(option =>
                option.setName("typ")
                    .setDescription("Wybierz typ grupy, dla której chcesz zmienić limit")
                    .setRequired(true)
                    .addChoices(
                        { name: "LEA", value: "lea" },
                        { name: "RESCUE", value: "rescue" }
                    )
            )
            .addIntegerOption(option =>
                option.setName("limit")
                    .setDescription("Wprowadź maksymalną ilość wpisów (0 = brak limitu)")
                    .setRequired(true)
                    .setMinValue(0)
            ),

    async execute( interaction: ChatInputCommandInteraction ): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral});

        const zgpType = interaction.options.getString("typ", true);
        const limitValue = interaction.options.getInteger("limit", true);

        try {

            await GuildConfig.findOneAndUpdate(
                { guildId: interaction.guildId },
                { $set: { [`zgpLimits.${zgpType}`]: limitValue } },
                { new: true, upsert: true }
            );

            await interaction.editReply({
                content: `✅ Pomyślnie zaktualizowano limity serwera!\n` +
                    `• Typ: \`${zgpType}\`\n` +
                    `• Nowy limit: **${limitValue === 0 ? "Brak limitu (0)" : limitValue}**`
            });

        } catch ( error ) {
            logger.error(`Błąd podczas ustawiania limitu ZGP: ${error}`);
            await interaction.editReply({
                content: "❌ Wystąpił nieoczekiwany błąd podczas próby zapisu konfiguracji do bazy danych."
            });
        }
    }
}