import { Client, TextChannel } from "discord.js";
import WarrantCase from "../models/WarrantCase";

export default {
    name: "channelDelete",
    async execute(channel: TextChannel) {
        await WarrantCase.deleteOne({ channelId: channel.id }).catch(() => {});
    }
};