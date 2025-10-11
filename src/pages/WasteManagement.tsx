import { type ComponentType, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ArrowUpRight, BarChart3, ClipboardList, Leaf, Loader2, Plus, Recycle, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";

const STREAM_COLORS: Record<string, string> = {
  recyclables: "var(--primary)",
  organics: "#22c55e",
  landfill: "#ef4444",
};

const PIE_COLORS = ["#22c55e", "#0ea5e9", "#f97316", "#a855f7", "#facc15", "#ec4899"];

const QUICK_ACTION_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  createCampaign: BarChart3,
  manageUsers: Users,
  logDisposal: ClipboardList,
  manageRewards: Target,
};

type OverviewCard = {
  id: string;
  label: string;
  value: number;
  unit?: string;
  changePercent?: number;
  caption?: string;
  active?: number;
  inactive?: number;
};

type QuickAction = {
  id: string;
  label: string;
  description: string;
};

type SortingCategory = {
  id: string;
  title: string;
  description: string;
  items: { item: string; instructions: string }[];
};

type DisposalEntry = {
  id: string;
  stream: string;
  amountKg: number;
  date: string;
};

type WasteGoal = {
  id: string;
  title: string;
  description: string;
  owner: string;
  timeframe: string;
  currentValue: number;
  targetValue: number;
  unit: string;
};

type RecognitionMetric = {
  id: string;
  label: string;
  value: number;
  unit: string;
  changePercent?: number;
};

type WasteResponse = {
  hero: {
    greeting: string;
    userName?: string;
    message: string;
  };
  overview: OverviewCard[];
  quickActions: QuickAction[];
  sortingGuide: SortingCategory[];
  disposalLogs: {
    entries: DisposalEntry[];
    weeklySummary: {
      totalKg: number;
      diversionRate: number;
      changePercent: number;
    };
  };
  reductionSeries: { day: string; recycledKg: number; organicsKg: number; landfillKg: number }[];
  streamBreakdown: { name: string; percentage: number }[];
  recognitionBoard: RecognitionMetric[];
  goals: WasteGoal[];
};

type GoalFormState = Record<string, number>;

type LogFormState = {
  stream: string;
  amountKg: string;
  date: string;
  note: string;
};

const initialLogFormState: LogFormState = {
  stream: "recyclables",
  amountKg: "",
  date: new Date().toISOString().slice(0, 10),
  note: "",
};

export default function WasteManagement() {
  const { token } = useAuth();
  const [data, setData] = useState<WasteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logForm, setLogForm] = useState<LogFormState>(initialLogFormState);
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);
  const [goalForm, setGoalForm] = useState<GoalFormState>({});
  const [updatingGoal, setUpdatingGoal] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadWasteModule = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/waste`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const payload: WasteResponse = await response.json();
        setData(payload);
        setGoalForm(
          payload.goals.reduce<GoalFormState>((acc, goal) => {
            acc[goal.id] = goal.currentValue;
            return acc;
          }, {})
        );
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load waste management data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadWasteModule();
  }, [token]);

  const disposalTotals = useMemo(() => {
    if (!data) {
      return { recyclables: 0, organics: 0, landfill: 0 };
    }

    return data.disposalLogs.entries.reduce(
      (acc, entry) => {
        acc[entry.stream as keyof typeof acc] += entry.amountKg;
        return acc;
      },
      { recyclables: 0, organics: 0, landfill: 0 }
    );
  }, [data]);

  const handleLogChange = (field: keyof LogFormState, value: string) => {
    setLogForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitLog = async () => {
    if (!token) {
      toast.error("You must be signed in to log waste.");
      return;
    }

    const amount = Number.parseFloat(logForm.amountKg);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid positive amount in kilograms.");
      return;
    }

    try {
      setIsSubmittingLog(true);
      const response = await fetch(`${API_BASE_URL}/api/waste/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stream: logForm.stream,
          amountKg: amount,
          date: logForm.date,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message = payload?.message ?? "Unable to save disposal log.";
        throw new Error(message);
      }

      const payload = (await response.json()) as {
        entry: DisposalEntry;
        weeklySummary: WasteResponse["disposalLogs"]["weeklySummary"];
      };

      setData((current) =>
        current
          ? {
              ...current,
              disposalLogs: {
                entries: [...current.disposalLogs.entries, payload.entry],
                weeklySummary: payload.weeklySummary,
              },
            }
          : current
      );

      setLogForm((prev) => ({ ...prev, amountKg: "", note: "" }));
      toast.success("Waste log recorded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to record disposal log.");
    } finally {
      setIsSubmittingLog(false);
    }
  };

  const handleUpdateGoal = async (goalId: string) => {
    if (!token) {
      toast.error("You must be signed in to update goals.");
      return;
    }

    const value = goalForm[goalId];
    if (value === undefined) {
      return;
    }

    try {
      setUpdatingGoal(goalId);
      const response = await fetch(`${API_BASE_URL}/api/waste/goals/${goalId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentValue: value }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message = payload?.message ?? "Unable to update goal.";
        throw new Error(message);
      }

      const payload = (await response.json()) as { goal: WasteGoal };

      setData((current) =>
        current
          ? {
              ...current,
              goals: current.goals.map((goal) => (goal.id === payload.goal.id ? payload.goal : goal)),
            }
          : current
      );

      toast.success("Goal progress updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update goal.");
    } finally {
      setUpdatingGoal(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-4">
        <p className="text-lg font-semibold text-foreground">Unable to load the waste management module.</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const heroTitle = data.hero.userName ? `${data.hero.greeting}, ${data.hero.userName}` : data.hero.greeting;

  return (
    <div className="space-y-8 px-4 pb-12 pt-6 md:px-8">
     
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.overview.map((card) => (
          <Card key={card.id} className="border-white/10 bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-foreground">
                {card.value.toLocaleString()} {card.unit}
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                {card.changePercent !== undefined && (
                  <span className="flex items-center rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                    +{card.changePercent}%
                  </span>
                )}
                {card.active !== undefined && card.inactive !== undefined ? (
                  <span>
                    {card.active} active • {card.inactive} inactive
                  </span>
                ) : (
                  card.caption && <span>{card.caption}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr,1fr]">
        <Card className="border-white/10 bg-card/80">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Waste reduction trends</CardTitle>
              <CardDescription>Track diversion efforts across recycling, organics, and landfill streams.</CardDescription>
            </div>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: STREAM_COLORS.recyclables }} />
                Recyclables
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: STREAM_COLORS.organics }} />
                Organics
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: STREAM_COLORS.landfill }} />
                Landfill
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={data.reductionSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.4)" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <Tooltip cursor={{ stroke: "hsl(var(--border))" }} />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="recycledKg" name="Recycled" stroke={STREAM_COLORS.recyclables} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="organicsKg" name="Organics" stroke={STREAM_COLORS.organics} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="landfillKg" name="Landfill" stroke={STREAM_COLORS.landfill} strokeWidth={2} dot={false} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Stream distribution</CardTitle>
              <CardDescription>Where your e-waste donations are making the biggest difference.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex h-[320px] flex-col items-center justify-center gap-4">
            <ResponsiveContainer width="100%" height="70%">
              <PieChart>
                <Pie data={data.streamBreakdown} dataKey="percentage" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={4}>
                  {data.streamBreakdown.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid w-full grid-cols-2 gap-2 text-xs text-muted-foreground">
              {data.streamBreakdown.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: PIE_COLORS[index % PIE_COLORS.length] }}
                  />
                  <span className="flex-1">
                    {entry.name}
                    <span className="ml-2 font-semibold text-foreground">{entry.percentage}%</span>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
        <Card className="border-white/10 bg-card/80">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Sort smarter</CardTitle>
              <CardDescription>Teach your residents how to separate waste like pros.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {data.sortingGuide.map((category) => (
                <div key={category.id} className="rounded-2xl border border-white/10 bg-gradient-to-br from-background to-card/60 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-foreground">{category.title}</h3>
                    <Leaf className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                  <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                    {category.items.map((tip) => (
                      <li key={tip.item} className="rounded-xl border border-white/10 bg-card/50 p-3">
                        <p className="font-medium text-foreground">{tip.item}</p>
                        <p className="text-xs text-muted-foreground/80">{tip.instructions}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick actions</CardTitle>
            <CardDescription>Launch the next step in your waste strategy.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {data.quickActions.map((action) => {
              const Icon = QUICK_ACTION_ICONS[action.id] ?? Target;
              return (
                <button
                  key={action.id}
                  type="button"
                  className="group flex w-full items-start gap-3 rounded-xl border border-white/10 bg-card/50 p-4 text-left transition hover:border-primary/40 hover:bg-primary/10"
                >
                  <Icon className="mt-1 h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </button>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr,1fr]">
        <Card className="border-white/10 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Disposal log</CardTitle>
              <CardDescription>Last seven days of reported waste weights.</CardDescription>
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Recycle className="h-3.5 w-3.5 text-primary" /> {disposalTotals.recyclables.toFixed(1)} kg
              </span>
              <span className="flex items-center gap-1">
                <Leaf className="h-3.5 w-3.5 text-[#22c55e]" /> {disposalTotals.organics.toFixed(1)} kg
              </span>
              <span className="flex items-center gap-1">
                <TrashIcon className="h-3.5 w-3.5 text-[#ef4444]" /> {disposalTotals.landfill.toFixed(1)} kg
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-card/60">
              <ScrollArea className="h-60">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card/80 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Stream</th>
                      <th className="px-4 py-3 text-left">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.disposalLogs.entries
                      .slice()
                      .reverse()
                      .map((entry) => (
                        <tr key={entry.id} className="border-t border-white/5 text-foreground">
                          <td className="px-4 py-2 text-sm text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-4 py-2 capitalize">
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-1 text-xs font-semibold",
                                entry.stream === "recyclables" && "bg-primary/10 text-primary",
                                entry.stream === "organics" && "bg-emerald-100/60 text-emerald-700",
                                entry.stream === "landfill" && "bg-destructive/10 text-destructive"
                              )}
                            >
                              {entry.stream}
                            </span>
                          </td>
                          <td className="px-4 py-2 font-semibold">{entry.amountKg.toFixed(1)} kg</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </ScrollArea>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card/60 p-4">
              <h3 className="text-sm font-semibold text-foreground">Log a new disposal</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-4">
                <div className="grid gap-1">
                  <Label htmlFor="stream">Stream</Label>
                  <select
                    id="stream"
                    value={logForm.stream}
                    onChange={(event) => handleLogChange("stream", event.target.value)}
                    className="rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="recyclables">Recyclables</option>
                    <option value="organics">Organics</option>
                    <option value="landfill">Landfill</option>
                  </select>
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="amount">Kilograms</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.1"
                    min="0"
                    value={logForm.amountKg}
                    onChange={(event) => handleLogChange("amountKg", event.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="log-date">Date</Label>
                  <Input
                    id="log-date"
                    type="date"
                    value={logForm.date}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(event) => handleLogChange("date", event.target.value)}
                  />
                </div>
                <div className="grid gap-1 self-end">
                  <Button onClick={handleSubmitLog} disabled={isSubmittingLog} className="w-full">
                    {isSubmittingLog ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}Log
                    entry
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Weekly impact</CardTitle>
            <CardDescription>Summaries update automatically as you log new entries.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-card/60 p-4">
              <p className="text-sm text-muted-foreground">Total diverted this week</p>
              <p className="mt-2 flex items-end gap-2 text-3xl font-semibold text-foreground">
                {data.disposalLogs.weeklySummary.totalKg.toFixed(0)}
                <span className="text-base font-normal text-muted-foreground">kg</span>
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs text-primary">
                <ArrowUpRight className="h-4 w-4" /> +{data.disposalLogs.weeklySummary.changePercent}% vs last week
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-card/60 p-4">
              <p className="text-sm text-muted-foreground">Diversion rate</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{data.disposalLogs.weeklySummary.diversionRate}%</p>
              <Progress value={data.disposalLogs.weeklySummary.diversionRate} className="mt-3" />
            </div>
            <div className="rounded-2xl border border-white/10 bg-card/60 p-4">
              <p className="text-sm text-muted-foreground">Recognition board</p>
              <div className="mt-4 grid gap-3">
                {data.recognitionBoard.map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-foreground">{metric.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {metric.value.toLocaleString()} {metric.unit}
                      </p>
                    </div>
                    {metric.changePercent !== undefined && (
                      <span className="text-xs font-semibold text-primary">+{metric.changePercent}%</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
        <Card className="border-white/10 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Goals & initiatives</CardTitle>
            <CardDescription>Set personal and community commitments to stay accountable.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.goals.map((goal) => {
              const progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
              return (
                <div key={goal.id} className="rounded-2xl border border-white/10 bg-card/60 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{goal.title}</p>
                      <p className="text-xs text-muted-foreground">{goal.description}</p>
                      <p className="mt-2 text-xs text-muted-foreground">Owner: {goal.owner}</p>
                      <p className="text-xs text-muted-foreground">Timeline: {goal.timeframe}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold text-foreground">
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">{progress}% complete</p>
                    </div>
                  </div>
                  <Progress value={progress} className="mt-3" />
                  <div className="mt-3 grid gap-2 sm:grid-cols-[1fr,auto] sm:items-center">
                    <div className="grid gap-1">
                      <Label htmlFor={`${goal.id}-value`} className="text-xs">
                        Update progress ({goal.unit})
                      </Label>
                      <Input
                        id={`${goal.id}-value`}
                        type="number"
                        value={goalForm[goal.id] ?? goal.currentValue}
                        onChange={(event) =>
                          setGoalForm((prev) => ({ ...prev, [goal.id]: Number(event.target.value) }))
                        }
                        min={0}
                        step="0.5"
                      />
                    </div>
                    <Button
                      size="sm"
                      className="mt-2 sm:mt-6"
                      onClick={() => handleUpdateGoal(goal.id)}
                      disabled={updatingGoal === goal.id}
                    >
                      {updatingGoal === goal.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Target className="mr-2 h-4 w-4" />
                      )}
                      Save
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Waste education notes</CardTitle>
            <CardDescription>Capture quick reminders for your next workshop.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={10}
              placeholder="Collect ideas for signage, reminders, or upcoming events..."
              className="min-h-[220px]"
            />
            <Button variant="outline" className="mt-3 w-full">
              <Plus className="mr-2 h-4 w-4" /> Save note locally
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("h-4 w-4", className)}
    >
      <path d="M9 3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1h4a1 1 0 1 1 0 2h-1v14a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5H4a1 1 0 1 1 0-2h5Zm8 2H7v14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5ZM10 8a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0V9a1 1 0 0 1 1-1Zm4 0a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0V9a1 1 0 0 1 1-1Zm-4-4v1h4V4h-4Z" />
    </svg>
  );
}
