import supabase from "@/lib/supabaseClient";

export type Activity = {
  id: string;
  user_id: string | null;
  type: string;
  metadata: any | null;
  created_at: string;
};

export async function getRecentActivities(limit = 10): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("activities")
    .select("id,user_id,type,metadata,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function insertActivity(input: { type: string; metadata?: any }) {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");

  const { error } = await supabase.from("activities").insert({
    user_id: userId,
    type: input.type,
    metadata: input.metadata ?? null,
  });
  if (error) throw error;
}


