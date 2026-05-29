import { DATA_MODE } from "../config/dataMode";
import {
  createUser as createApiUser,
  deleteUser as deleteApiUser,
  listUsers as listApiUsers,
  updateUser as updateApiUser,
} from "./usersApi";
import {
  createSupabaseUser,
  deleteSupabaseUser,
  findSupabaseUserByEmail,
  listSupabaseUsers,
  updateSupabaseUser,
} from "./supabaseUsers";

function normalizeUser(user, source) {
  return {
    ...user,
    source,
  };
}

function mergeUsers(apiUsers, supabaseUsers) {
  const result = new Map();

  for (const user of apiUsers) {
    const key = (user.email || `api-${user.id}`).toLowerCase();
    result.set(key, normalizeUser(user, "api"));
  }

  for (const user of supabaseUsers) {
    const key = (user.email || `supabase-${user.id}`).toLowerCase();
    result.set(key, normalizeUser(user, "supabase"));
  }

  return Array.from(result.values()).sort((a, b) => Number(b.id) - Number(a.id));
}

function ensureEditableSource(user) {
  if (user?.source === "supabase") {
    return "supabase";
  }

  if (user?.source === "api") {
    return "api";
  }

  return DATA_MODE === "supabase" ? "supabase" : "api";
}

export function getDataMode() {
  return DATA_MODE;
}

export async function listUsers() {
  if (DATA_MODE === "api") {
    const apiUsers = await listApiUsers();
    return (apiUsers || []).map((user) => normalizeUser(user, "api"));
  }

  if (DATA_MODE === "supabase") {
    const users = await listSupabaseUsers();
    return users.map((user) => normalizeUser(user, "supabase"));
  }

  const [apiResult, supabaseResult] = await Promise.allSettled([
    listApiUsers(),
    listSupabaseUsers(),
  ]);

  const apiUsers = apiResult.status === "fulfilled" ? apiResult.value || [] : [];
  const supabaseUsers =
    supabaseResult.status === "fulfilled" ? supabaseResult.value || [] : [];

  if (apiResult.status === "rejected" && supabaseResult.status === "rejected") {
    throw new Error("Nao foi possivel carregar usuarios da API e do Supabase.");
  }

  return mergeUsers(apiUsers, supabaseUsers);
}

export async function createUser(payload) {
  if (DATA_MODE === "api") {
    const created = await createApiUser(payload);
    return normalizeUser(created, "api");
  }

  if (DATA_MODE === "supabase") {
    const created = await createSupabaseUser(payload);
    return normalizeUser(created, "supabase");
  }

  const createdSupabase = await createSupabaseUser(payload);

  try {
    await createApiUser(payload);
  } catch (error) {
    console.log("API externa indisponivel no create.", error);
  }

  return normalizeUser(createdSupabase, "supabase");
}

export async function updateUser(user, payload) {
  const source = ensureEditableSource(user);

  if (DATA_MODE === "api") {
    const updated = await updateApiUser(user.id, payload);
    return normalizeUser(updated, "api");
  }

  if (DATA_MODE === "supabase") {
    const updated = await updateSupabaseUser(user.id, payload);
    return normalizeUser(updated, "supabase");
  }

  if (source === "supabase") {
    const updated = await updateSupabaseUser(user.id, payload);

    try {
      await updateApiUser(user.id, payload);
    } catch (error) {
      console.log("API externa indisponivel no update.", error);
    }

    return normalizeUser(updated, "supabase");
  }

  const updatedApi = await updateApiUser(user.id, payload);

  try {
    const existing = await findSupabaseUserByEmail(user.email);

    if (existing) {
      await updateSupabaseUser(existing.id, payload);
    } else {
      await createSupabaseUser(payload);
    }
  } catch (error) {
    console.log("Supabase indisponivel no espelhamento de update.", error);
  }

  return normalizeUser(updatedApi, "api");
}

export async function deleteUser(user) {
  const source = ensureEditableSource(user);

  if (DATA_MODE === "api") {
    await deleteApiUser(user.id);
    return true;
  }

  if (DATA_MODE === "supabase") {
    await deleteSupabaseUser(user.id);
    return true;
  }

  if (source === "supabase") {
    await deleteSupabaseUser(user.id);

    try {
      await deleteApiUser(user.id);
    } catch (error) {
      console.log("API externa indisponivel no delete.", error);
    }

    return true;
  }

  await deleteApiUser(user.id);

  try {
    const existing = await findSupabaseUserByEmail(user.email);
    if (existing) {
      await deleteSupabaseUser(existing.id);
    }
  } catch (error) {
    console.log("Supabase indisponivel no espelhamento de delete.", error);
  }

  return true;
}
