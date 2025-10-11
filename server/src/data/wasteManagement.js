const wasteManagementMock = {
  key: "waste-management-main",
  hero: {
    greeting: "Waste Management Hub",
    message: "Your campus reduced 320kg of waste this month. Keep building the momentum!"
  },
  overview: [
    {
      id: "collectionPoints",
      label: "Total Waste Collection Points",
      value: 200,
      unit: "sites",
      active: 190,
      inactive: 10,
      changePercent: 6.5,
      caption: "Active"
    },
    {
      id: "totalUsers",
      label: "Total Users",
      value: 2000,
      unit: "members",
      changePercent: 4.5,
      caption: "vs last month"
    },
    {
      id: "totalDiversions",
      label: "Waste Diversions",
      value: 1000,
      unit: "kg",
      changePercent: 3.5,
      caption: "diverted this month"
    },
    {
      id: "partnerships",
      label: "Community Partners",
      value: 150,
      unit: "orgs",
      changePercent: 2.4,
      caption: "active collaborations"
    }
  ],
  quickActions: [
    {
      id: "createCampaign",
      label: "Create Campaign",
      description: "Launch a campus-wide waste reduction challenge."
    },
    {
      id: "manageUsers",
      label: "Manage Users",
      description: "Assign sorting roles and invite new residents."
    },
    {
      id: "logDisposal",
      label: "Log Disposal",
      description: "Add today’s recycling or compost weights."
    },
    {
      id: "manageRewards",
      label: "Manage Rewards",
      description: "Update eco-credit incentives for your community."
    }
  ],
  sortingGuide: [
    {
      id: "recyclables",
      title: "Recyclables",
      description: "Keep items clean and dry before placing them in the blue bin.",
      items: [
        { item: "Paper & Cardboard", instructions: "Flatten boxes and remove any food residue." },
        { item: "Metals", instructions: "Rinse cans and remove labels where possible." },
        { item: "Plastics #1-#5", instructions: "Empty liquids, keep lids on." }
      ]
    },
    {
      id: "organics",
      title: "Organics",
      description: "Anything that was once alive belongs in the green bin.",
      items: [
        { item: "Food Scraps", instructions: "Include fruit peels, coffee grounds, eggshells." },
        { item: "Compostable Packaging", instructions: "Look for certified compostable logos." },
        { item: "Yard Trimmings", instructions: "Leaves, grass, and small branches." }
      ]
    },
    {
      id: "landfill",
      title: "Landfill",
      description: "Use the black bin for materials that cannot be recycled or composted.",
      items: [
        { item: "Soft Plastics", instructions: "Chip bags, candy wrappers, styrofoam." },
        { item: "Hygiene Products", instructions: "Tissues, wipes, diapers." },
        { item: "Broken Ceramics", instructions: "Wrap sharp edges before disposal." }
      ]
    }
  ],
  disposalLogs: {
    entries: [
      { id: "log-01", stream: "recyclables", amountKg: 18, date: "2025-05-17" },
      { id: "log-02", stream: "organics", amountKg: 12, date: "2025-05-17" },
      { id: "log-03", stream: "landfill", amountKg: 6, date: "2025-05-17" },
      { id: "log-04", stream: "recyclables", amountKg: 16, date: "2025-05-16" },
      { id: "log-05", stream: "organics", amountKg: 11, date: "2025-05-16" },
      { id: "log-06", stream: "landfill", amountKg: 7, date: "2025-05-16" },
      { id: "log-07", stream: "recyclables", amountKg: 20, date: "2025-05-15" },
      { id: "log-08", stream: "organics", amountKg: 13, date: "2025-05-15" },
      { id: "log-09", stream: "landfill", amountKg: 8, date: "2025-05-15" }
    ],
    weeklySummary: {
      totalKg: 320,
      diversionRate: 68,
      changePercent: 5.2
    }
  },
  reductionSeries: [
    { day: "May 11", recycledKg: 14, organicsKg: 10, landfillKg: 8 },
    { day: "May 12", recycledKg: 16, organicsKg: 12, landfillKg: 7 },
    { day: "May 13", recycledKg: 18, organicsKg: 11, landfillKg: 6 },
    { day: "May 14", recycledKg: 19, organicsKg: 13, landfillKg: 5 },
    { day: "May 15", recycledKg: 20, organicsKg: 13, landfillKg: 8 },
    { day: "May 16", recycledKg: 16, organicsKg: 11, landfillKg: 7 },
    { day: "May 17", recycledKg: 18, organicsKg: 12, landfillKg: 6 }
  ],
  streamBreakdown: [
    { name: "Computers & accessories", percentage: 35 },
    { name: "Mobile & tablets", percentage: 25 },
    { name: "TVs & monitors", percentage: 15 },
    { name: "Batteries", percentage: 10 },
    { name: "Other electronics", percentage: 10 },
    { name: "Appliances", percentage: 5 }
  ],
  recognitionBoard: [
    { id: "ewaste", label: "E-waste Collection", value: 20000, unit: "kg", changePercent: 20 },
    { id: "donation", label: "E-waste Donation", value: 1000, unit: "kg", changePercent: 3.5 },
    { id: "engagement", label: "User Engagement", value: 5000, unit: "pts", changePercent: 6.0 },
    { id: "ecoActivity", label: "Eco Activity", value: 5000, unit: "pts", changePercent: 20 },
    { id: "corporate", label: "Corporate Engagement", value: 5000, unit: "pts", changePercent: 2.8 },
    { id: "campaign", label: "Campaign Effectiveness", value: 30000, unit: "pts", changePercent: 25 }
  ],
  goals: [
    {
      id: "goal-1",
      title: "Reduce landfill waste",
      description: "Cut landfill volume by promoting proper sorting across dorms.",
      owner: "Campus sustainability team",
      timeframe: "Q2 2025",
      currentValue: 320,
      targetValue: 500,
      unit: "kg"
    },
    {
      id: "goal-2",
      title: "Increase recycling rate",
      description: "Lift recycling diversion to 75% by running weekly training.",
      owner: "Eco club",
      timeframe: "May 2025",
      currentValue: 68,
      targetValue: 75,
      unit: "%"
    },
    {
      id: "goal-3",
      title: "Community cleanups",
      description: "Host collection drives with five neighbourhood partners.",
      owner: "Community outreach",
      timeframe: "Summer 2025",
      currentValue: 3,
      targetValue: 5,
      unit: "events"
    }
  ]
};

module.exports = { wasteManagementMock };
