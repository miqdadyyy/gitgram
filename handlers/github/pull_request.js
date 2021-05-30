const StringUtils = require('../../utils/string');
const BotUtils = require('../../utils/bot');
const {getTelegramIdFromGithubOrganization} = require('../../utils/github_handler');

const PullRequestService = class {
  static init(robot, telegramBot, firestoreCollection) {
    this.robot = robot;
    this.telegramBot = telegramBot;
    this.firestoreCollection = firestoreCollection;

    this.pullRequestOpened();
    this.pullRequestClosed();
    this.pullRequestMerged();
    this.pullRequestAddReviewer();
    this.pullRequestSubmitReview();
  }
  
  static pullRequestOpened() {
    this.robot.on('pull_request.opened', async (ctx) => {
      // Get variable from payload
      const assigneeUsernames = ctx.payload.pull_request.assignees.map(assignee => assignee.login);
      const pullRequestTitle = ctx.payload.pull_request.title;
      const pullRequestUrl = ctx.payload.pull_request.url;
      const pullRequestUser = ctx.payload.pull_request.user.login || 'Unknown';
      const pullRequestNumber = ctx.payload.pull_request.number;
      const repositoryName = ctx.payload.repository.name;
      const organizationId = ctx.payload.organization.id;
      
      // Adding comment to issue
      const assigneeComment = StringUtils.joinName(assigneeUsernames.map(assignee => `@${assignee}`));
      
      const pullRequestMessage = `Thanks for opening this pull request!\n` +
        `This pull request will be assigned to ${assigneeComment}`;
      const issueComment = ctx.issue({
        body: pullRequestMessage,
      });
      ctx.octokit.issues.createComment(issueComment);
      
      // Send notification telegram by webhook
      const telegramMessage = `There is pull request from ${pullRequestUser} on ${repositoryName}\n` +
        `Repository : ${repositoryName}\n` +
        `Pull Request : ${pullRequestTitle}\n` +
        `Number : ${pullRequestNumber}\n` +
        `URL : ${pullRequestUrl}\n` +
        `Assignee : ${assigneeComment}\n\n` +
        `Please check the issue by clicking link above ❤️`;
      
      // Send message on webhook
      const chatIds = await getTelegramIdFromGithubOrganization(this.firestoreCollection, organizationId);
      for (const chatId of chatIds) {
        await this.telegramBot.telegram.sendMessage(chatId, telegramMessage);
      }
    });
  }
  
  static pullRequestClosed() {
    this.robot.on('pull_request.closed', async (ctx) => {
      // Get variable from payload
      const pullRequestTitle = ctx.payload.pull_request.title;
      const pullRequestUrl = ctx.payload.pull_request.url;
      const pullRequestNumber = ctx.payload.pull_request.number;
      const repositoryName = ctx.payload.repository.name;
      const senderUsername = ctx.payload.sender.login;
      const organizationId = ctx.payload.organization.id;
      
      // Send notification to telegram by webhook
      const telegramMessage = `Pull request *closed* by @${senderUsername} ❌\n` +
        `Repository : ${repositoryName}\n` +
        `Pull Request : ${pullRequestTitle}\n` +
        `Number : ${pullRequestNumber}\n` +
        `URL : ${pullRequestUrl}\n` +
        `Status : Closed ❌`
      
      // Send message on webhook
      const chatIds = await getTelegramIdFromGithubOrganization(this.firestoreCollection, organizationId);
      for (const chatId of chatIds) {
        await this.telegramBot.telegram.sendMessage(chatId, telegramMessage);
      }
    });
  }
  
  static pullRequestMerged() {
    this.robot.on('pull_request.merged', async (ctx) => {
      // Get variable from payload
      const pullRequestTitle = ctx.payload.pull_request.title;
      const pullRequestUrl = ctx.payload.pull_request.url;
      const pullRequestNumber = ctx.payload.pull_request.number;
      const repositoryName = ctx.payload.repository.name;
      const senderUsername = ctx.payload.sender.login;
      const organizationId = ctx.payload.organization.id;
      
      // Adding comment to issue
      // Send notification to telegram by webhook
      const telegramMessage = `Pull request *Merge* by @${senderUsername} \n` +
        `Repository : ${repositoryName}\n` +
        `Pull Request : ${pullRequestTitle}\n` +
        `Number : ${pullRequestNumber}\n` +
        `URL : ${pullRequestUrl}\n` +
        `Status : Merged ✅`
  
      // Send message on webhook
      const chatIds = await getTelegramIdFromGithubOrganization(this.firestoreCollection, organizationId);
      for (const chatId of chatIds) {
        await this.telegramBot.telegram.sendMessage(chatId, telegramMessage);
      }
    });
  }
  
  static pullRequestAddReviewer() {
    this.robot.on('pull_request.review_requested', async (ctx) => {
      // Get variable from payload
      const pullRequestTitle = ctx.payload.pull_request.title;
      const pullRequestUrl = ctx.payload.pull_request.url;
      const pullRequestNumber = ctx.payload.pull_request.number;
      const pullRequestReviewer = ctx.payload.pull_request.requested_reviewers.map(user => `@${user.login}`);
      const repositoryName = ctx.payload.repository.name;
      const senderUsername = ctx.payload.sender.login;
      const organizationId = ctx.payload.organization.id;
      
      // Adding comment to issue
      const telegramMessage = `Pull Request Reviewer Request by @${senderUsername}\n` +
        `Repository : ${repositoryName}\n` +
        `Pull Request : ${pullRequestTitle}\n` +
        `Number : ${pullRequestNumber}\n` +
        `URL : ${pullRequestUrl}\n` +
        `Status : Need to review 👨🏻‍💻\n`
        `Reviewer : ${StringUtils.joinName(pullRequestReviewer)}`;

      const chatIds = await getTelegramIdFromGithubOrganization(this.firestoreCollection, organizationId);
      for (const chatId of chatIds) {
        await this.telegramBot.telegram.sendMessage(chatId, telegramMessage);
      }
    });
  }
  
  static pullRequestSubmitReview() {
    this.robot.on('pull_request.submitted', async (ctx) => {
      // Get variable from payload
      const pullRequestTitle = ctx.payload.pull_request.title;
      const pullRequestUrl = ctx.payload.pull_request.url;
      const repositoryName = ctx.payload.repository.name;
      const pullRequestNumber = ctx.payload.pull_request.number;
      const senderUsername = ctx.payload.sender.login;
      const organizationId = ctx.payload.organization.id;
      
      // Adding comment to issue
      const telegramMessage = `Pull Request has been reviewed by @${senderUsername}\n` +
        `Repository : ${repositoryName}\n` +
        `Pull Request : ${pullRequestTitle}\n` +
        `Number : ${pullRequestNumber}\n` +
        `URL : ${pullRequestUrl}\n` +
        `Status : Reviewed 🔍`;

      const chatIds = await getTelegramIdFromGithubOrganization(this.firestoreCollection, organizationId);
      for (const chatId of chatIds) {
        await this.telegramBot.telegram.sendMessage(chatId, telegramMessage);
      }
    });
  }
}

module.exports = PullRequestService;
