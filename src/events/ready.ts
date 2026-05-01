import { Client } from "discord.js";
import { logger } from '../utils/logger';

export default {
    name: "ready",
    once: true,
    execute(client: Client) {
        logger.success(`Bot zalogowany jako ${client.user?.tag}`);
    },
};