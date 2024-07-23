import { test, expect } from "@playwright/test";
const { fetchLatestEmail } = require("../utils/imapEmail");
require('dotenv').config();
const ProfilePage = require("../pages/ProfilePage");
const RegistrationPage = require("../pages/RegistrationPage");
const EventPage = require("../pages/EventPage");
const path = require("path");
const fs = require('fs');

const getAvaLink = (selector) => {
  const regex = /url\("?(.*?)"?\)/;
  const match = selector.match(regex);
  return match ? match[1] : null;
};

const typeComment = async (page, comment) => {
  await page.chatInput.fill(comment);
  await page.saveButton.click();
};

const generateRandomFirstName = async () => {
    const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
    const randomIndex = Math.floor(Math.random() * firstNames.length);
    return firstNames[randomIndex];
}

const generateRandomLastName = async () => {
    const firstNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
    const randomIndex = Math.floor(Math.random() * firstNames.length);
    return firstNames[randomIndex];
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
const apiUrl = process.env.API_URL;
const regApiUrl = process.env.TES_URL;

let page1;
let page2;
let context;

test.describe("Verify how changing user's data reflects on event page", () => {
  //Opne two tabs and login:
  test.beforeEach(async ({ browser }) => {
    // Open two pages (tabs)
    context = await browser.newContext();
    page1 = await context.newPage();
    page2 = await context.newPage();

    // Define a helper function to perform login steps
    async function performLogin(page) {
      const registrationPage = new RegistrationPage(page);
      await registrationPage.navigate();
      await registrationPage.loginButton.click();
      await registrationPage.emailInput.fill("testbrandlive10@gmail.com");
      await registrationPage.submitButton.click();
      await page.getByText("Back to Registration").waitFor();

      const email = await fetchLatestEmail();
      if (!email) {
        throw new Error("No email found");
      }
      const loginLinkMatch = email.text.match(/https?:\/\/[^\s]+/);
      if (!loginLinkMatch) {
        throw new Error("No login link found in the email");
      }
      const loginLink = loginLinkMatch[0];
      await page.goto(loginLink);
    }

    // Perform login steps on both pages
    await Promise.all([performLogin(page1), performLogin(page2)]);
  });

  // Logout after each tests:
  test.afterEach(async ({ page }) => {
    await logOutFromPage(page);
    await logOutFromPage(page1);
});

  test("Verify a new avatar has changed for previous comments", async () => {
    let sessionId;
    let oldCommentId;
    let newCommentId;
    let commentApiUrl;
    
    await page1.on("response", async (response) => {
      if (response.url().includes(regApiUrl)) {
        const responseBody = await response.json();
        sessionId = responseBody.validSessions[0];
      }
    });

    // Page1: EvenPage -  Type fisrt testing comment
    const eventPage = new EventPage(page1);
    await eventPage.navigate();
    await page1.waitForLoadState("networkidle");
    commentApiUrl = `${apiUrl}e3-comment/${sessionId}`;
    const resPromise = page1.waitForResponse(commentApiUrl);
    await typeComment(eventPage, "Comment#01");
    const res = await resPromise;
    const responseBody = await res.json();
    oldCommentId = responseBody.id;

    // // Page2: ProfilePage - Change avatar
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

    // Page1: EvenPage -  Verify avatar was changed for priveouse comments too
    const resPromise2 = page1.waitForResponse(commentApiUrl);
    await typeComment(eventPage, "Comment#02");
    const res2 = await resPromise2;
    const responseBody2 = await res2.json();
    newCommentId = responseBody2.id;
    const newCommentSel = await page1
    .locator(`#chat-comment-${oldCommentId}>.chat-avatar`)
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
    let sessionId;
    let oldCommentId;
    let newCommentId;

    await page1.on("response", async (response) => {
        if (response.url().includes(regApiUrl)) {
          const responseBody = await response.json();
          sessionId = responseBody.validSessions[0];
        }
      });
    

    // Page1: EvenPage -  Type fisrt testing comment
    const eventPage = new EventPage(page1);
    await eventPage.navigate();
    await page1.waitForLoadState("networkidle");
    const resPromise = page1.waitForResponse(`${apiUrl}e3-comment/${sessionId}`);
    await typeComment(eventPage, "Name checking comment#01");
    const res = await resPromise;
    const responseBody = await res.json();
    oldCommentId = responseBody.id;

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

    // Page1: EvenPage -  Verify first and last name changed for priveouse comments too
    const resPromise2 = page1.waitForResponse(`${apiUrl}e3-comment/${sessionId}`);
    await typeComment(eventPage, "Name checking comment#02");
    const res2 = await resPromise2;
    const responseBody2 = await res2.json();
    newCommentId = responseBody2.id;
    const newCommentSel = await page1
        .locator(`#chat-comment-${newCommentId} .chat-commenter-name`);
    expect(newCommentSel).toHaveText(firstName + ' '  + lastName);
    const previousCommentSel = await page1
      .locator(`#chat-comment-${oldCommentId} .chat-commenter-name`);
    expect(previousCommentSel).toHaveText(firstName + ' '  + lastName);
  });
});
