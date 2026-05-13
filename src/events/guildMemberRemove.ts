import { GuildMember, PartialGuildMember } from "discord.js";
import RoleMapping from "../models/RoleMapping";
import { syncRoles } from "../utils/syncRoles";
import { logger } from "../utils/logger";

export default {
    name: "guildMemberRemove",
    async execute(member: GuildMember | PartialGuildMember) {
        try {

            const mappings = await RoleMapping.find({ targetGuildId: member.guild.id });
            const mainGuildIds = [...new Set(mappings.map(m => m.guildId))];

            for (const mainGuildId of mainGuildIds) {
                await syncRoles(member.id, mainGuildId, member.client);
            }
        } catch (error) {
            logger.error(`Błąd syncRoles przy opuszczeniu ${member.guild.id} przez ${member.id}: ${error}`);
        }
    }
};