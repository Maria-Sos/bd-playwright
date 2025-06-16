import { Page } from 'playwright';
import { RegistrationPage } from '@pages/RegistrationPage';
import { ProfilePage } from '@pages/ProfilePage';
import { EventPage } from '@pages/EventPage';

export class PageManager {
    private readonly page: Page;
    private readonly profilePage: ProfilePage;
    private readonly registrationPage: RegistrationPage;
    private readonly eventPage: EventPage;

    constructor(page: Page) {
        this.page = page;
        this.profilePage = new ProfilePage(this.page);
        this.registrationPage = new RegistrationPage(this.page);
        this.eventPage = new EventPage(this.page);
    }

    onProfilePage() {
        return this.profilePage;
    }

    onRegistrationPage(){
        return this.registrationPage;
    }

    onEventPage() {
        return this.eventPage;
    }
}