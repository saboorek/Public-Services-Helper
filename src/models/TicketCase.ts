import { Schema, model, Document } from "mongoose";

export interface ITicketCase extends Document {
    guildId: string;
    channelId: string;
    creatorId: string;
    controlMessageId: string | null;
    deleteAt: Date | null;
}

const TicketCaseSchema = new Schema<ITicketCase>({
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    creatorId: { type: String, required: true },
    controlMessageId: { type: String, default: null },
    deleteAt: { type: Date, default: null }
});

export default model<ITicketCase>("TicketCase", TicketCaseSchema);