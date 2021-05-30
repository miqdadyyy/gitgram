const StringUtils = require('../../utils/string');
const {getTelegramIdFromGithubOrganization} = require('../../utils/github_handler');

const IssueService = class {
  static init(robot, telegramBot, firestoreCollection) {
    this.robot = robot;
    this.telegramBot = telegramBot;
    this.firestoreCollection = firestoreCollection;

    this.issueOpened();
    this.issueAddAssignee();
  }

  static issueOpened() {
    this.robot.on('issues.opened', async (ctx) => {
      // Get variable from payload
      const assigneeUsernames = ctx.payload.issue.assignees.map(assignee => assignee.login);
      const issueTitle = ctx.payload.issue.title;
      const issueUrl = ctx.payload.issue.html_url;
      const issueUser = ctx.payload.issue.user.login || 'Unknown';
      const repositoryName = ctx.payload.repository.name;
      const organizationId = ctx.payload.organization.id;

      // Adding comment to issue
      const assigneeComment = assigneeUsernames.length > 0 ? StringUtils.joinName(assigneeUsernames.map(assignee => `@${assignee}`)) : ' - ';
      console.log(assigneeComment)

      const issueMessage = `Thanks for opening this issue!\n` +
        `This issue will be assigned to ${assigneeComment}`;
      const issueComment = ctx.issue({
        body: issueMessage,
      });
      ctx.octokit.issues.createComment(issueComment);

      // Send notification telegram by webhook
      const telegramMessage = `There is issue from ${issueUser} on ${repositoryName}\n\n` +
        `Repository : ${repositoryName}\n` +
        `Issue : ${issueTitle}\n` +
        `URL : ${issueUrl}\n` +
        `Assignee : ${assigneeComment}\n\n` +
        `Please check the issue by clicking link above`;

      // Send message on webhook
      const chatIds = await getTelegramIdFromGithubOrganization(this.firestoreCollection, organizationId);
      for (const chatId of chatIds) {
        await this.telegramBot.telegram.sendMessage(chatId, telegramMessage);
      }
    });
  }

  static issueAddAssignee() {
    this.robot.on('issues.assigned', async (ctx) => {
      // Get variable from payload
      const assigneeUsernames = ctx.payload.issue.assignees.map(assignee => assignee.login);
      const issueTitle = ctx.payload.issue.title;
      const issueUrl = ctx.payload.issue.url;
      const issueUser = ctx.payload.issue.user.login || 'Unknown';
      const repositoryName = ctx.payload.repository.name;
      const organizationId = ctx.payload.organization.id;

      const assigneeComment = assigneeUsernames.count > 0 ? StringUtils.joinName(assigneeUsernames.map(assignee => `@${assignee}`)) : ' - ';

      // Send notification telegram by webhook
      const telegramMessage = `${issueUser} just add ${assigneeComment} for issue on *${repositoryName}*\n\n` +
        `Repository : ${repositoryName}\n` +
        `Issue : ${issueTitle}\n` +
        `URL : ${issueUrl}\n\n` +
        `Please check the issue by clicking link above`;

      // Send message on webhook
      const chatIds = await getTelegramIdFromGithubOrganization(this.firestoreCollection, organizationId);
      for (const chatId of chatIds) {
        await this.telegramBot.telegram.sendMessage(chatId, telegramMessage);
      }
    });
  }
}

module.exports = IssueService;
