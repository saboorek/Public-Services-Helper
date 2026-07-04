import { GuildMember } from "discord.js";
import RoleMapping from "../models/RoleMapping";
import { syncRoles } from "../utils/syncRoles";
import { logger } from "../utils/logger";

export default {
    name: "guildMemberUpdate",
    async execute(oldMember: GuildMember, newMember: GuildMember) {
        // Sprawdź czy zmieniły się role
        const oldRoles = oldMember.roles.cache;
        const newRoles = newMember.roles.cache;

        const rolesChanged =
            oldRoles.size !== newRoles.size ||
            newRoles.some((_, id) => !oldRoles.has(id)) ||
            oldRoles.some((_, id) => !newRoles.has(id));

        if (!rolesChanged) return;

        try {
            // Znajdź mappingi, gdzie ten serwer jest targetGuildId
            const mappings = await RoleMapping.find({ targetGuildId: newMember.guild.id });
            if (mappings.length === 0) return;

            const mainGuildIds = [...new Set(mappings.map(m => m.guildId))];

            for (const mainGuildId of mainGuildIds) {
                await syncRoles(newMember.id, mainGuildId, newMember.client, true);
            }
        } catch (error) {
            logger.error(`Błąd syncRoles przy aktualizacji ról ${newMember.id} na ${newMember.guild.id}: ${error}`);
        }
    }
};