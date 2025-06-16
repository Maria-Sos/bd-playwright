import { test, expect } from "@playwright/test";
import { fetchLoginLinkFromEmail } from '../utils/authlogin';
import dotenv from 'dotenv';
dotenv.config();
const ProfilePage = require("../pages/ProfilePage");
const RegistrationPage = require("../pages/RegistrationPage");
const EventPage = require("../pages/EventPage");
const path = require("path");
const fs = require('fs');

const SERVER_ID = process.env.MAILOSAUR_SERVER_ID;
const TARGET_EMAIL = `${process.env.MAILOSAUR_EMAIL_PREFIX}@${SERVER_ID}.mailosaur.net`;

const getAvaLink = (selector) => {
  const regex = /url\("?(.*?)"?\)/;
  const match = selector.match(regex);
  return match ? match[1] : null;
};

const typeComment = async (pwPage, eventPage, comment, sessionId) => {
  await eventPage.chatInput.fill(comment);
  const commentApiUrl = `e3-comment/${sessionId}`;
  console.log('sessionId', sessionId);
  const resPromise = pwPage.waitForResponse(response =>
    response.url().includes(commentApiUrl) && response.status() === 200
  );
  await eventPage.saveButton.click();
  const res = await resPromise;
  const responseBody = await res.json();
  return responseBody.id;
};

const generateRandomFirstName = async () => {
    const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
    const randomIndex = Math.floor(Math.random() * firstNames.length);
    return firstNames[randomIndex];
}

const generateRandomLastName = async () => {
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
    const randomIndex = Math.floor(Math.random() * lastNames.length);
    return lastNames[randomIndex];
}

const getRandomAssetFilePath = () => {
    const assetsDir = path.join(__dirname, "../assets");
    const files = fs.readdirSync(assetsDir);
    if (files.length === 0) {
      throw new Error("No files found in the assets directory.");
    }
    const randomIndex = Math.floor(Math.random() * files.length);
    const randomFile = files[randomIndex];
    return path.join(assetsDir, randomFile);
  }

const logOutFromPage = async (pageInstance) => {
    const profilePage = new ProfilePage(pageInstance);
    await profilePage.navigateToProfile();
    await pageInstance.waitForLoadState("networkidle");
    if (await profilePage.profileMenu.isVisible()) {
        await profilePage.logOut();
        expect(pageInstance.url()).toContain('registration');
    } else {
        expect(pageInstance.url()).toContain('registration');
    }
}

const path_image = getRandomAssetFilePath();

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
      await registrationPage.navigate();
      await registrationPage.loginButton.click();
      await registrationPage.emailInput.fill(TARGET_EMAIL);
      await registrationPage.submitButton.click();
      await page.getByText('Back to Registration').waitFor();

      const loginLink = await fetchLoginLinkFromEmail();
      if (!loginLink) {
        throw new Error('No login link found in the email');
      }
      if (page === page1) {
        page1._regCheckPromise = page1.waitForResponse((response) =>
          response.url().includes('e3-reregister-check') && response.status() === 200
        );
      }
      await page.goto(loginLink.href);
    }
    await Promise.all([performLogin(page1), performLogin(page2)]);
    const regResponse = await page1._regCheckPromise;
    const regBody = await regResponse.json();
    console.log('regBody:', regBody);
    sessionId = regBody.validSessions[0];
  });

  // Logout after each test:
  test.afterEach(async ({ page }) => {
    await logOutFromPage(page);
    await logOutFromPage(page1);
  });

  test("Verify a new avatar has changed for previous comments", async () => {
    // Page1: EventPage - Type first testing comment
    const eventPage = new EventPage(page1);
    await eventPage.watchButton.click();
    await page1.waitForLoadState("networkidle");
    oldCommentId = await typeComment(page1, eventPage, "Comment#00001", sessionId);
   
    // Page2: ProfilePage - Change avatar
    const profilePage = new ProfilePage(page2);
    await profilePage.navigateToProfile();
    const currentAvatar = await profilePage.avatar.getAttribute("style");
    await profilePage.avatarInput.setInputFiles(path_image);
    await page2.waitForLoadState("networkidle");
    const newAvatar = await profilePage.avatar.getAttribute("style");
    const newAvaUrl = getAvaLink(newAvatar);
    await expect(profilePage.menuProfileAvatar).toHaveAttribute(
      "src",
      newAvaUrl
    );

    // Page1: EventPage - Verify avatar was changed for previous comments too
    newCommentId = await typeComment(page1, eventPage, "Comment#00002", sessionId);

    const newCommentSel = await page1
      .locator(`#chat-comment-${newCommentId}>.chat-avatar`)
      .getAttribute("style");
    const newCommentAvaLink = getAvaLink(newCommentSel);
    expect(newCommentAvaLink).toEqual(newAvaUrl);
    
    const previousCommentSel = await page1
      .locator(`#chat-comment-${oldCommentId}>.chat-avatar`)
      .getAttribute("style");
    const previousCommentAvaLink = getAvaLink(previousCommentSel);
    expect(previousCommentAvaLink).toEqual(newAvaUrl);
  });

  test('Verify a new name has changed for previous comments', async () => {
    // Page1: EventPage - Type first testing comment
    const eventPage = new EventPage(page1);
    await eventPage.watchButton.click();
    await page1.waitForLoadState("networkidle");
    oldCommentId = await typeComment(page1, eventPage, "Comment#01", sessionId);

    // Page2: ProfilePage - Change first and last names
    const profilePage = new ProfilePage(page2);
    await profilePage.navigateToProfile();
    const firstName = await generateRandomFirstName();
    const lastName = await generateRandomLastName();
    await profilePage.editButton.click();
    await profilePage.editModal.waitFor({state: 'visible'});
    await profilePage.firstNameInput.fill(firstName); 
    await profilePage.lastNameInput.fill(lastName);
    await profilePage.saveButton.click();
    await page2.waitForLoadState("networkidle");
    await expect(profilePage.name).toHaveText(firstName + ' ' + lastName);

    // Page1: EventPage - Verify first and last name changed for previous comments too
    newCommentId = await typeComment(page1, eventPage, "Comment#02", sessionId);

    const newCommentSel = await page1
      .locator(`#chat-comment-${newCommentId} .chat-commenter-name`);
    await expect(newCommentSel).toHaveText(firstName + ' '  + lastName);

    const previousCommentSel = await page1
      .locator(`#chat-comment-${oldCommentId} .chat-commenter-name`);
    await expect(previousCommentSel).toHaveText(firstName + ' '  + lastName);
  });
});