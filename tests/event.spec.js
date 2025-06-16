import { test, expect } from '@playwright/test';
import { fetchLoginLinkFromEmail } from '../utils/authlogin';
import dotenv from 'dotenv';
dotenv.config();
import RegistrationPage from '../pages/RegistrationPage';
import ProfilePage from '../pages/ProfilePage';
import EventPage from '../pages/EventPage';

const SERVER_ID = process.env.MAILOSAUR_SERVER_ID;
const TARGET_EMAIL = `${process.env.MAILOSAUR_EMAIL_PREFIX}@${SERVER_ID}.mailosaur.net`;

  // Login via email link for registrated user:
  test.beforeEach(async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    await registrationPage.navigate();
    await registrationPage.loginButton.click();
    await registrationPage.emailInput.fill(TARGET_EMAIL);
    await registrationPage.submitButton.click();
    await page.getByText('Back to Registration').waitFor();
    
    const loginLink = await fetchLoginLinkFromEmail();
    if (!loginLink) {
      throw new Error('No login link found in the email');
    }
    await page.goto(loginLink.href);
  });

test.describe('Navigate to event', () => {

  test.afterEach(async ({ page }) => {
    const profilePage = new ProfilePage(page);
    profilePage.navigateToProfile();
    await profilePage.profileMenu.waitFor({state: 'visible'})

    if (await profilePage.profileMenu.isVisible()) {
        await profilePage.logOut();
        expect(page.url()).toContain('registration');
    } else {
        expect(page.url()).toContain('registration');
    }
});

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
