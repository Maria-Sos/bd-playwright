const MailosaurClient = require("mailosaur");
import { Page } from 'playwright';
import * as dotenv from 'dotenv';
import path = require('path');
import fs = require('fs');
dotenv.config();

const SERVER_ID = process.env.MAILOSAUR_SERVER_ID!;
const API_KEY = process.env.MAILOSAUR_API_KEY!;
const TARGET_EMAIL = `${process.env.MAILOSAUR_EMAIL_PREFIX}@${SERVER_ID}.mailosaur.net`;

export class HelperBase {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Waits for the login email and navigates to the magic link.
   */
  async navigateToLoginLink() {
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

    // Extract login link and navigate to it
    const link = message.html.links[0];
    if (!link) throw new Error('Login link not found in email');

    await this.page.goto(link.href);
    return link.href;
  }

  // --- Static utility methods ---

  static getAvaLink(selector: string): string | null {
    const regex = /url\("?(.*?)"?\)/;
    const match = selector.match(regex);
    return match ? match[1] : null;
  }

  static generateRandomFirstName(): string {
    const firstNames = [
      "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
      "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
      "Thomas", "Sarah", "Charles", "Karen"
    ];
    const randomIndex = Math.floor(Math.random() * firstNames.length);
    return firstNames[randomIndex];
  }

  static generateRandomLastName(): string {
    const lastNames = [
      "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
      "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
      "Thomas", "Taylor", "Moore", "Jackson", "Martin"
    ];
    const randomIndex = Math.floor(Math.random() * lastNames.length);
    return lastNames[randomIndex];
  }

  static getRandomAssetFilePath(): string {
    const assetsDir = path.join(__dirname, "../assets");
    const files = fs.readdirSync(assetsDir);
    if (files.length === 0) {
      throw new Error("No files found in the assets directory.");
    }
    const randomIndex = Math.floor(Math.random() * files.length);
    const randomFile = files[randomIndex];
    return path.join(assetsDir, randomFile);
  }
}