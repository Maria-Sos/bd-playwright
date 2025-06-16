import { Locator, Page } from 'playwright';

export class RegistrationPage {
    readonly page: Page;
    form: Locator;
    firstNameInput: Locator;
    lastNameInput: Locator;
    emailInput: Locator;
    favoriteFrameworkInput: Locator;
    nextButton: Locator;
    signInButton: Locator;
    headingNextform: Locator;
    addAvatar: Locator;
    skipButton: Locator;
    errorMessage: Locator;
    loginButton: Locator;
    submitButton: Locator;
    backToRegButton: Locator;
    
    constructor(page: Page) {
        this.page = page;
        this.form = page.locator('.registration-form');
        this.firstNameInput = page.getByPlaceholder('First Name');
        this.lastNameInput = page.getByPlaceholder('Last Name');
        this.emailInput = page.getByPlaceholder('Email Address');
        this.favoriteFrameworkInput = page.locator('#file-input-14916');
        this.nextButton = page.getByRole('button', { name: 'Next' });
        this.signInButton = page.locator('.sign-in');
        this.headingNextform = page.locator('h2.evt-heading-2', { hasText: 'Add a profile photo' });
        this.addAvatar = page.locator('button.avatar-upload.secondary');
        this.skipButton = page.getByRole('button', { name: 'Skip' });
        this.errorMessage = page.locator('.registration-error');
        this.loginButton = page.getByRole('button', {name:  'Already registered? Sign in here'});
        this.emailInput = page.locator('#reregister-email-field');
        this.submitButton = page.getByRole('button', {name:  'Submit'});
        this.backToRegButton = page.getByRole('button', {name:  'Back to Registration'})
    }

    async navigate() {
        await this.page.goto('registration');
    }

    async fillFirstName(name) {
        await this.firstNameInput.fill(name);
    }

    async fillLastName(name) {
        await this.lastNameInput.fill(name);
    }

    async fillEmail(email) {
        await this.emailInput.fill(email);
    }

    async fillFavoriteFramework(framework) {
        await this.favoriteFrameworkInput.fill(framework);
    }

    async submitForm() {
        await this.nextButton.click({ force: true });
    }

    async fillOutAndSubmitForm(user) {
        await this.firstNameInput.fill(user.firstName);
        await this.lastNameInput.fill(user.lastName);
        await this.emailInput.fill(user.email);
        await this.nextButton.click();
    }

    async navigateToSignIn() {
        await this.signInButton.click();
    }

    async clickSignInExpectingError() {
        await this.nextButton.click();
        await this.page.waitForSelector('.registration-error', { state: 'visible' });
        const errorMessages = await this.page.$$eval('.registration-error', elements =>
            elements.map(element => element.textContent.trim())
        );
        const expectedErrors = ['Field is required', 'Please enter a valid email address.'];
        const allErrorsPresent = expectedErrors.every(expectedError =>
            errorMessages.includes(expectedError));
            if (!allErrorsPresent) {
            throw new Error('Not all expected error messages were found.');
        }
    }
}
