const { test, expect } = require('@playwright/test');
const { fetchLatestEmail } = require('../utils/imapEmail');
require('dotenv').config();
const RegistrationPage = require('../pages/RegistrationPage');
const ProfilePage = require('../pages/ProfilePage');
const EventPage = require('../pages/EventPage');

test.describe('Navigate to event', () => {

  // Login via email link for registrated user:
  test.beforeEach(async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    await registrationPage.navigate();
    await registrationPage.loginButton.click();
    await registrationPage.emailInput.fill('testbrandlive10@gmail.com');
    await registrationPage.submitButton.click();
    await page.getByText('Back to Registration').waitFor();
    
    const email = await fetchLatestEmail();
    if (!email) {
      throw new Error('No email found');
    }
    const loginLinkMatch = email.text.match(/https?:\/\/[^\s]+/);
    if (!loginLinkMatch) {
      throw new Error('No login link found in the email');
    }
    const loginLink = loginLinkMatch[0];
    await page.goto(loginLink);
  });

//   test.afterEach(async ({ page }) => {
//     const profilePage = new ProfilePage(page);
//     const profileHeading = page.locator('text="My profile"');

//     if (await profilePage.profileMenu.isVisible()) {
//         await profilePage.logOut();
//         await expect(page.url()).toContain('registration');
//     } else {
//         expect(page.url()).toContain('registration');
//     }
// });

  test("Navigate to even page succesfully", async ({ page }) => {
      const eventPage = new EventPage(page);
      await expect(eventPage.speakersHeader).toHaveText('Meet our featured speakers');
      await expect(page).toHaveURL(/home/);
      await eventPage.watchButton.click();
      await expect(eventPage.videoTitle).toBeVisible();
      await expect(page).toHaveURL(`session/${process.env.EVENT_ID}`);
      await expect(eventPage.video).toHaveJSProperty('paused', false, {timeout: 15000});
  });
});
