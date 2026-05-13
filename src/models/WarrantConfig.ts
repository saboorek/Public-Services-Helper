import { Schema, model, Document } from 'mongoose';

export interface IWarrantConfig extends Document {
    guildId: string;
    panelChannelId?: string | null;
    warrants: {
        categoryId?: string | null;
        arrestChannelId?: string | null;
        searchChannelId?: string | null;
        federalChannelId?: string | null;
        surveillanceChannelId?: string | null;
        wiretapChannelId?: string | null;
        seizureChannelId?: string | null;
        lifeImprisonmentChannelId?: string | null;
        judicialChannelId?: string | null;
        appOrderSaleChannelId?: string | null;
    },
    role: {
        daoRoleId?: string | null;
        criminalDivisionRoleId?: string | null;
        leaderFbiRoleId?: string | null;
        helperRoleId?: string | null;
        supervisorRoleId?: string | null;
    }
}

const WarrantConfigSchema = new Schema<IWarrantConfig>({
    guildId: { type: String, required: true },
    panelChannelId: { type: String, default: null},
  warrants: {
      categoryId: { type: String, default: null },
      arrestChannelId: { type: String, default: null },
      searchChannelId: { type: String, default: null },
      federalChannelId: { type: String, default: null },
      surveillanceChannelId: { type: String, default: null },
      wiretapChannelId: { type: String, default: null },
      seizureChannelId: { type: String, default: null },
      lifeImprisonmentChannelId: { type: String, default: null },
      judicialChannelId: { type: String, default: null },
      appOrderSaleChannelId: { type: String, default: null },
  },
  role: {
        daoRoleId: { type: String, default: null },
        criminalDivisionRoleId: { type: String, default: null },
        leaderFbiRoleId: { type: String, default: null },
        helperRoleId: { type: String, default: null },
        supervisorRoleId: { type: String, default: null },
  }
})

export default model<IWarrantConfig>('WarrantConfig', WarrantConfigSchema);