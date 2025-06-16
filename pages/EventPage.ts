import * as dotenv from 'dotenv';
import { Locator, Page } from 'playwright';
import { HelperBase } from './HelperBase';
import { expect } from 'playwright/test';
dotenv.config();

export class EventPage extends HelperBase {
  watchButton: Locator;
  speakersHeader: Locator;
  videoTitle: Locator;
  video: Locator;
  chatInput: Locator;
  saveButton: Locator;

    constructor(page: Page) {
      super(page)
        this.watchButton = page.locator('.side-nav-link >> text=Watch');
        this.speakersHeader = page.locator('h2.speakers-title');
        this.videoTitle = page.locator('.video-title h4:has-text("Informational video about BrandLive")');
        this.video = page.frameLocator('iframe[title="Meet the Brandlive Platform"]').locator('video');
        this.chatInput = page.getByPlaceholder('Chat...');
        this.saveButton = page.getByRole('button', { name: 'Send' });
      }

    async typeComment(comment: string, sessionId: string | number): Promise<number> {
      await this.chatInput.fill(comment);
      const commentApiUrl = `e3-comment/${sessionId}`;
      const resPromise = this.page.waitForResponse(response =>
        response.url().includes(commentApiUrl) && response.status() === 200
      );
      await this.saveButton.click();
      const res = await resPromise;
      const responseBody = await res.json();
      return responseBody.id;
    }

    async verifyAvatarLink(commentId: number, newAvaUrl: string) {
      const style = await this.page
        .locator(`#chat-comment-${commentId}>.chat-avatar`)
        .getAttribute("style");
      const avatarLink = HelperBase.getAvaLink(style);
      expect(avatarLink).toEqual(newAvaUrl);
    }

    async getCommenterName(commentId: number, firstName: string, lastName: string) {
      const nameLocator =  this.page.locator(`#chat-comment-${commentId} .chat-commenter-name`);
      await expect(nameLocator).toHaveText(firstName + ' '  + lastName);
    }
}
