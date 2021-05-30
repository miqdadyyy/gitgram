const nock = require("nock");
// Requiring our app implementation
const myProbotApp = require("..");
const {Probot, Server, ProbotOctokit} = require("probot");
// Requiring our fixtures
const payload = require("./fixtures/issues.opened");
const fs = require("fs");
const path = require("path");

const privateKey = fs.readFileSync(
  path.join(__dirname, "fixtures/mock-cert.pem"),
  "utf-8"
);

describe("My Probot app", () => {
  let server;

  beforeEach(() => {
    // nock.disableNetConnect();

    server = new Server({
      Probot: Probot.defaults({
        appId: 123,
        privateKey,
        Octokit: ProbotOctokit.defaults({
          retry: {enabled: false},
          throttle: {enabled: false},
        })
      })
    });

    // Load our app into probot
    server.load(myProbotApp);
  });

  test("creates a comment when an issue is opened", async () => {
    // Receive a webhook event
    await server.probotApp.receive({name: "issues.opened", payload});
    // console.log(response)
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });
});

// For more information about testing with Jest see:
// https://facebook.github.io/jest/

// For more information about testing with Nock see:
// https://github.com/nock/nock
