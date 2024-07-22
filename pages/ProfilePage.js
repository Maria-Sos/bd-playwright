class ProfilePage {
    constructor(page) {
        this.page = page;
        this.profileMenu = page.getByLabel('Open profile pop-up');
        this.logOutButton = page.getByRole('button', { name: 'Logout' });
        this.heading = page.locator('h2:has-text("Grab your spot!")');
    }

    async logOut() {
        await this.profileMenu.click();
        await this.logOutButton.click();
        await this.heading.waitFor(() => {
            expect(this.heading).isVisible()
        });
    }

}

module.exports = ProfilePage;