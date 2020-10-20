const {WebAPICallResult, WebClient} = require('@slack/web-api');

class API {
    web;

    constructor(SLACK_TOKEN, username) {
        this.SLACK_TOKEN = SLACK_TOKEN;
        this.web = new WebClient(this.SLACK_TOKEN);
        this.username = username;
        this.commonOptions = {query: `from:@${username}`,};
    }

    async getPaginationInfo(){
        const res = await this.web.search.all({...this.commonOptions, count: 100, page: 1});
        return {
            files: {
                total: res.files.pagination.page_count
            },
            messages: {
                total: res.messages.pagination.page_count
            }
        }
    }

    async get(page, type){
        const res = await this.web.search[type]({...this.commonOptions, count: 100, page});
        return res[type].matches;
    }

}
module.exports = API;
