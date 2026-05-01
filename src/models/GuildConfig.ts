import { Schema, model, Document } from "mongoose";

export interface IGuildConfig extends Document {
    guildId: string;
    defaultRoleId?: string | null;
    adminChannelId?: string | null;
    logChannelId?: string | null;
    RoleChannelId?: string | null;
}

const guildConfigSchema = new Schema<IGuildConfig>({
    guildId: { type: String, required: true, unique: true },
    defaultRoleId: { type: String, required: false, default: null },
    adminChannelId: { type: String, required: false, default: null },
    logChannelId: { type: String, required: false, default: null },
    RoleChannelId: { type: String, required: false, default: null },
});

export default model<IGuildConfig>("GuildConfig", guildConfigSchema);