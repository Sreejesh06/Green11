import supabase from "@/lib/supabaseClient";

export type LeaderboardEntry = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  points: number;
};

// Assumes profiles has a points column or you compute via a materialized view
export async function getTopProfiles(limit = 50): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,username,full_name,avatar_url,points")
    .order("points", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((p: any) => ({
    id: p.id,
    username: p.username,
    full_name: p.full_name,
    avatar_url: p.avatar_url,
    points: p.points ?? 0,
  }));
}


