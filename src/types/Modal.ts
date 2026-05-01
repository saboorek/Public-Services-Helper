import { ModalSubmitInteraction } from "discord.js";
import { Client } from "discord.js";

export interface Modal {
    customId: string;
    execute: (interaction: ModalSubmitInteraction, client: Client) => Promise<void>;
}