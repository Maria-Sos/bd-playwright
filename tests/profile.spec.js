import { test, expect } from '@playwright/test';
const { fetchLatestEmail } = require('../utils/imapEmail');
require('dotenv').config();
const ProfilePage = require('../pages/ProfilePage');
const RegistrationPage = require('../pages/RegistrationPage');
const EventPage = require('../pages/EventPage');
const path = require('path');

const getAvaLink = (selector) => {
    const regex = /url\("?(.*?)"?\)/;
    const match = selector.match(regex);
    return  match ? match[1] : null
}

const getResponse = (page, url) => {
    return new Promise((resolve, reject) => {
        page.on('response', async (response) => {
          if (response.url().includes(url)) {
            try {
              const jsonResponse = await response.json();
              resolve(jsonResponse);
            } catch (error) {
              console.error('Error capturing response:', error);
              reject(error);
            }
          }
        });
      });
}

const typeComment = async (page, comment) => {
    await page.chatInput.fill(comment);
    await page.saveButtun.click();
}

const path_image = path.join(__dirname, '../assets/ava1.jpg');

let sessionId;

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

test.only('Verify a new avatar has changed for previous comments', async ({ page }) => {
    const eventPage = new EventPage(page);
    await eventPage.navigate();
    const res = await getResponse(page, `${process.env.API_URL}/e3-validate-registration/${process.env.EVENT_ID}`);
    sessionId = res.validSessions[0];
    await page.waitForLoadState('networkidle');
    await typeComment(eventPage, 'Comment#1 with old avatar');
    const resComment = await getResponse(page, `${process.env.API_URL}/e3-comment/${sessionId}`);
    const oldCommentId = resComment.id;
    console.log(oldCommentId);
    // await page.waitForLoadState('networkidle');

    const profilePage = new ProfilePage(page);
    await profilePage.navigateToProfile();
    const currentAvatar = await profilePage.avatar.getAttribute('style');
    const oldAvaUrl = getAvaLink(currentAvatar)
    await profilePage.avatarInput.setInputFiles(path_image);
    await page.waitForLoadState('networkidle');
    const newAvatar = await profilePage.avatar.getAttribute('style');
    const newAvaUrl = getAvaLink(newAvatar);
    await expect(profilePage.menuProfileAvatar).toHaveAttribute('src', newAvaUrl);
    await eventPage.navigate();
    await typeComment(eventPage, 'Comment#2 with new avatar');
    const newComment = await getResponse(page, `${process.env.API_URL}/e3-comment/${sessionId}`);
    const newCommentId = newComment.id;
    console.log(newCommentId);

    const previousCommentSel = await page.locator(`#chat-comment-${oldCommentId}>.chat-avatar`).waitFor({state: 'visible', timeout: 20000}).then(el => el.getAttribute('style'));
        // const previousCommentSel = await page.locator(`#chat-comment-${oldCommentId}>.chat-avatar`).getAttribute('style');
    const previousCommentAvaLink = getAvaLink(previousCommentSel);
    await expect(previousCommentAvaLink).toEqual(newAvaUrl);

    // const newCommentSel = await page.locator(`#chat-comment-${newCommentId}>.chat-avatar`).getAttribute('style');
    // const newCommentAvaLink = getAvaLink(newCommentSel);
    // expect(newCommentAvaLink).toEqual(newAvaUrl);
    // await eventPage.chatInput.fill('New avatar');
    // await eventPage.saveButtun.click();

});

test.skip('Verify a new name has changed for previous comments - here is a bug!', async ({ page }) => {

  });

});