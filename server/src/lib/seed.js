const Dashboard = require("../models/dashboard");
const PageContent = require("../models/page-content");
const WasteManagement = require("../models/waste-management");
const { dashboardMock } = require("../data/mockData");
const { pageContents } = require("../data/pageContent");
const { wasteManagementMock } = require("../data/wasteManagement");

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

async function ensureWasteManagementSeed() {
  const existing = await WasteManagement.findOne({ key: wasteManagementMock.key });

  if (!existing) {
    await WasteManagement.create(wasteManagementMock);
    return { created: true, updated: false };
  }

  await WasteManagement.updateOne(
    { key: wasteManagementMock.key },
    {
      $set: {
        hero: wasteManagementMock.hero,
        overview: wasteManagementMock.overview,
        quickActions: wasteManagementMock.quickActions,
        sortingGuide: wasteManagementMock.sortingGuide,
        disposalLogs: wasteManagementMock.disposalLogs,
        reductionSeries: wasteManagementMock.reductionSeries,
        streamBreakdown: wasteManagementMock.streamBreakdown,
        recognitionBoard: wasteManagementMock.recognitionBoard,
        goals: wasteManagementMock.goals
      }
    }
  );

  return { created: false, updated: true };
}

async function ensureInitialSeeds() {
  const dashboard = await ensureDashboardSeed();
  const wasteManagement = await ensureWasteManagementSeed();
  const pages = await ensurePageContentSeed();
  return { dashboard, wasteManagement, pages };
}

module.exports = { ensureDashboardSeed, ensurePageContentSeed, ensureWasteManagementSeed, ensureInitialSeeds };
