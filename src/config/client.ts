import { Client, Collection, GatewayIntentBits } from "discord.js";
import { Command } from "../types/Command";
import { Modal } from "../types/Modal";

export const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
}) as Client & {
    commands: Collection<string, Command>;
    modals: Collection<string, Modal>;
};

client.commands = new Collection();
client.modals = new Collection();