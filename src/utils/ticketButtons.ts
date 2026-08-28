import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export function createTicketButtons(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('ticket_take')
            .setLabel('📌 Przyjmij')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('ticket_close')
            .setLabel('🔒 Zamknij')
            .setStyle(ButtonStyle.Danger)
    );
}

export function createCloseButton(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('ticket_close')
            .setLabel('🔒 Zamknij')
            .setStyle(ButtonStyle.Danger)
    );
}