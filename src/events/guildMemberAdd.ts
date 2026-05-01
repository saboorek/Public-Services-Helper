import { GuildMember } from "discord.js";
import RoleMapping from "../models/RoleMapping";
import GuildConfig from "../models/GuildConfig";
import { syncRoles } from "../utils/syncRoles";
import { logger } from "../utils/logger";

export default {
    name: "guildMemberAdd",
    async execute(member: GuildMember) {
        try {
            const mappings = await RoleMapping.find({ targetGuildId: member.guild.id });
            const mainGuildIds = [...new Set(mappings.map(m => m.guildId))];

            for (const mainGuildId of mainGuildIds) {
                await syncRoles(member.id, mainGuildId, member.client);
            }

            const isMainGuild = await GuildConfig.findOne({ guildId: member.guild.id });
            if (isMainGuild) {
                await syncRoles(member.id, member.guild.id, member.client);
            }
        } catch (error) {
            logger.error(`Błąd syncRoles przy dołączeniu ${member.id}: ${error}`);
        }
    }
};