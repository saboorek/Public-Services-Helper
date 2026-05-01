import { Guild, EmbedBuilder, TextChannel } from 'discord.js';
import GuildConfig from '../models/GuildConfig';
import { logger } from './logger';

type ChannelType =  'logChannel' | 'adminChannel';

interface SendToChannelResult {
    success: boolean;
    message?: string;
}

export async function sendToChannel(
    guild: Guild | null,
    channelType: ChannelType,
    embed: EmbedBuilder,
    content?: string,
    separateMessage?: string
): Promise<SendToChannelResult> {
    if (!guild) {
        logger.error('Guild is null in sendToChannel');
        return { success: false, message: 'Guild not found.' };
    }

    try {
        const config = await GuildConfig.findOne({ guildId: guild.id });

        if (!config) {
            logger.warn(`No config found for guild ${guild.id}`);
            return { success: false, message: 'Server configuration not found. Contact an administrator.' };
        }

        const channelIdMap: Record<ChannelType, string | undefined> = {
            logChannel: config.logChannelId ?? undefined,
            adminChannel: config.adminChannelId ?? undefined,
        };

        const channelId = channelIdMap[channelType];

        if (!channelId) {
            logger.warn(`${channelType} not configured for guild ${guild.id}`);
            return {
                success: false,
                message: `${channelType.replace('Channel', '')} channel is not configured. Use \`/admin setchannel\` to set it.`
            };
        }

        const channel = await guild.channels.fetch(channelId) as TextChannel;

        if (!channel) {
            logger.error(`Channel ${channelId} not found in guild ${guild.id}`);
            return { success: false, message: 'Configured channel not found. Please reconfigure it.' };
        }

        if (!channel.isTextBased()) {
            logger.error(`Channel ${channelId} is not text-based`);
            return { success: false, message: 'Configured channel is not a text channel.' };
        }

        await channel.send({ embeds: [embed], content });

        if (separateMessage) {
            await channel.send(separateMessage);
        }

        logger.success(`Message sent to ${channelType} (${channelId}) in guild ${guild.id}`);
        return { success: true };

    } catch (error) {
        logger.error(`Error sending message to ${channelType}: ${error}`);
        return { success: false, message: 'An error occurred while sending the message.' };
    }
}