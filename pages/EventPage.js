import dotenv from 'dotenv';
dotenv.config();

class EventPage {
    constructor(page) {
        this.page = page;
        this.watchButton = page.locator('.side-nav-link >> text=Watch');
        this.speakersHeader = page.locator('h2.speakers-title');
        this.videoTitle = page.locator('.video-title h4:has-text("Informational video about BrandLive")');
        this.video = page.frameLocator('iframe[title="Meet the Brandlive Platform"]').locator('video');
        this.chatInput = page.getByPlaceholder('Chat...');
        this.saveButton = page.getByRole('button', { name: 'Send' });
      }
    
    async navigate() {
      await this.page.goto(`session/${process.env.EVENT_ID}`);
    }
}

module.exports = EventPage;