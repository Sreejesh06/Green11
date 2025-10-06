import supabase from "@/lib/supabaseClient";
import { updateMyPoints } from "@/lib/api/profiles";
import { insertActivity } from "@/lib/api/activities";

export type Reward = {
  id: string;
  name: string;
  cost: number;
  description?: string | null;
  image_url?: string | null;
};

export async function getRewards(): Promise<Reward[]> {
  const { data, error } = await supabase
    .from("rewards")
    .select("id,name,cost,description,image_url")
    .order("id", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function redeemReward(rewardId: string, cost?: number) {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");

  const { error } = await supabase.from("redemptions").insert({
    user_id: userId,
    reward_id: rewardId,
  });
  if (error) throw error;

  if (typeof cost === "number") {
    await updateMyPoints(-cost);
  }

  await insertActivity({ type: "reward_redeemed", metadata: { reward_id: rewardId } });
}

export async function upsertReward(input: Partial<Reward> & { name: string; cost: number; id?: string }) {
  const payload: any = {
    name: input.name,
    cost: input.cost,
    description: input.description ?? null,
    image_url: input.image_url ?? null,
  };
  let query = supabase.from("rewards");
  if (input.id) {
    const { error } = await query.update(payload).eq("id", input.id);
    if (error) throw error;
  } else {
    const { error } = await query.insert(payload);
    if (error) throw error;
  }
}


