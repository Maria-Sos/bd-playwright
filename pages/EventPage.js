class EventPage {
    constructor(page) {
        this.page = page;
        this.watchButton = page.locator('.side-nav-link >> text=Watch');
        this.speakersHeader = page.locator('h2.speakers-title');
        this.videoTitle = page.locator('.video-title h4:has-text("Informational video about BrandLive")');

      }
    
      async clickWatchButton() {
        await this.page.waitForSelector('.navbar__content');
        await this.watchButton.click();
      }

}

module.exports = EventPage;