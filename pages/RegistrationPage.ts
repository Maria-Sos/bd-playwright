import { Locator, Page } from 'playwright';

export class RegistrationPage {
    readonly page: Page;
    loginButton: Locator;
    emailInput: Locator;
    submitButton: Locator;
    backToRegButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.getByPlaceholder('Email Address');
        this.loginButton = page.getByRole('button', {name:  'Already registered? Sign in here'});
        this.emailInput = page.locator('#reregister-email-field');
        this.submitButton = page.getByRole('button', {name:  'Submit'});
        this.backToRegButton = page.getByRole('button', {name:  'Back to Registration'})
    }

    async navigate() {
        await this.page.goto('registration');
    }

    async loginWithEmail(email: string) {
        await this.navigate();
        await this.loginButton.click();
        await this.emailInput.fill(email);
        await this.submitButton.click();
        await this.page.getByText('Back to Registration').waitFor();
    }
}
