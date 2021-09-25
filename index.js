const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");


request("https://github.com/topics", fetchBoxes);

const gitTopics = [];

function fetchBoxes(err, res, html) {
  const $ = cheerio.load(html);
  let topicUrlsAnchorTags = $(
    ".no-underline.d-flex.flex-column.flex-justify-center"
  );

  for (let i = 0; i < topicUrlsAnchorTags.length; i++) {
    let topicUrl =
      "http://www.github.com" + $(topicUrlsAnchorTags[i]).attr("href");
    gitTopics.push({
      topicUrl: topicUrl,
      repos: [],
    });
    request(topicUrl, fetchEightRepoUrls.bind(this, i));
  }
}
let topicCount = 0;
let repoCount = 0;
let count = 0;
function fetchEightRepoUrls(index, err, res, html) {
  topicCount++;
  const $ = cheerio.load(html);

  let repoUrlsAnchorTags = $(".text-bold.wb-break-word");
  let totalRepos =
    repoUrlsAnchorTags.length < 8 ? repoUrlsAnchorTags.length : 8;

  repoCount += totalRepos;

  for (let i = 0; i < totalRepos; i++) {
    let repoUrl =
      "http://www.github.com" + $(repoUrlsAnchorTags[i]).attr("href");
    gitTopics[index].repos.push({
      reposUrls: repoUrl,
      Issues: [],
    });

    request(repoUrl + "/issues", fetchIssues.bind(this, index, i));
  }
}

function fetchIssues(topicIndex, repoIndex, err, res, html) {
  const $ = cheerio.load(html);
  let issuesAnchorTags = $(
    ".Link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title"
  );

  let totalIssues = issuesAnchorTags.length < 8 ? issuesAnchorTags.length : 8;

  for (let i = 0; i < totalIssues; i++) {
    gitTopics[topicIndex].repos[repoIndex].Issues.push({
      IssueName: $(
        ".Link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title"
      ).text(),
      IssueURL: $(
        ".Link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title"
      ).attr("href"),
    });
  }
  count++;

  if (topicCount == 3 && repoCount == count) {
    fs.writeFileSync("IssuesScrapper.json", JSON.stringify(gitTopics));
  }
}
