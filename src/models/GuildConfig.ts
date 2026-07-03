import { Schema, model, Document } from "mongoose";

export interface IGuildConfig extends Document {
    guildId: string;
    defaultRoleId?: string | null;
    adminChannelId?: string | null;
    logChannelId?: string | null;
    RoleChannelId?: string | null;
    zgpChannelId?: string | null;
    zgpLimits: {
        lea: number;
        rescue: number;
    }
}

const guildConfigSchema = new Schema<IGuildConfig>({
    guildId: { type: String, required: true, unique: true },
    defaultRoleId: { type: String, required: false, default: null },
    adminChannelId: { type: String, required: false, default: null },
    logChannelId: { type: String, required: false, default: null },
    RoleChannelId: { type: String, required: false, default: null },
    zgpChannelId: { type: String, required: false, default: null },
    zgpLimits: {
        lea: { type: Number, default: 0, required: true },
        rescue: { type: Number, default: 0, required: true },
    }
});

export default model<IGuildConfig>("GuildConfig", guildConfigSchema);