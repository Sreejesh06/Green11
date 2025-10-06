import supabase from "@/lib/supabaseClient";

export type Challenge = {
  id: string;
  title: string;
  description?: string | null;
  points?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  created_at?: string | null;
};

export async function getActiveChallenges(): Promise<Challenge[]> {
  const { data, error } = await supabase
    .from("challenges")
    .select("id,title,description,points,start_date,end_date,created_at")
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) throw error;
  return data ?? [];
}

export async function getMySubmissionsByChallenge(): Promise<Record<string, { count: number; approved: number }>> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  const userId = userData.user?.id;
  if (!userId) return {};

  const { data, error } = await supabase
    .from("submissions")
    .select("challenge_id,status")
    .eq("user_id", userId);
  if (error) throw error;

  const agg: Record<string, { count: number; approved: number }> = {};
  (data ?? []).forEach((s: any) => {
    const cid = String(s.challenge_id);
    if (!agg[cid]) agg[cid] = { count: 0, approved: 0 };
    agg[cid].count += 1;
    if (s.status === "approved") agg[cid].approved += 1;
  });
  return agg;
}

export async function listAllChallenges(): Promise<Challenge[]> {
  const { data, error } = await supabase
    .from("challenges")
    .select("id,title,description,points,start_date,end_date,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function upsertChallenge(input: Partial<Challenge> & { title: string; points: number; id?: string }) {
  const payload: any = {
    title: input.title,
    points: input.points,
    description: input.description ?? null,
    start_date: input.start_date ?? null,
    end_date: input.end_date ?? null,
  };
  let query = supabase.from("challenges");
  if (input.id) {
    const { error } = await query.update(payload).eq("id", input.id);
    if (error) throw error;
  } else {
    const { error } = await query.insert(payload);
    if (error) throw error;
  }
}


