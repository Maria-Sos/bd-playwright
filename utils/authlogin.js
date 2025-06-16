const MailosaurClient = require("mailosaur");
import dotenv from 'dotenv';

dotenv.config();

const SERVER_ID = process.env.MAILOSAUR_SERVER_ID;
const API_KEY = process.env.MAILOSAUR_API_KEY;
const TARGET_EMAIL = `${process.env.MAILOSAUR_EMAIL_PREFIX}@${SERVER_ID}.mailosaur.net`;

/**
 * Fetches the latest login email and extracts the magic link.
 * @returns {Promise<string>} The login link from the email.
 */
export async function fetchLoginLinkFromEmail() {
  const mailosaur = new MailosaurClient(API_KEY);

  // Wait for email with magic link
  const message = await mailosaur.messages.get(
    SERVER_ID,
    {
      sentTo: TARGET_EMAIL,
      subject: 'Sign in to Automation Test',
    },
    {
      timeout: 60_000,
    }
  );

  // Extract login link
  const link = message.html.links[0];

  if (!link) throw new Error('Login link not found in email');
  return link;
}