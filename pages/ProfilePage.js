class ProfilePage {
    constructor(page) {
        this.page = page;
        this.profileMenu = page.getByLabel('Open profile pop-up');
        this.logOutButton = page.getByRole('button', { name: 'Logout' });
        this.heading = page.locator('h2:has-text("Grab your spot!")');
        this.avatarInput = page.locator("input[type='file']");
        this.avatar = page.locator('.registration-avatar');
        this.mainMenu = page.locator('div.upper > div.left > button').first();
        this.menuProfileAvatar = page.locator('#profile-details-dropdown-container img');
        this.editButton = page.getByRole('button', { name: 'Edit' });
        this.editModal = page.locator('#modal-global-container');
        this.firstNameInput = page.getByPlaceholder('First Name');
        this.lastNameInput = page.getByPlaceholder('Last Name');
        this.saveButton = page.getByRole('button', { name: 'Save' });
        this.name = page.locator('h2.general-info-name');

    }

    async navigateToProfile() {
        await this.page.goto('profile');
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