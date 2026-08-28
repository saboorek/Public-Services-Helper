import {
    ModalSubmitInteraction,
    EmbedBuilder,
    MessageFlags,
    PermissionFlagsBits,
    ChannelType,
    ActionRowBuilder,
    TextChannel, ButtonBuilder, ButtonStyle
} from "discord.js";
import { logger } from "../../utils/logger";
import { EmbedColors } from "../../config/colors";
import { toChannelSafeName} from "../../utils/channelName";
import { createCloseButton } from "../../utils/ticketButtons";
import TicketsConfig from "../../models/TicketsConfig";
import TicketCase from "../../models/TicketCase";

export const dirtyCopModal = {
    customId: 'dirtyCopModal',

    async execute (interaction: ModalSubmitInteraction): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const userSelectedCollection = interaction.fields.getSelectedUsers('dirtyCopUserSelect');
            const dirtyCopAgency = interaction.fields.getTextInputValue('dirtyCopAgency');
            const dirtyCopName = interaction.fields.getTextInputValue('dirtyCopName');
            const reportedUser = userSelectedCollection?.first()

            const config = await TicketsConfig.findOne({ guildId: interaction.guildId });

            if (!config?.category.dirtyCop) {
                await interaction.editReply({
                    content: '❌ Kategoria ticketów dla Dirty Cop nie została skonfigurowana. Użyj komendy `/tickets setcategory` aby ją ustawić.'
                });
                return;
            }
            const channelName = `${toChannelSafeName(dirtyCopAgency)}-${toChannelSafeName(dirtyCopName)}`;

            const rolesIds = [
                config.supportRoles.publicOrgManager,
                config.supportRoles.publicOrgAssistant,
            ];

            const allowedIds = [
                reportedUser?.id,
                ...rolesIds,
            ].filter(Boolean) as string[];

            const permissionOverwrites: any [] = [
                {
                    id: interaction.guild!.id,
                    deny: [
                        PermissionFlagsBits.ViewChannel
                    ],
                },
                ...allowedIds.map(id => ({
                    id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ],
                })),
            ];

            const channel = await interaction.guild!.channels.create({
                name: `${channelName}`,
                type: ChannelType.GuildText,
                parent: config.category.dirtyCop,
                permissionOverwrites,
            });

            const channelEmbed = new EmbedBuilder()
                .setTitle(`Kanał do korumpowania`)
                .setColor(EmbedColors.info)
                .setDescription(`Hej ${reportedUser}. Oto twój kanał kontaktowy stworzony pod grę skorumpowanego gliny. Zamieszczaj tutaj wszystkie screeny i logi dotycząve gry korumpa.`)
                .setFooter({ text: `System rejestrowania postaci skorumpowanych` })
                .setTimestamp()

            const rulesEmbed = new EmbedBuilder()
                .setTitle(`Zasady dotyczące postaci skorumpowanych`)
                .setColor(EmbedColors.denied)
                .setDescription(`W związku z akceptacją twojego wniosku na grę postaci skorumpowanej - oto kilka zasad, według których musisz prowadzić swoją rozgrywkę i z których potencjalnie możesz zostać rozliczony w przypadku ich łamania:\n
                * Zakaz angażowania osób bez zgody na grę postaci skorumpowanej w jakąkolwiek działalność, która ma na celu złamanie prawa i która podlega pod ogólną ideę korupcji - kwalifikuje się w to kilka aspektów, jak zastraszanie świadków, przyjmowanie korzyści majątkowych, dokonywanie wykroczeń oraz przestępstw (Misdemeanor, Felony). W sytuacjach spornych opiekun decyduje, czyy doszło do złamania podpunktu. \n
                * Zakazuje się formowania postaci skorumpowanych w grupach, które mają na celu łamanie prawa, na wzór gangów ulicznych bądź zorganizowanych grup przestępczych. Wszelaka współpraca między takimi postaciami ma mieć charakter jednorazowy i epizodyczny,\n
                * Postacie skorumpowane - zgodnie z logiką gry - nie mogą pełnić funkcji dowódczych w strukrutach departamentów oraz FBI (od Sergeant/Supervisory Special Agent wzwyż), \n
                * Postacie te są zobowiązane do prowadzenia swojej gry w sposób ukrytyy, starając się nie ujawniać swojego działania, \n
                * Wniuosek na postać skorunpowaną może być odrzucony bez podania powodu. Opiekunowie strefy mają prawo dobierać osoby pod kątem subiektywnej opinii na temat poziomu prezentowanego przez konkretną osobę wnioskującą, \n
                * W przypadku kontrowersji na temat kreacji lub ujawnienia prowadzenia postaci skorumpowanej, zarząd strefy dopuszcza możliwość wystosowania niekorzystnej narracji wobec postaci, jak ujawnienie jednego z czynów korupcyjnych wydziałowi wewnętrznemu lub ogranowi prowadzącemu śledztwo (DA Office, FBI, etc.), \n### Postacie ze zgodą na lekkie naginanie zasad: \n
                * Postacie ze zgodą na naginanie zasad nie mogą dokonywać jakichkolwiek akcji korupcyjnych, osiagając korszyści idących z tego tytułu ze swoich działań, \n
                * Głównym celem tej zgody jest umożliwienie postaci LEA wykorzystywania nielegalnych metod jak przemoc fizyczna, które mają działać na korzyść śledztwa (próba złamania kogoś przemocą fizyczną/psychiczną do zeznań), \n
                * Zezwala się na podkładanie materiału dowodowego w przypadku długotrwałego śledztwa wobec osoby, która jest realnie uważana za osobę winną przez śledczych - kluczowa jest tu świadomość o realnej winie, a nie podejrzenia.`)
                .setFooter({ text: `System rejestrowania postaci skorumpowanych` })
                .setTimestamp()

            const controlMsg = await channel.send({
                embeds: [channelEmbed, rulesEmbed],
                components: [createCloseButton()]
            });

            await TicketCase.create({
                guildId: interaction.guildId!,
                channelId: channel.id,
                creatorId: interaction.user.id,
                controlMessageId: controlMsg.id,
                deleteAt: null,
            });

            await interaction.editReply({
                content: `✅ Twoje zgłoszenie zostało utworzone na kanale <#${channel.id}>.`
            });
        } catch (error) {
            logger.error(`Error handling dirtyCopModal: ${error}`);
            await interaction.editReply({
                content: '❌ Wystąpił błąd podczas przetwarzania zgłoszenia. Spróbuj ponownie później.'
            })
        }
    }
}