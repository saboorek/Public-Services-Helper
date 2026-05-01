import { Schema, model, Document } from 'mongoose';

export interface IStrawman extends Document {
    guildId: string;
    addedBy: string;
    strawmanType: string;
    itemId: string;
    forumLink: string;
    createdAt: Date;
}

const StrawmanSchema = new Schema<IStrawman>({
    guildId: { type: String, required: true },
    addedBy: { type: String, required: true },
    strawmanType: { type: String, required: true },
    itemId: { type: String, required: true },
    forumLink: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default model<IStrawman>("Strawman", StrawmanSchema);