import * as dotenv from 'dotenv';
import { Locator, Page } from 'playwright';
dotenv.config();

export class EventPage {
  readonly page: Page;
  watchButton: Locator;
  speakersHeader: Locator;
  videoTitle: Locator;
  video: Locator;
  chatInput: Locator;
  saveButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.watchButton = page.locator('.side-nav-link >> text=Watch');
        this.speakersHeader = page.locator('h2.speakers-title');
        this.videoTitle = page.locator('.video-title h4:has-text("Informational video about BrandLive")');
        this.video = page.frameLocator('iframe[title="Meet the Brandlive Platform"]').locator('video');
        this.chatInput = page.getByPlaceholder('Chat...');
        this.saveButton = page.getByRole('button', { name: 'Send' });
      }
}
