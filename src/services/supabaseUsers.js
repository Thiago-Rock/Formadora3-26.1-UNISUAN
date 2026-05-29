import { supabase } from "./supabase";

export async function listSupabaseUsers() {
  const { data, error } = await supabase
    .from("user")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    throw new Error(error.message || "Falha ao listar usuarios no Supabase.");
  }

  return data || [];
}

export async function createSupabaseUser(payload) {
  const { data, error } = await supabase
    .from("user")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || "Falha ao criar usuario no Supabase.");
  }

  return data;
}

export async function updateSupabaseUser(id, payload) {
  const { data, error } = await supabase
    .from("user")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || "Falha ao atualizar usuario no Supabase.");
  }

  return data;
}

export async function deleteSupabaseUser(id) {
  const { error } = await supabase.from("user").delete().eq("id", id);

  if (error) {
    throw new Error(error.message || "Falha ao excluir usuario no Supabase.");
  }

  return true;
}

export async function findSupabaseUserByEmail(email) {
  const { data, error } = await supabase
    .from("user")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Falha ao consultar usuario no Supabase.");
  }

  return data;
}
