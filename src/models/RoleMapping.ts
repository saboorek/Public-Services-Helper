import { Schema, model, Document } from "mongoose";

export interface IRoleMapping extends Document {
    guildId: string;
    targetGuildId: string;
    targetRoleId: string;
    requiredRoleId: string;
    assignedRoleId: string;
}

const RoleMappingSchema = new Schema<IRoleMapping>({
    guildId: { type: String, required: true },
    targetGuildId: { type: String, required: true },
    requiredRoleId: { type: String, required: true },
    assignedRoleId: { type: String, required: true },
});

RoleMappingSchema.index({ guildId: 1, targetGuildId: 1, requiredRoleId: 1 }, { unique: true });

export default model<IRoleMapping>("RoleMapping", RoleMappingSchema);