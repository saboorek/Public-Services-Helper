import { Schema, model, Document } from 'mongoose';

export interface ITicketsConfig extends Document {
    guildId: string;
    category: {
        newTickets: string | null;
        ongoingTickets: string | null;
        closedTickets: string | null;
        dirtyCop: string | null;
        explanations: string | null;
        irsTickets: string | null;
    };
    supportRoles: {
        //Opiekunowie
        publicOrgManager: string | null;
        leaManager: string | null;
        rescueManager: string | null;

        //Pomocnicy
        publicOrgAssistant: string | null;
        leaAssistant: string | null;
        rescueAssistant: string | null;

        //Inne role
        irsRole: string | null;
    };
    panelsChannel: {
        playerSupport: string | null;
        officialRequest: string | null;
        supervisory: string | null;
    };
    transcriptsChannel?: string | null;
}

const TictetsConfigSchema = new Schema<ITicketsConfig>({
    guildId: { type: String, required: true, unique: true },
    category: {
        playerSupport: { type: String, default: null },
        officialRequest: { type: String, default: null },
        supervisory: { type: String, default: null },
        newTickets: { type: String, default: null },
        ongoingTickets: { type: String, default: null },
        closedTickets: { type: String, default: null },
        dirtyCop: { type: String, default: null },
        explanations: { type: String, default: null },
        irsTickets: { type: String, default: null },
    },
    supportRoles: {
        publicOrgManager: { type: String, default: null },
        leaManager: { type: String, default: null },
        rescueManager: { type: String, default: null },
        publicOrgAssistant: { type: String, default: null },
        leaAssistant: { type: String, default: null },
        rescueAssistant: { type: String, default: null },
        irsRole: { type: String, default: null },
    },
    panelsChannel: {
        playerSupport: { type: String, default: null },
        officialRequest: { type: String, default: null },
        supervisory: { type: String, default: null },
    },
    transcriptsChannel: { type: String, default: null },
});

export default model<ITicketsConfig>('TicketsConfig', TictetsConfigSchema);