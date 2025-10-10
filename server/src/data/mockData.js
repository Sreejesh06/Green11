const dashboardMock = {
  key: "dashboard-main",
  welcome: {
    userName: "Arjun",
    message: "Your team is crushing it! Keep the momentum going 🚀"
  },
  stats: {
    totalGreenPoints: { value: 1247, changePercent: 12 },
    teamRank: { value: 3, delta: 2 },
    challenges: { completed: 7, total: 10, status: "Active" },
    teamMembers: { active: 8, total: 8, status: "Active" }
  },
  activeChallenges: [
    { id: 1, title: "Zero Waste Lunch", points: 50, deadline: "2 days left", icon: "🥗", difficulty: "Easy", progress: 75 },
    { id: 2, title: "Bike to Campus Week", points: 100, deadline: "5 days left", icon: "🚴", difficulty: "Medium", progress: 40 },
    { id: 3, title: "Plant 5 Trees", points: 150, deadline: "7 days left", icon: "🌳", difficulty: "Hard", progress: 20 },
    { id: 4, title: "Reusable Water Bottle", points: 25, deadline: "1 day left", icon: "💧", difficulty: "Easy", progress: 90 }
  ],
  recentActivities: [
    { id: 1, user: "Priya S.", action: "Completed 'Zero Waste Lunch'", time: "2 hours ago", points: 50, avatar: "PS" },
    { id: 2, user: "Rahul M.", action: "Planted 3 trees", time: "4 hours ago", points: 90, avatar: "RM" },
    { id: 3, user: "Your Team", action: "Climbed to Rank #3", time: "6 hours ago", points: 0, avatar: "TS" },
    { id: 4, user: "Sneha P.", action: "Completed 'Bike Challenge'", time: "8 hours ago", points: 100, avatar: "SP" }
  ],
  weeklyHighlights: [
    { id: 1, label: "Completed", value: 7, unit: "count" },
    { id: 2, label: "GP Earned", value: 420, unit: "points" },
    { id: 3, label: "Team Share", value: 35, unit: "percent" }
  ]
};

module.exports = { dashboardMock };
