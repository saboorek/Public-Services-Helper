import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
    MessageFlags
} from "discord.js";

export const evalSubcommand = {
    data: (sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("eval")
            .setDescription("Wykonuje kod JavaScript/TypeScript")
            .addStringOption(option =>
                option
                    .setName("code")
                    .setDescription("Kod do wykonania")
                    .setRequired(true)
            ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const code = interaction.options.getString("code", true);

        try {
            // eslint-disable-next-line no-eval
            let result = eval(code);

            if (result instanceof Promise) {
                result = await result;
            }

            const output = String(result);
            const type = typeof result;

            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle("✅ Eval Result")
                .addFields(
                    { name: "📥 Kod:", value: `\`\`\`javascript\n${code.slice(0, 900)}\n\`\`\`` },
                    { name: "📤 Result:", value: `\`\`\`javascript\n${output.slice(0, 900)}\n\`\`\`` },
                    { name: "🔎 Typ:", value: `\`\`\`javascript\n${type}\n\`\`\`` }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle("❌ Eval Error")
                .addFields({ name: "Error", value: `\`\`\`javascript\n${String(error).slice(0, 900)}\n\`\`\`` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
    }
};