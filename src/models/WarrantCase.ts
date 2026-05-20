import { Schema, model, Document } from 'mongoose';

export interface IWarrantCaseField {
    name: string;
    value: string;
}

export interface IWarrantCase extends Document {
    channelId: string;
    guildId: string;
    creatorId: string;
    type: string;
    fields: IWarrantCaseField[];
    createdAt: Date;
    reviewMessageId?: string | null;
    reviewChannelId?: string | null;
    reminded: boolean;
}

const WarrantCaseSchema = new Schema<IWarrantCase>({
    channelId: { type: String, required: true, unique: true },
    guildId: { type: String, required: true },
    creatorId: { type: String, required: true },
    type: { type: String, required: true },
    fields: [
        {
            name: { type: String, required: true },
            value: { type: String, required: true },
        }
    ],
    reviewMessageId: { type: String, default: null },
    reviewChannelId: { type: String, default: null },
    reminded: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

export default model<IWarrantCase>('WarrantCase', WarrantCaseSchema);