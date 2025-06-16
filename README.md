# Preparation:

- after cloning this project create `.env` file in root folder of this project
- add next env varaibles:
    ```python
    BASE_URL = "your base url"
    EVENT_ID = "your even id"
    MAILSLURP_API_KEY=
    MAILOSAUR_SERVER_ID=
    MAILOSAUR_API_KEY=
    MAILOSAUR_EMAIL_PREFIX=
    ```
- use at least 18 verstion of node
- run `npm install` to install all dependenses 
- run test in browser: `npm run run:tests:headed`
- run test in playwirght ui: `npm run run:tests:ui`
- all other scripts you can find in `package.json` file

# What was done:

- in configuration file for running tests in chome browser was corrected projects parameters for chromium. In chromium video from event page didn't load and had error, in other browser all worked fine.
- before each test user login via email link for registrated user.
  > For that was added additional packages (imap, simple-parser etc..) and created helper function in `imapEmail.js` (`utils` folder).
  > The test user uses Outlook because it was the easiest way to set up without additional steps like creating an app in Google. Additionally, for this application, since webinars are usually set up for corporations, it would be better for the test user to have an Outlook email.

# Tests:

There are 3 tests which verify:

* The user can navigate to the event page and the video is uploaded and plays by default.
* If the user wants to change their name during the event, it should reflect on the event page for their previous comments as well (this test failed, it could be a bug).
  > For this test used running two tabs: in one should be open event page, on other - profile page
* If the user wants to change their avatar during the event, it should reflect on the event page for their previous comments as well. This test also failed, but after refreshing the event page, the avatar updated. Not sure if this is a bug or not, as there is no ACC. However, as a user, I would prefer not to reload the page and see all my updates in real-time during the event.
  > For this test used running two tabs: in one should be open event page, on other - profile page

# What could be optimized:

- set up TypeScript
- set up ci
- wrap some steps in a function to reuse it in few places, but it needs additional time for figuring out the better way to creat such kind of function in playwright logic
- use fixtures insead of hooks (beforeEach for ex)
- create login/logout logic via API calls as set up some test data
- clean up test data after test runs
