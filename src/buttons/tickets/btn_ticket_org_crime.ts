import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    LabelBuilder
} from "discord.js";

export const orgCrimeButton = {
    customId: 'btn_ticket_org_crime',

    async execute(interaction: ButtonInteraction): Promise<void> {

        try {
            const orgCrimeModal = new ModalBuilder()
                .setCustomId('orgCrimeModal')
                .setTitle('Wniosek o zgodę na grę LEA - Crime');


            const applicantAccountLink = new TextInputBuilder()
                .setCustomId('applicantAccountLink')
                .setPlaceholder('Podaj link do swojego konta na forum')
                .setRequired(true)
                .setStyle(TextInputStyle.Short)
                .setMaxLength(200);

            const applicantAccountLinkLabel = new LabelBuilder()
                .setLabel('Link do konta na forum:')
                .setTextInputComponent(applicantAccountLink);

            const applicantFaction = new TextInputBuilder()
                .setCustomId('applicantFaction')
                .setPlaceholder('Podaj nazwę swojej frakcji')
                .setRequired(true)
                .setStyle(TextInputStyle.Short)
                .setMaxLength(100);

            const applicantFactionLabel = new LabelBuilder()
                .setLabel('Nazwa frakcji:')
                .setTextInputComponent(applicantFaction);

            const applicantOrganization = new TextInputBuilder()
                .setCustomId('applicantOrganization')
                .setPlaceholder('Podaj nazwę organizacji przestępczej')
                .setRequired(true)
                .setStyle(TextInputStyle.Short)
                .setMaxLength(100);

            const applicantOrganizationLabel = new LabelBuilder()
                .setLabel('Nazwa organizacji przestępczej:')
                .setTextInputComponent(applicantOrganization);

            const organizationLink = new TextInputBuilder()
                .setCustomId('organizationLink')
                .setPlaceholder('Podaj link do tematu organizacji przestępczej')
                .setRequired(true)
                .setStyle(TextInputStyle.Short)
                .setMaxLength(200);

            const organizationLinkLabel = new LabelBuilder()
                .setLabel('Link do tematu organizacji przestępczej:')
                .setTextInputComponent(organizationLink);

            orgCrimeModal.addLabelComponents(applicantAccountLinkLabel, applicantFactionLabel, applicantOrganizationLabel, organizationLinkLabel);

            await interaction.showModal(orgCrimeModal);
        } catch (e) {
            console.error('OrgCrime modal build error:', e);
        }
    }
}