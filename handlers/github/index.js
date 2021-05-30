const IssueService = require('./issue');
const PullRequestService = require('./issue');

const {Firestore} = require('@google-cloud/firestore');

const GithubService = class {
  static init(robot, telegramBot){
    const firestore = new Firestore();
    const firestoreCollection = firestore.collection('gitgram');

    const issueService = IssueService.init(robot, telegramBot, firestoreCollection);
    const pullRequestService = new PullRequestService(robot, telegramBot, firestoreCollection);
  }
}

module.exports = GithubService;