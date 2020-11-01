# slackdelete

## Instructions

1. Create & Install Slack app with the following USER permissions:
    * chat:write
    * files:write/read
    * groups:read/write
    * im:write
    * search:read
2. Clone this repo
3. Rename `.env.template` to `.env` and add in the required variables
    * You can find your `OAUTH_ACCESS_TOKEN` in the "Install App" tab of your slack app settings
5. Run `npm i && npm start`