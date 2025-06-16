import { test, expect } from "@playwright/test";
import * as dotenv from 'dotenv';
dotenv.config();
import { RegistrationPage } from '@pages/RegistrationPage';
import { ProfilePage } from '@pages/ProfilePage';
import { EventPage } from '@pages/EventPage';
import { HelperBase } from "@pages/HelperBase";
import { PageManager } from "@pages/PageManager";

const SERVER_ID = process.env.MAILOSAUR_SERVER_ID;
const TARGET_EMAIL = `${process.env.MAILOSAUR_EMAIL_PREFIX}@${SERVER_ID}.mailosaur.net`;

const path_image = HelperBase.getRandomAssetFilePath();

let page1;
let page2;
let context;
let sessionId: number;
let oldCommentId: number;
let newCommentId: number;

test.describe("Verify how changing user's data reflects on event page", () => {
  // Open two tabs and login:
  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext();
    page1 = await context.newPage();
    page2 = await context.newPage();

    async function performLogin(page) {
      const registrationPage = new RegistrationPage(page);
      const helper = new HelperBase(page);
      page.getByText('Back to Registration').waitFor();
      await registrationPage.loginWithEmail(TARGET_EMAIL);
      if (page === page1) {
        page1._regCheckPromise = page1.waitForResponse((response) =>
          response.url().includes('e3-reregister-check') && response.status() === 200
        );
      }
      await helper.navigateToLoginLink();
    }
    await Promise.all([performLogin(page1), performLogin(page2)]);
    const regResponse = await page1._regCheckPromise;
    const regBody = await regResponse.json();
    sessionId = regBody.validSessions[0];
  });

  // Logout after each test:
  test.afterEach(async ({ page }) => {
    await ProfilePage.logOutFromPage(page1);
    await ProfilePage.logOutFromPage(page2);
  });

  test("Verify a new avatar has changed for previous comments", async () => {
    const pm1 = new PageManager(page1);
    const pm2 = new PageManager(page2);
    // Page1: EventPage - Type first testing comment
    await pm1.onEventPage().watchButton.click();
    await page1.waitForLoadState("networkidle");
    oldCommentId = await pm1.onEventPage().typeComment("Comment#00001", sessionId);
   
    // Page2: ProfilePage - Change avatar
    await pm2.onProfilePage().navigateToProfile();
    await pm2.onProfilePage().avatarInput.setInputFiles(path_image);
    await page2.waitForLoadState("networkidle");
    const newAvatar = await pm2.onProfilePage().avatar.getAttribute("style");
    const newAvaUrl = HelperBase.getAvaLink(newAvatar);
    await expect(pm2.onProfilePage().menuProfileAvatar).toHaveAttribute(
      "src",
      newAvaUrl
    );

    // Page1: EventPage - Verify avatar was changed for previous comments too
    newCommentId = await pm1.onEventPage().typeComment("Comment#00002", sessionId);
    await pm1.onEventPage().verifyAvatarLink(newCommentId, newAvaUrl);
    await pm1.onEventPage().verifyAvatarLink(oldCommentId, newAvaUrl);
  });

  test('Verify a new name has changed for previous comments', async () => {
    const pm1 = new PageManager(page1);
    const pm2 = new PageManager(page2);
    // Page1: EventPage - Type first testing comment
    await pm1.onEventPage().watchButton.click();
    await page1.waitForLoadState("networkidle");
    oldCommentId = await pm1.onEventPage().typeComment("Comment#01", sessionId);

    // Page2: ProfilePage - Change first and last names
    await pm2.onProfilePage().navigateToProfile();
    const firstName = HelperBase.generateRandomFirstName();
    const lastName = HelperBase.generateRandomLastName();
    await pm2.onProfilePage().updatefullName(firstName, lastName);
    await page2.waitForLoadState("networkidle");
    await expect(pm2.onProfilePage().name).toHaveText(firstName + ' ' + lastName);

    // Page1: EventPage - Verify first and last name changed for previous comments too
    newCommentId = await pm1.onEventPage().typeComment("Comment#02", sessionId);

    await pm1.onEventPage().getCommenterName(newCommentId, firstName, lastName);
    await pm1.onEventPage().getCommenterName(oldCommentId, firstName, lastName);
  });
});