const DEFAULT_GEMINI_API_VERSION = "v1beta";

type GeminiModelMetadata = {
  name?: string;
  displayName?: string;
  supportedGenerationMethods?: string[];
};

type GeminiListResponse = {
  models?: GeminiModelMetadata[];
};

const cachedModelByVersion = new Map<string, string>();
const pendingModelByVersion = new Map<string, Promise<string>>();

function normalizeModelName(model: string): string {
  const trimmed = model.trim();
  return trimmed.startsWith("models/") ? trimmed : `models/${trimmed}`;
}

function resolvePreferredModel(models: GeminiModelMetadata[]): string | null {
  const candidates = models.filter((model) =>
    Array.isArray(model.supportedGenerationMethods) &&
    model.supportedGenerationMethods.includes("generateContent")
  );

  if (!candidates.length) {
    return null;
  }

  const flashCandidate = candidates.find((model) =>
    typeof model.name === "string" && /flash/i.test(model.name)
  );

  const chosenModel = flashCandidate?.name ?? candidates.find((model) => typeof model.name === "string")?.name;
  return typeof chosenModel === "string" ? chosenModel : null;
}

async function fetchAvailableModel(apiKey: string, apiVersion: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/${apiVersion}/models?key=${apiKey}`
  );

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    const errorMessage =
      payload?.error?.message ||
      `Unable to list Gemini models (status ${response.status}). Set VITE_GEMINI_MODEL to override.`;
    throw new Error(errorMessage);
  }

  const payload = (await response.json()) as GeminiListResponse;
  const models = Array.isArray(payload?.models) ? payload.models : [];
  const resolvedModel = resolvePreferredModel(models);

  if (!resolvedModel) {
    throw new Error(
      "No Gemini models with generateContent capability found. Set VITE_GEMINI_MODEL to override."
    );
  }

  return resolvedModel;
}

async function resolveModelForVersion(apiKey: string, apiVersion: string): Promise<string> {
  const envModel = import.meta.env.VITE_GEMINI_MODEL;
  if (typeof envModel === "string" && envModel.trim()) {
    return normalizeModelName(envModel);
  }

  if (cachedModelByVersion.has(apiVersion)) {
    return cachedModelByVersion.get(apiVersion)!;
  }

  if (pendingModelByVersion.has(apiVersion)) {
    return pendingModelByVersion.get(apiVersion)!;
  }

  const pending = fetchAvailableModel(apiKey, apiVersion)
    .then((model) => {
      const normalized = normalizeModelName(model);
      cachedModelByVersion.set(apiVersion, normalized);
      return normalized;
    })
    .finally(() => {
      pendingModelByVersion.delete(apiVersion);
    });

  pendingModelByVersion.set(apiVersion, pending);
  return pending;
}

export async function getGeminiEndpoint(apiKey: string): Promise<{
  endpoint: string;
  model: string;
  apiVersion: string;
}> {
  const apiVersion = import.meta.env.VITE_GEMINI_API_VERSION?.trim() || DEFAULT_GEMINI_API_VERSION;
  const model = await resolveModelForVersion(apiKey, apiVersion);
  const endpoint = `https://generativelanguage.googleapis.com/${apiVersion}/${model}:generateContent?key=${apiKey}`;

  return { endpoint, model, apiVersion };
}
