import { Schema, model, Document } from 'mongoose';

export interface IZgp extends Document {
    guildId: string;
    addedBy: string;
    zgpType: string;
    userId: string;
    userLink: string;
    mainGroup: string;
    crimeLink: string;
    createdAt: Date;
}

const zgpSchema = new Schema<IZgp> ({
    guildId: { type: String, required: true },
    addedBy: { type: String, required: true },
    zgpType: { type: String, required: true },
    userId: { type: String, required: true },
    userLink: { type: String, required: true },
    mainGroup: { type: String, required: true },
    crimeLink: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default model<IZgp>("Zgp", zgpSchema);