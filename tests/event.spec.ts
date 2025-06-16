import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();
import { RegistrationPage } from '@pages/RegistrationPage';
import { ProfilePage } from '@pages/ProfilePage';
import { EventPage } from '@pages/EventPage';
import { HelperBase } from '@pages/HelperBase';

const SERVER_ID = process.env.MAILOSAUR_SERVER_ID;
const TARGET_EMAIL = `${process.env.MAILOSAUR_EMAIL_PREFIX}@${SERVER_ID}.mailosaur.net`;

  // Login via email link for registrated user:
  test.beforeEach(async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    const helper = new HelperBase(page);

    await registrationPage.loginWithEmail(TARGET_EMAIL);
    await helper.navigateToLoginLink();
  });

test.describe('Navigate to event', () => {

  test.afterEach(async ({ page }) => {
    await ProfilePage.logOutFromPage(page);
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
