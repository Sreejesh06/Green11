const express = require("express");
const User = require("../models/user");
const UserSettings = require("../models/user-settings");
const {
  EMAIL_PREFERENCES,
  PUSH_NOTIFICATIONS,
  PRIVACY_TOGGLES,
  LANGUAGE_OPTIONS,
  PASSWORD_PLACEHOLDERS,
} = require("../constants/settings");

const router = express.Router();

function resolveUserId(req) {
  return req.user && typeof req.user.id === "string" ? req.user.id : null;
}

function deriveNameParts(user) {
  if (!user) {
    return { firstName: "", lastName: "" };
  }

  if (user.firstName || user.lastName) {
    return {
      firstName: (user.firstName || "").trim(),
      lastName: (user.lastName || "").trim(),
    };
  }

  if (user.name) {
    const trimmed = user.name.trim();
    if (trimmed) {
      const [first, ...rest] = trimmed.split(/\s+/);
      return { firstName: first || "", lastName: rest.join(" ") };
    }
  }

  return { firstName: "", lastName: "" };
}

function computeUsername(user, settings) {
  const stored = settings?.profile?.username;
  if (stored) {
    return stored;
  }

  if (user?.username) {
    return user.username;
  }

  if (user?.email) {
    const [handle] = user.email.split("@");
    return handle;
  }

  return "";
}

function mapToggles(definitions, stored = []) {
  const storeMap = new Map((stored || []).map((item) => [item.id, Boolean(item.enabled)]));

  return definitions.map((definition) => ({
    id: definition.id,
    label: definition.label,
    description: definition.description,
    enabled: storeMap.has(definition.id)
      ? storeMap.get(definition.id)
      : Boolean(definition.defaultEnabled),
  }));
}

async function ensureUserSettings(userId) {
  let settings = await UserSettings.findOne({ user: userId }).lean();

  if (settings) {
    return settings;
  }

  const defaults = {
    user: userId,
    emailPreferences: EMAIL_PREFERENCES.map((pref) => ({ id: pref.id, enabled: pref.defaultEnabled })),
    pushNotifications: PUSH_NOTIFICATIONS.map((pref) => ({ id: pref.id, enabled: pref.defaultEnabled })),
    privacyToggles: PRIVACY_TOGGLES.map((pref) => ({ id: pref.id, enabled: pref.defaultEnabled })),
    appearance: {
      darkMode: false,
      language: LANGUAGE_OPTIONS[0]?.value || "en",
    },
  };

  const created = await UserSettings.create(defaults);
  return created.toObject();
}

function buildSettingsResponse(user, settings) {
  const { firstName, lastName } = deriveNameParts(user);
  const username = computeUsername(user, settings);

  return {
    profile: {
      firstName,
      lastName,
      email: user?.email || "",
      username,
    },
    emailPreferences: mapToggles(EMAIL_PREFERENCES, settings?.emailPreferences),
    pushNotifications: mapToggles(PUSH_NOTIFICATIONS, settings?.pushNotifications),
    privacy: {
      toggles: mapToggles(PRIVACY_TOGGLES, settings?.privacyToggles),
      passwordPlaceholders: PASSWORD_PLACEHOLDERS,
    },
    appearance: {
      darkMode: settings?.appearance?.darkMode ?? false,
      selectedLanguage: settings?.appearance?.language || LANGUAGE_OPTIONS[0]?.value || "en",
      languages: LANGUAGE_OPTIONS,
    },
  };
}

function parseTogglePayload(definitions, incoming) {
  if (!Array.isArray(incoming)) {
    return { error: "Payload must be an array of toggles." };
  }

  const definitionIds = new Set(definitions.map((definition) => definition.id));
  const map = new Map();

  for (const item of incoming) {
    if (!item || typeof item.id !== "string") {
      return { error: "Each toggle must include an id." };
    }

    const id = item.id.trim();
    if (!definitionIds.has(id)) {
      return { error: `Unknown toggle id: ${id}` };
    }

    if (typeof item.enabled !== "boolean") {
      return { error: "Toggle enabled flag must be boolean." };
    }

    map.set(id, item.enabled);
  }

  const sanitized = Array.from(map.entries()).map(([id, enabled]) => ({ id, enabled }));
  return { value: sanitized };
}

router.get("/", async (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }
    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const settings = await ensureUserSettings(userId);
    const payload = buildSettingsResponse(user, settings);

    return res.json(payload);
  } catch (error) {
    return next(error);
  }
});

router.put("/profile", async (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }
    const { firstName, lastName, email, username } = req.body || {};

    const trimmedFirstName = typeof firstName === "string" ? firstName.trim() : "";
    const trimmedLastName = typeof lastName === "string" ? lastName.trim() : "";
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedUsername = typeof username === "string" ? username.trim().toLowerCase() : "";

    if (!trimmedFirstName) {
      return res.status(400).json({ message: "First name is required." });
    }

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required." });
    }

    if (
      normalizedUsername &&
      !/^[a-z0-9._-]{3,30}$/.test(normalizedUsername)
    ) {
      return res
        .status(400)
        .json({ message: "Username must be 3-30 characters and contain only letters, numbers, dots, underscores, or hyphens." });
    }

    const emailOwner = await User.findOne({ email: normalizedEmail, _id: { $ne: userId } }).lean();

    if (emailOwner) {
      return res.status(409).json({ message: "Email is already in use." });
    }

    if (normalizedUsername) {
      const usernameOwner = await User.findOne({ username: normalizedUsername, _id: { $ne: userId } }).lean();
      if (usernameOwner) {
        return res.status(409).json({ message: "Username is already taken." });
      }
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.firstName = trimmedFirstName;
    user.lastName = trimmedLastName;
    user.name = [trimmedFirstName, trimmedLastName].filter(Boolean).join(" ") || trimmedFirstName;
    user.email = normalizedEmail;
    if (normalizedUsername) {
      user.username = normalizedUsername;
    }

    await user.save();

    await ensureUserSettings(userId);

    const finalUsername = normalizedUsername || user.username || normalizedEmail.split("@")[0];
    await UserSettings.findOneAndUpdate(
      { user: userId },
      { $set: { profile: { username: finalUsername } } },
      { new: true }
    );

    const freshUser = await User.findById(userId).lean();
    const freshSettings = await UserSettings.findOne({ user: userId }).lean();
    const profile = buildSettingsResponse(freshUser, freshSettings).profile;

    return res.json({ profile });
  } catch (error) {
    return next(error);
  }
});

router.put("/email-preferences", async (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }
    const { emailPreferences } = req.body || {};
    const parsed = parseTogglePayload(EMAIL_PREFERENCES, emailPreferences);

    if (parsed.error) {
      return res.status(400).json({ message: parsed.error });
    }

    await ensureUserSettings(userId);
    const updatedSettings = await UserSettings.findOneAndUpdate(
      { user: userId },
      { $set: { emailPreferences: parsed.value } },
      { new: true }
    ).lean();

    const response = mapToggles(EMAIL_PREFERENCES, updatedSettings.emailPreferences);
    return res.json({ emailPreferences: response });
  } catch (error) {
    return next(error);
  }
});

router.put("/push-notifications", async (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }
    const { pushNotifications } = req.body || {};
    const parsed = parseTogglePayload(PUSH_NOTIFICATIONS, pushNotifications);

    if (parsed.error) {
      return res.status(400).json({ message: parsed.error });
    }

    await ensureUserSettings(userId);
    const updatedSettings = await UserSettings.findOneAndUpdate(
      { user: userId },
      { $set: { pushNotifications: parsed.value } },
      { new: true }
    ).lean();

    const response = mapToggles(PUSH_NOTIFICATIONS, updatedSettings.pushNotifications);
    return res.json({ pushNotifications: response });
  } catch (error) {
    return next(error);
  }
});

router.put("/privacy", async (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }
    const { toggles } = req.body || {};
    const parsed = parseTogglePayload(PRIVACY_TOGGLES, toggles);

    if (parsed.error) {
      return res.status(400).json({ message: parsed.error });
    }

    await ensureUserSettings(userId);
    const updatedSettings = await UserSettings.findOneAndUpdate(
      { user: userId },
      { $set: { privacyToggles: parsed.value } },
      { new: true }
    ).lean();

    const response = mapToggles(PRIVACY_TOGGLES, updatedSettings.privacyToggles);

    return res.json({
      privacy: {
        toggles: response,
        passwordPlaceholders: PASSWORD_PLACEHOLDERS,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.put("/appearance", async (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }
    const { darkMode, language } = req.body || {};

    if (typeof darkMode !== "boolean") {
      return res.status(400).json({ message: "darkMode must be a boolean." });
    }

    if (typeof language !== "string") {
      return res.status(400).json({ message: "language must be provided." });
    }

    const normalizedLanguage = language.trim();
    const isValidLanguage = LANGUAGE_OPTIONS.some((option) => option.value === normalizedLanguage);

    if (!isValidLanguage) {
      return res.status(400).json({ message: "Unsupported language selection." });
    }

    await ensureUserSettings(userId);
    const updatedSettings = await UserSettings.findOneAndUpdate(
      { user: userId },
      { $set: { appearance: { darkMode, language: normalizedLanguage } } },
      { new: true }
    ).lean();

    return res.json({
      appearance: {
        darkMode: updatedSettings.appearance?.darkMode ?? false,
        selectedLanguage: updatedSettings.appearance?.language || normalizedLanguage,
        languages: LANGUAGE_OPTIONS,
      },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
