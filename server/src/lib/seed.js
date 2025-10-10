const Dashboard = require("../models/dashboard");
const PageContent = require("../models/page-content");
const { dashboardMock } = require("../data/mockData");
const { pageContents } = require("../data/pageContent");

async function ensureDashboardSeed() {
  const existing = await Dashboard.findOne({ key: dashboardMock.key });

  if (!existing) {
    await Dashboard.create(dashboardMock);
    return { created: true, updated: false };
  }

  await Dashboard.updateOne(
    { key: dashboardMock.key },
    {
      $set: {
        welcome: dashboardMock.welcome,
        stats: dashboardMock.stats,
        activeChallenges: dashboardMock.activeChallenges,
        recentActivities: dashboardMock.recentActivities,
        weeklyHighlights: dashboardMock.weeklyHighlights
      }
    }
  );

  return { created: false, updated: true };
}

async function ensurePageContentSeed() {
  const results = [];

  for (const pageContent of pageContents) {
    const { key, data } = pageContent;
    const existing = await PageContent.findOne({ key });

    if (!existing) {
      await PageContent.create({ key, data });
      results.push({ key, created: true, updated: false });
      continue;
    }

    await PageContent.updateOne({ key }, { $set: { data } });
    results.push({ key, created: false, updated: true });
  }

  return results;
}

async function ensureInitialSeeds() {
  const dashboard = await ensureDashboardSeed();
  const pages = await ensurePageContentSeed();
  return { dashboard, pages };
}

module.exports = { ensureDashboardSeed, ensurePageContentSeed, ensureInitialSeeds };
