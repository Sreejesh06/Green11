import supabase from "@/lib/supabaseClient";

export type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at?: string | null;
  points?: number | null; // optional aggregate if you track points here
};

export async function getMyProfile(): Promise<Profile | null> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  const userId = userData.user?.id;
  if (!userId) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id,username,full_name,avatar_url,created_at")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateMyProfile(updates: Partial<Profile>) {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);
  if (error) throw error;
}

export async function uploadAvatar(file: File): Promise<string> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");

  const filePath = `${userId}/avatar_${Date.now()}_${file.name}`;
  const { error: uploadError } = await supabase.storage.from("proofs").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) throw uploadError;
  const { data: urlData } = supabase.storage.from("proofs").getPublicUrl(filePath);
  return urlData.publicUrl;
}

export async function getMyPoints(): Promise<number> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  const userId = userData.user?.id;
  if (!userId) return 0;
  const { data, error } = await supabase
    .from("profiles")
    .select("points")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data?.points ?? 0;
}

export async function updateMyPoints(delta: number): Promise<number> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");

  const current = await getMyPoints();
  const next = Math.max(0, current + delta);
  const { error } = await supabase
    .from("profiles")
    .update({ points: next })
    .eq("id", userId);
  if (error) throw error;
  return next;
}


