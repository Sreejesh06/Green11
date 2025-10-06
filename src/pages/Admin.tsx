import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPendingSubmissions, approveSubmission, rejectSubmission, type PendingSubmission } from "@/lib/api/admin";
import { toast } from "sonner";
import { queryKeys } from "@/lib/api/queryKeys";
import supabase from "@/lib/supabaseClient";
import { getSession } from "@/lib/api/auth";
import { listAllChallenges, upsertChallenge } from "@/lib/api/challenges";
import { getRewards, upsertReward, type Reward as RewardType } from "@/lib/api/rewards";

export default function Admin() {
  const [isStaff, setIsStaff] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const session = await getSession();
      if (!session) return;
      const uid = session.user.id;
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", uid)
        .maybeSingle();
      if (!mounted) return;
      if (error) {
        setIsStaff(false);
      } else {
        setIsStaff(data?.role === "admin" || data?.role === "moderator");
      }
    })();
    return () => { mounted = false; };
  }, []);

  const { data: rows = [], isLoading, error } = useQuery({
    queryKey: ["admin_pending_submissions"],
    queryFn: getPendingSubmissions,
    enabled: isStaff,
  });

  const approveMut = useMutation({
    mutationFn: async (id: string) => approveSubmission(id),
    onMutate: async (id) => {
      const prev = queryClient.getQueryData<PendingSubmission[]>(["admin_pending_submissions"]);
      queryClient.setQueryData(["admin_pending_submissions"], (old: PendingSubmission[] | undefined) => (old || []).filter(r => r.id !== id));
      return { prev };
    },
    onError: (err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["admin_pending_submissions"], ctx.prev);
      toast.error(err instanceof Error ? err.message : "Approval failed");
    },
    onSuccess: () => {
      toast.success("Submission approved");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_pending_submissions"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.submissionsProgress });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities });
      queryClient.invalidateQueries({ queryKey: queryKeys.myPoints });
    },
  });

  const rejectMut = useMutation({
    mutationFn: async (id: string) => rejectSubmission(id),
    onMutate: async (id) => {
      const prev = queryClient.getQueryData<PendingSubmission[]>(["admin_pending_submissions"]);
      queryClient.setQueryData(["admin_pending_submissions"], (old: PendingSubmission[] | undefined) => (old || []).filter(r => r.id !== id));
      return { prev };
    },
    onError: (err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["admin_pending_submissions"], ctx.prev);
      toast.error(err instanceof Error ? err.message : "Rejection failed");
    },
    onSuccess: () => {
      toast.success("Submission rejected");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_pending_submissions"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities });
    },
  });

  if (!isStaff) {
    return (
      <div className="p-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Admin</CardTitle>
            <CardDescription>Access restricted</CardDescription>
          </CardHeader>
          <CardContent>You do not have permission to view this page.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2"><span className="text-gradient">Admin</span></h1>
        <p className="text-muted-foreground">Moderate submissions and manage content</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Pending Submissions</CardTitle>
          <CardDescription>Approve or reject user submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : error ? (
            <div className="text-sm text-destructive">{(error as Error).message}</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-muted-foreground">No pending submissions</div>
          ) : (
            <div className="space-y-3">
              {rows.map((row) => (
                <div key={row.id} className="flex items-center justify-between p-3 rounded-lg bg-card/40 border border-white/5">
                  <div>
                    <div className="text-sm font-medium">Submission {row.id.slice(0,8)}</div>
                    <div className="text-xs text-muted-foreground">Challenge {row.challenge_id} • {new Date(row.submitted_at).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={approveMut.isPending || rejectMut.isPending} onClick={() => approveMut.mutate(row.id)}>
                      {approveMut.isPending ? "Approving..." : "Approve"}
                    </Button>
                    <Button size="sm" variant="destructive" disabled={approveMut.isPending || rejectMut.isPending} onClick={() => rejectMut.mutate(row.id)}>
                      {rejectMut.isPending ? "Rejecting..." : "Reject"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Challenges Management */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Challenges</CardTitle>
            <CardDescription>Create or edit challenges</CardDescription>
          </CardHeader>
          <CardContent>
            <ChallengesEditor />
          </CardContent>
        </Card>

        {/* Rewards Management */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Rewards</CardTitle>
            <CardDescription>Create or edit rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <RewardsEditor />
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Refresh */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>Refresh materialized view</CardDescription>
        </CardHeader>
        <CardContent>
          <RefreshLeaderboardButton />
        </CardContent>
      </Card>
    </div>
  );
}

function ChallengesEditor() {
  const queryClient = useQueryClient();
  const { data: challenges = [], isLoading } = useQuery({ queryKey: ["admin_challenges"], queryFn: listAllChallenges });
  const [form, setForm] = useState({ id: undefined as string | undefined, title: "", points: 0, description: "", start_date: "", end_date: "" });
  const mut = useMutation({
    mutationFn: async () => upsertChallenge({ id: form.id, title: form.title, points: Number(form.points), description: form.description || null, start_date: form.start_date || null, end_date: form.end_date || null }),
    onSuccess: () => { toast.success("Saved challenge"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["admin_challenges"] }),
  });
  return (
    <div className="space-y-3">
      {isLoading ? <div className="text-sm text-muted-foreground">Loading...</div> : (
        <div className="space-y-2">
          {challenges.map(ch => (
            <div key={ch.id} className="flex items-center justify-between p-2 rounded border border-white/10">
              <div className="text-sm">{ch.title} • {ch.points ?? 0} GP</div>
              <Button size="sm" variant="outline" onClick={() => setForm({ id: ch.id, title: ch.title, points: ch.points ?? 0, description: ch.description || "", start_date: ch.start_date || "", end_date: ch.end_date || "" })}>Edit</Button>
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <input className="glass-input rounded px-3 py-2" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <input className="glass-input rounded px-3 py-2" placeholder="Points" type="number" value={form.points} onChange={e => setForm({ ...form, points: Number(e.target.value) })} />
        <input className="glass-input rounded px-3 py-2 col-span-2" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <input className="glass-input rounded px-3 py-2" placeholder="Start Date (ISO)" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
        <input className="glass-input rounded px-3 py-2" placeholder="End Date (ISO)" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
      </div>
      <Button size="sm" onClick={() => mut.mutate()} disabled={mut.isPending}>{mut.isPending ? "Saving..." : (form.id ? "Update" : "Create")}</Button>
    </div>
  );
}

function RewardsEditor() {
  const queryClient = useQueryClient();
  const { data: rewards = [], isLoading } = useQuery({ queryKey: ["admin_rewards"], queryFn: getRewards });
  const [form, setForm] = useState<Partial<RewardType> & { id?: number }>({ name: "", cost: 0, category: "", stock: 0, description: "", rarity: "" });
  const mut = useMutation({
    mutationFn: async () => upsertReward({ id: form.id, name: String(form.name), cost: Number(form.cost), category: form.category || null, stock: form.stock || null, description: form.description || null, rarity: form.rarity || null }),
    onSuccess: () => { toast.success("Saved reward"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["admin_rewards"] }),
  });
  return (
    <div className="space-y-3">
      {isLoading ? <div className="text-sm text-muted-foreground">Loading...</div> : (
        <div className="space-y-2">
          {rewards.map(r => (
            <div key={r.id} className="flex items-center justify-between p-2 rounded border border-white/10">
              <div className="text-sm">{r.name} • {r.cost} GP • stock {r.stock ?? 0}</div>
              <Button size="sm" variant="outline" onClick={() => setForm({ id: r.id, name: r.name, cost: r.cost, category: r.category, stock: r.stock, description: r.description, rarity: r.rarity })}>Edit</Button>
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <input className="glass-input rounded px-3 py-2" placeholder="Name" value={form.name as string} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input className="glass-input rounded px-3 py-2" placeholder="Cost" type="number" value={Number(form.cost)} onChange={e => setForm({ ...form, cost: Number(e.target.value) })} />
        <input className="glass-input rounded px-3 py-2" placeholder="Category" value={(form.category || "") as string} onChange={e => setForm({ ...form, category: e.target.value })} />
        <input className="glass-input rounded px-3 py-2" placeholder="Stock" type="number" value={Number(form.stock) || 0} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} />
        <input className="glass-input rounded px-3 py-2 col-span-2" placeholder="Description" value={(form.description || "") as string} onChange={e => setForm({ ...form, description: e.target.value })} />
        <input className="glass-input rounded px-3 py-2 col-span-2" placeholder="Rarity" value={(form.rarity || "") as string} onChange={e => setForm({ ...form, rarity: e.target.value })} />
      </div>
      <Button size="sm" onClick={() => mut.mutate()} disabled={mut.isPending}>{mut.isPending ? "Saving..." : (form.id ? "Update" : "Create")}</Button>
    </div>
  );
}

function RefreshLeaderboardButton() {
  const [loading, setLoading] = useState(false);
  const onClick = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.rpc("refresh_leaderboard");
      if (error) throw error;
      toast.success("Leaderboard refreshed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button size="sm" onClick={onClick} disabled={loading}>{loading ? "Refreshing..." : "Refresh"}</Button>
  );
}


