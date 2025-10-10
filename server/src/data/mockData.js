const dashboardMock = {
	key: "dashboard-main",
	welcome: {
		userName: "Arjun",
		message: "You're 220 GP away from unlocking the Platinum tier. Keep up the momentum!"
	},
	stats: {
		totalGreenPoints: {
			value: 1247,
			changePercent: 18
		},
		teamRank: {
			value: 3,
			delta: 1
		},
		challenges: {
			completed: 23,
			total: 30,
			status: "On Track"
		},
		teamMembers: {
			active: 18,
			total: 24,
			status: "75% active"
		}
	},
	activeChallenges: [
		{
			id: 1,
			title: "Plant a Tree Week",
			points: 120,
			deadline: "2 days left",
			icon: "🌱",
			difficulty: "Intermediate",
			progress: 65
		},
		{
			id: 2,
			title: "Zero-Waste Lunch",
			points: 60,
			deadline: "Due tonight",
			icon: "🥗",
			difficulty: "Beginner",
			progress: 80
		},
		{
			id: 3,
			title: "Bike to Campus",
			points: 90,
			deadline: "5 days left",
			icon: "🚲",
			difficulty: "Advanced",
			progress: 30
		}
	],
	recentActivities: [
		{
			id: 1,
			user: "Priya Sharma",
			action: "Submitted challenge proof for Plastic-Free Day",
			time: "5 minutes ago",
			points: 45,
			avatar: "PS"
		},
		{
			id: 2,
			user: "Rahul Mehta",
			action: "Earned bonus GP in the Daily Trivia",
			time: "18 minutes ago",
			points: 25,
			avatar: "RM"
		},
		{
			id: 3,
			user: "Divya Nair",
			action: "Joined the Nature Ninjas team",
			time: "30 minutes ago",
			points: 0,
			avatar: "DN"
		}
	],
	weeklyHighlights: [
		{
			id: 1,
			label: "Completed",
			value: 58,
			unit: "points"
		},
		{
			id: 2,
			label: "GP Earned",
			value: 840,
			unit: "points"
		},
		{
			id: 3,
			label: "Team Share",
			value: 42,
			unit: "percent"
		}
	]
};

module.exports = { dashboardMock };

