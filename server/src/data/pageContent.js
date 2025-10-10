const indexContent = {
  key: "page-index",
  data: {
    hero: {
      taglineIcon: "Leaf",
      tagline: "Sustainability Gamified",
      headingPrimary: "GET GREEN NOW,",
      headingAccent: "INSTANT IMPACT",
      description:
        "Turn eco-friendly actions into bragging rights. Compete for your hostel, earn real rewards through our revolutionary platform.",
      primaryCta: { label: "Join the League", href: "/dashboard" },
      secondaryCta: { label: "Watch Demo", href: "#demo" }
    },
    sustainabilityImages: [
      {
        src: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1280&h=720&fit=crop&crop=entropy&auto=format&q=80",
        alt: "Renewable energy and sustainability"
      },
      {
        src: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1280&h=720&fit=crop&crop=entropy&auto=format&q=80",
        alt: "Recycling and waste management"
      },
      {
        src: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=800&fit=crop&crop=entropy&auto=format&q=80",
        alt: "Green campus and nature"
      },
      {
        src: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1280&h=720&fit=crop&crop=entropy&auto=format&q=80",
        alt: "Eco-friendly lifestyle"
      },
      {
        src: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=800&fit=crop&crop=entropy&auto=format&q=80",
        alt: "Environmental conservation"
      },
      {
        src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1280&h=720&fit=crop&crop=entropy&auto=format&q=80",
        alt: "Green forest and ecosystem"
      },
      {
        src: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1280&h=720&fit=crop&crop=entropy&auto=format&q=80",
        alt: "Sustainable living"
      }
    ],
    featureCards: [
      {
        iconName: "Target",
        title: "Daily Challenges",
        description: "Complete eco-tasks & earn GP",
        date: "Updated daily",
        iconClassName: "text-emerald-500",
        titleClassName: "text-emerald-500",
        className:
          "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0"
      },
      {
        iconName: "Trophy",
        title: "Leaderboard",
        description: "Compete with your hostel",
        date: "Live rankings",
        iconClassName: "text-amber-500",
        titleClassName: "text-amber-500",
        className:
          "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0"
      },
      {
        iconName: "Gift",
        title: "Rewards Store",
        description: "Redeem exclusive prizes",
        date: "New items weekly",
        iconClassName: "text-purple-500",
        titleClassName: "text-purple-500",
        className: "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10"
      }
    ],
    benefits: {
      students: [
        {
          iconName: "Award",
          title: "Earn Green Points (GP)",
          description: "Convert actions into currency"
        },
        {
          iconName: "Trophy",
          title: "Win Prizes",
          description: "Compete in tournaments for real rewards"
        },
        {
          iconName: "Users",
          title: "Represent Your Team",
          description: "Build hostel/department pride"
        }
      ],
      campus: [
        {
          iconName: "TrendingUp",
          title: "Track Impact",
          description: "Get real data on campus sustainability"
        },
        {
          iconName: "Sparkles",
          title: "Boost Engagement",
          description: "Foster a campus-wide green culture"
        },
        {
          iconName: "Recycle",
          title: "Promote Change",
          description: "Encourage measurable eco-friendly habits"
        }
      ]
    },
    differentiators: {
      headline: "What Makes Us Different?",
      description:
        "We Turn Sustainability Into a Competitive Sport. Other initiatives just talk about awareness. SustainaLeague uses verifiable proof, real-time leaderboards, and tangible rewards to make sustainability exciting and impactful.",
      stats: [
        { value: "10K+", label: "Green Points Earned" },
        { value: "500+", label: "Active Students" },
        { value: "50+", label: "Rewards Redeemed" },
        { value: "20+", label: "Campus Partners" }
      ]
    },
    cta: {
      heading: "Ready to Make an Impact?",
      description:
        "Join thousands of students turning sustainable actions into campus glory and real rewards.",
      primaryCta: { label: "Start Your Journey", href: "/dashboard" },
      secondaryCta: { label: "View Demo", href: "#demo" },
      disclaimer: "No credit card required • Free to join • Start earning GP today"
    }
  }
};

const leaderboardContent = {
  key: "page-leaderboard",
  data: {
    header: {
      title: "Leaderboard",
      description: "See how you stack up against the competition 🏆"
    },
    individualLeaders: [
      { rank: 1, name: "Priya Sharma", points: 2847, trend: "up", change: 3, team: "EcoWarriors", avatar: "PS", seasonScore: 8 },
      { rank: 2, name: "Rahul Mehta", points: 2650, trend: "up", change: 1, team: "GreenDreamTeam", avatar: "RM", seasonScore: 8 },
      { rank: 3, name: "Arjun Kumar", points: 2401, trend: "same", change: 0, team: "SustainSquad", avatar: "AK", seasonScore: 7 },
      { rank: 4, name: "Sneha Patel", points: 2298, trend: "down", change: -2, team: "EcoWarriors", avatar: "SP", seasonScore: 6 },
      { rank: 5, name: "Vikram Singh", points: 2156, trend: "up", change: 4, team: "NatureNinjas", avatar: "VS", seasonScore: 7 },
      { rank: 6, name: "Ananya Reddy", points: 2089, trend: "same", change: 0, team: "GreenDreamTeam", avatar: "AR", seasonScore: 5 },
      { rank: 7, name: "Karthik Rao", points: 1987, trend: "up", change: 2, team: "SustainSquad", avatar: "KR", seasonScore: 6 },
      { rank: 8, name: "Divya Nair", points: 1856, trend: "down", change: -1, team: "EcoChampions", avatar: "DN", seasonScore: 5 }
    ],
    teamLeaders: [
      { rank: 1, name: "EcoWarriors", points: 8945, members: 8, avgPoints: 1118, trend: "up", change: 2 },
      { rank: 2, name: "GreenDreamTeam", points: 8721, members: 7, avgPoints: 1246, trend: "same", change: 0 },
      { rank: 3, name: "SustainSquad", points: 8388, members: 8, avgPoints: 1049, trend: "up", change: 1 },
      { rank: 4, name: "NatureNinjas", points: 7956, members: 6, avgPoints: 1326, trend: "down", change: -3 },
      { rank: 5, name: "EcoChampions", points: 7654, members: 9, avgPoints: 850, trend: "up", change: 1 },
      { rank: 6, name: "GreenGuardians", points: 7234, members: 7, avgPoints: 1033, trend: "same", change: 0 }
    ],
    myStats: {
      seasonRank: 3,
      totalPlayers: 1243,
      seasonScore: 7,
      points: 2401,
      position: "Stable"
    },
    seasonStats: [
      { label: "Total Players", value: "1,243" },
      { label: "Challenges", value: "440,730" },
      { label: "PTS Converted", value: "26.3M" },
      { label: "Time Left", value: "390d 2h" }
    ]
  }
};

const profileContent = {
  key: "page-profile",
  data: {
    user: {
      name: "Arjun Kumar",
      initials: "AK",
      level: 12,
      team: "SustainSquad",
      joined: "Mar 2024",
      levelProgress: { current: 247, total: 1500, nextLevelRemaining: 1253 }
    },
    badges: [
      { iconName: "Trophy", label: "Level 12", variant: "primary" },
      { iconName: "Users", label: "SustainSquad", variant: "secondary" },
      { iconName: "Calendar", label: "Joined Mar 2024", variant: "accent" }
    ],
    stats: [
      { label: "Total GP", value: 1247, iconName: "Leaf", color: "text-primary" },
      { label: "Completed", value: "23", iconName: "Target", color: "text-secondary" },
      { label: "Streak", value: "5 days", iconName: "Flame", color: "text-accent" },
      { label: "Rank", value: "#3", iconName: "Trophy", color: "text-accent" }
    ],
    achievements: [
      { id: 1, name: "First Steps", description: "Complete your first challenge", iconName: "CheckCircle2", earned: true, rarity: "common" },
      { id: 2, name: "Eco Warrior", description: "Earn 1000 Green Points", iconName: "Trophy", earned: true, rarity: "rare" },
      { id: 3, name: "Team Player", description: "Help your team reach top 5", iconName: "Users", earned: true, rarity: "epic" },
      { id: 4, name: "Consistency King", description: "Log actions for 7 days straight", iconName: "Flame", earned: true, rarity: "rare" },
      { id: 5, name: "Point Master", description: "Earn 5000 Green Points", iconName: "Star", earned: false, rarity: "legendary" },
      { id: 6, name: "Champion", description: "Reach #1 on leaderboard", iconName: "Crown", earned: false, rarity: "legendary" }
    ],
    recentChallenges: [
      { name: "Zero Waste Lunch", completed: true, points: 50, date: "2 days ago" },
      { name: "Bike to Campus", completed: true, points: 30, date: "3 days ago" },
      { name: "Reusable Bottle", completed: true, points: 25, date: "4 days ago" },
      { name: "Plant Trees", completed: false, points: 150, date: "In progress" }
    ],
    teamOverview: {
      name: "SustainSquad",
      rank: 3,
      totalPoints: 8388,
      members: "8/8",
      averageGpPerPlayer: 1049
    }
  }
};

const rewardsContent = {
  key: "page-rewards",
  data: {
    userPoints: 1247,
    categories: ["All", "Food & Drink", "Merchandise", "Education", "Transportation", "Gardening", "Special"],
    rewards: [
      { id: 1, name: "Campus Cafe Voucher", cost: 200, iconName: "Coffee", category: "Food & Drink", stock: 45, description: "₹100 voucher for sustainable cafe items", rarity: "common" },
      { id: 2, name: "Eco-Friendly Water Bottle", cost: 350, iconName: "Sparkles", category: "Merchandise", stock: 20, description: "Insulated steel bottle with SustainaLeague logo", rarity: "rare" },
      { id: 3, name: "Organic Cotton T-Shirt", cost: 500, iconName: "Shirt", category: "Merchandise", stock: 15, description: "100% organic cotton tee in multiple colors", rarity: "epic" },
      { id: 4, name: "Sustainability Guide Book", cost: 150, iconName: "Book", category: "Education", stock: 30, description: "Digital access to premium eco-living guides", rarity: "common" },
      { id: 5, name: "Campus Bike Share Pass", cost: 800, iconName: "Bike", category: "Transportation", stock: 10, description: "1-month unlimited bike sharing access", rarity: "legendary" },
      { id: 6, name: "Plant Starter Kit", cost: 300, iconName: "Leaf", category: "Gardening", stock: 25, description: "Seeds, soil, and pot to grow your own herbs", rarity: "rare" },
      { id: 7, name: "Reusable Shopping Bag Set", cost: 180, iconName: "ShoppingBag", category: "Merchandise", stock: 40, description: "Set of 3 durable mesh produce bags", rarity: "common" },
      { id: 8, name: "Mystery Eco Box", cost: 600, iconName: "Gift", category: "Special", stock: 8, description: "Curated box of sustainable goodies worth ₹1000+", rarity: "legendary" }
    ]
  }
};

const settingsContent = {
  key: "page-settings",
  data: {
    profile: {
      firstName: "Arjun",
      lastName: "Patel",
      email: "arjun@example.com",
      username: "@arjun_green"
    },
    emailPreferences: [
      {
        id: "weekly-summary",
        label: "Weekly Summary",
        description: "Receive a weekly summary of your activities",
        defaultChecked: true
      },
      {
        id: "challenge-updates",
        label: "Challenge Updates",
        description: "Get notified about new challenges",
        defaultChecked: true
      },
      {
        id: "team-activity",
        label: "Team Activity",
        description: "Updates about your team's progress",
        defaultChecked: false
      }
    ],
    pushNotifications: [
      {
        id: "challenge-reminders",
        label: "Challenge Reminders",
        description: "Reminder before challenges expire",
        defaultChecked: true
      },
      {
        id: "leaderboard-updates",
        label: "Leaderboard Updates",
        description: "When your team's rank changes",
        defaultChecked: true
      },
      {
        id: "rewards-available",
        label: "Rewards Available",
        description: "When you can claim new rewards",
        defaultChecked: true
      }
    ],
    privacy: {
      toggles: [
        {
          id: "profile-visibility",
          label: "Profile Visibility",
          description: "Make your profile visible to other users",
          defaultChecked: true
        },
        {
          id: "show-activity-status",
          label: "Show Activity Status",
          description: "Let others see when you're online",
          defaultChecked: false
        }
      ],
      passwordPlaceholders: {
        current: "Current password",
        next: "New password",
        confirm: "Confirm new password"
      }
    },
    appearance: {
      darkModeDefault: false,
      languages: [
        { value: "en", label: "English" },
        { value: "hi", label: "हिंदी (Hindi)" },
        { value: "ta", label: "தமிழ் (Tamil)" },
        { value: "te", label: "తెలుగు (Telugu)" }
      ]
    }
  }
};

const indexNotFoundContent = {
  key: "page-notfound",
  data: {
    title: "404",
    message: "Oops! Page not found",
    cta: { label: "Return to Home", href: "/" }
  }
};

const pageContents = [
  indexContent,
  leaderboardContent,
  profileContent,
  rewardsContent,
  settingsContent,
  indexNotFoundContent
];

module.exports = { pageContents };
