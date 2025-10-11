const EMAIL_PREFERENCES = [
  {
    id: "weekly-summary",
    label: "Weekly Summary",
    description: "Receive a weekly summary of your activities",
    defaultEnabled: true,
  },
  {
    id: "challenge-updates",
    label: "Challenge Updates",
    description: "Get notified about new challenges",
    defaultEnabled: true,
  },
  {
    id: "team-activity",
    label: "Team Activity",
    description: "Updates about your team's progress",
    defaultEnabled: false,
  },
];

const PUSH_NOTIFICATIONS = [
  {
    id: "challenge-reminders",
    label: "Challenge Reminders",
    description: "Reminder before challenges expire",
    defaultEnabled: true,
  },
  {
    id: "leaderboard-updates",
    label: "Leaderboard Updates",
    description: "When your team's rank changes",
    defaultEnabled: true,
  },
  {
    id: "rewards-available",
    label: "Rewards Available",
    description: "When you can claim new rewards",
    defaultEnabled: true,
  },
];

const PRIVACY_TOGGLES = [
  {
    id: "profile-visibility",
    label: "Profile Visibility",
    description: "Make your profile visible to other users",
    defaultEnabled: true,
  },
  {
    id: "show-activity-status",
    label: "Show Activity Status",
    description: "Let others see when you're online",
    defaultEnabled: false,
  },
];

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिंदी (Hindi)" },
  { value: "ta", label: "தமிழ் (Tamil)" },
  { value: "te", label: "తెలుగు (Telugu)" },
];

const PASSWORD_PLACEHOLDERS = {
  current: "Current password",
  next: "New password",
  confirm: "Confirm new password",
};

module.exports = {
  EMAIL_PREFERENCES,
  PUSH_NOTIFICATIONS,
  PRIVACY_TOGGLES,
  LANGUAGE_OPTIONS,
  PASSWORD_PLACEHOLDERS,
};
