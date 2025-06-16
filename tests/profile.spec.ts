import { test, expect } from "@playwright/test";
import * as dotenv from 'dotenv';
dotenv.config();
import { RegistrationPage } from '@pages/RegistrationPage';
import { ProfilePage } from '@pages/ProfilePage';
import { EventPage } from '@pages/EventPage';
import { HelperBase } from "@pages/HelperBase";

const SERVER_ID = process.env.MAILOSAUR_SERVER_ID;
const TARGET_EMAIL = `${process.env.MAILOSAUR_EMAIL_PREFIX}@${SERVER_ID}.mailosaur.net`;

const path_image = HelperBase.getRandomAssetFilePath();

let page1;
let page2;
let context;
let sessionId;
let oldCommentId;
let newCommentId;

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
    // Page1: EventPage - Type first testing comment
    const eventPage = new EventPage(page1);
    await eventPage.watchButton.click();
    await page1.waitForLoadState("networkidle");
    oldCommentId = await eventPage.typeComment("Comment#00001", sessionId);
   
    // Page2: ProfilePage - Change avatar
    const profilePage = new ProfilePage(page2);
    await profilePage.navigateToProfile();
    await profilePage.avatarInput.setInputFiles(path_image);
    await page2.waitForLoadState("networkidle");
    const newAvatar = await profilePage.avatar.getAttribute("style");
    const newAvaUrl = HelperBase.getAvaLink(newAvatar);
    await expect(profilePage.menuProfileAvatar).toHaveAttribute(
      "src",
      newAvaUrl
    );

    // Page1: EventPage - Verify avatar was changed for previous comments too
    newCommentId = await eventPage.typeComment("Comment#00002", sessionId);
    await eventPage.verifyAvatarLink(newCommentId, newAvaUrl);
    await eventPage.verifyAvatarLink(oldCommentId, newAvaUrl);
  });

  test('Verify a new name has changed for previous comments', async () => {
    // Page1: EventPage - Type first testing comment
    const eventPage = new EventPage(page1);
    await eventPage.watchButton.click();
    await page1.waitForLoadState("networkidle");
    oldCommentId = await eventPage.typeComment("Comment#01", sessionId);

    // Page2: ProfilePage - Change first and last names
    const profilePage = new ProfilePage(page2);
    await profilePage.navigateToProfile();
    const firstName = HelperBase.generateRandomFirstName();
    const lastName = HelperBase.generateRandomLastName();
    await profilePage.editButton.click();
    await profilePage.editModal.waitFor({state: 'visible'});
    await profilePage.firstNameInput.fill(firstName); 
    await profilePage.lastNameInput.fill(lastName);
    await profilePage.saveButton.click();
    await page2.waitForLoadState("networkidle");
    await expect(profilePage.name).toHaveText(firstName + ' ' + lastName);

    // Page1: EventPage - Verify first and last name changed for previous comments too
    newCommentId = await eventPage.typeComment("Comment#02", sessionId);

    await eventPage.getCommenterName(newCommentId, firstName, lastName);
    await eventPage.getCommenterName(oldCommentId, firstName, lastName);
  });
});