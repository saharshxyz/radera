# arkiv
Forked from [jbis9051/slackdelete](https://github.com/jbis9051/slackdelete/)

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
4. Run `npm i && npm start`

Note: Setting your env vars through a `.env` file may not work. If this happens to you, run `export OAUTH_ACCESS_TOKEN=xoxp-YOUR_TOKEN`, `export SLACK_USERNAME=YOUR_SLACK_USERNAME`, and then `npm start`
