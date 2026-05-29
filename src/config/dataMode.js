const allowedModes = new Set(["api", "supabase", "hybrid"]);

const rawMode = (process.env.EXPO_PUBLIC_DATA_MODE || "hybrid").toLowerCase();

export const DATA_MODE = allowedModes.has(rawMode) ? rawMode : "hybrid";
