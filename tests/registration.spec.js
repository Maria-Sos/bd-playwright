const { test, expect } = require('@playwright/test');
const RegistrationPage = require('../pages/RegistrationPage');

const user = {
    firstName: 'M',
    lastName: 'T',
    email: 'mt123@mail.com'
}

test.describe.skip("Registration form", () => {
    let registrationPage;
    test.beforeEach(async ({ page }) => {
        registrationPage = new RegistrationPage(page);
        await registrationPage.navigate();
    });

    test.afterEach(async ({ page }) => {
        const ProfilePage = require('../pages/ProfilePage');
        const profilePage = new ProfilePage(page);
        const profileHeading = page.locator('text="My profile"');
    
        if (await profilePage.profileMenu.isVisible()) {
            await profilePage.logOut();
            expect(page.url()).toContain('registration');
        } else {
            expect(page.url()).toContain('registration');
        }
    });

  test("Sign in without filling required fields shows error", async ({ page,}) => {
    await registrationPage.clickSignInExpectingError();
  });

  test("Registration form submission succesful with all requered fields", async ({ page }) => {
    await registrationPage.fillFirstName(user.firstName);
    await registrationPage.fillLastName(user.lastName);
    await registrationPage.fillEmail(user.email);
    await registrationPage.submitForm();
    await registrationPage.headingNextform.waitFor(() => {
        expect(headingNextform).toBeVisible();
    });
    await registrationPage.skipButton.click();
    await page.getByRole('heading', { name: 'Meet our featured speakers' }).waitFor(() => {
        expect(page.getByRole('heading', { name: 'Meet our featured speakers' })).toBeVisible();
        expect(page.url()).toContain('home');
    });
  });
});