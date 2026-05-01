import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
    SlashCommandOptionsOnlyBuilder,
    Client,
    AutocompleteInteraction,
} from "discord.js";
import { Collection } from "discord.js";

export interface Command {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder;
    execute?: (interaction: ChatInputCommandInteraction, client: Client) => Promise<void>;
    devOnly?: boolean;
    subCommands?: Map<string, Command>;
    autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}