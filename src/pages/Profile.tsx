import { useEffect, useMemo, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
	Award,
	CheckCircle2,
	Settings,
	Share2,
	Target,
	TrendingUp,
	Users
} from "lucide-react";

import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { getAvatarIcon } from "@/lib/avatar-icons";
import { getLucideIcon } from "@/lib/icon-map";
import { useToast } from "@/hooks/use-toast";

type ProfileBadge = {
	iconName: string;
	label: string;
	variant?: string;
};

type ProfileStat = {
	label: string;
	value: number | string;
	iconName: string;
	color?: string;
};

type ProfileAchievement = {
	id: number;
	name: string;
	description: string;
	iconName: string;
	earned: boolean;
	rarity: string;
};

type ProfileChallenge = {
	name: string;
	completed: boolean;
	points: number;
	date: string;
};

type TeamOverview = {
	name: string;
	rank: number;
	totalPoints: number;
	members: string;
	averageGpPerPlayer: number;
};

type ProfileResponse = {
	user: {
		name: string;
		initials: string;
		level: number;
		team: string;
		joined: string;
		levelProgress: {
			current: number;
			total: number;
			nextLevelRemaining: number;
		};
	};
	badges: ProfileBadge[];
	stats: ProfileStat[];
	achievements: ProfileAchievement[];
	recentChallenges: ProfileChallenge[];
	teamOverview: TeamOverview;
};

const rarityStyles: Record<string, string> = {
	common: "border-muted-foreground/30 bg-muted/20",
	rare: "border-secondary/50 bg-secondary/10",
	epic: "border-primary/50 bg-primary/10",
	legendary: "border-accent/50 bg-accent/10"
};

const badgeVariantStyles: Record<string, string> = {
	primary: "bg-primary/20 border-primary/30",
	secondary: "bg-secondary/20 border-secondary/30",
	accent: "bg-accent/20 border-accent/30"
};

const Profile = () => {
	const { token } = useAuth();
	const [data, setData] = useState<ProfileResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { toast } = useToast();

	const handleShare = async () => {
		if (!data) {
			return;
		}

		const shareUrl = typeof window !== "undefined" ? window.location.href : "";
		const shareText = `Celebrating ${data.user.name}'s sustainability progress on Green11!`;
		const shareTitle = "Green11 Sustainability Journey";

		if (typeof navigator !== "undefined" && navigator.share) {
			try {
				await navigator.share({
					title: shareTitle,
					text: shareText,
					url: shareUrl
				});
				toast({
					description: "Thanks for spreading the word!"
				});
				return;
			} catch (err) {
				if (err instanceof Error && err.name === "AbortError") {
					return;
				}
				toast({
					variant: "destructive",
					title: "Could not open share sheet",
					description: "We'll redirect you to a social share page instead."
				});
			}
		}

		const encodedMessage = encodeURIComponent(`${shareText} ${shareUrl}`.trim());
		const shareTarget = `https://twitter.com/intent/tweet?text=${encodedMessage}`;
		const newWindow = window.open(shareTarget, "_blank", "noopener,noreferrer");

		if (!newWindow) {
			toast({
				variant: "destructive",
				title: "Pop-up blocked",
				description: "Allow pop-ups to share your profile on social media."
			});
			return;
		}

		toast({
			description: "Opening social sharing options…"
		});
	};

	useEffect(() => {
		let isMounted = true;

		async function loadProfileContent() {
			if (!token) {
				return;
			}

			try {
				setIsLoading(true);
				const response = await fetch(`${API_BASE_URL}/api/profile`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				if (!response.ok) {
					throw new Error(`Request failed: ${response.status}`);
				}

				const payload: ProfileResponse = await response.json();
				if (isMounted) {
					setData(payload);
					setError(null);
				}
			} catch (err) {
				if (isMounted) {
					setError(
						err instanceof Error ? err.message : "Failed to load profile content"
					);
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		}

		loadProfileContent();

		return () => {
			isMounted = false;
		};
	}, [token]);

	const progressPercent = data
		? Math.round((data.user.levelProgress.current / data.user.levelProgress.total) * 100)
		: 0;

	const totalAchievements = data?.achievements.length ?? 0;
	const earnedAchievements =
		data?.achievements.filter((achievement) => achievement.earned).length ?? 0;

	const numberFormatter = useMemo(() => new Intl.NumberFormat("en-IN"), []);
	const avatarIcon = data ? getAvatarIcon(data.user.initials) : undefined;

	return (
		<div className="p-6 space-y-6">
			{isLoading && (
				<div className="rounded-lg border border-white/10 bg-card/40 px-6 py-4 text-center text-sm text-muted-foreground">
					Loading your profile...
				</div>
			)}

			{error && (
				<div className="rounded-lg border border-destructive/30 bg-destructive/10 px-6 py-4 text-center text-sm text-destructive">
					Could not load profile data: {error}
				</div>
			)}

			{data && (
				<>
					<Card className="glass-card">
						<CardContent className="p-8">
							<div className="flex flex-col gap-6 md:flex-row md:items-start">
								<Avatar className="h-28 w-28 ring-4 ring-primary/30">
									{avatarIcon ? (
										<AvatarImage src={avatarIcon.src} alt={avatarIcon.alt} />
									) : null}
									<AvatarFallback className="bg-gradient-to-br from-primary via-primary-glow to-secondary text-4xl font-bold text-primary-foreground">
										{data.user.initials}
									</AvatarFallback>
								</Avatar>

								<div className="flex-1 space-y-4 text-center md:text-left">
									<div>
										<h1 className="mb-2 text-4xl font-bold">{data.user.name}</h1>
										<div className="flex flex-wrap justify-center gap-2 md:justify-start">
											{data.badges.map((badge) => {
												const Icon = getLucideIcon(badge.iconName);
												const badgeClasses =
													badgeVariantStyles[badge.variant ?? "primary"] ??
													badgeVariantStyles.primary;
												return (
													<Badge key={badge.label} variant="outline" className={badgeClasses}>
														<Icon className="mr-1 h-3 w-3" />
														{badge.label}
													</Badge>
												);
											})}
										</div>
									</div>

									<div className="mx-auto max-w-md space-y-2 md:mx-0">
										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">Level Progress</span>
											<span className="font-medium text-foreground">
												{numberFormatter.format(data.user.levelProgress.current)} / {numberFormatter.format(data.user.levelProgress.total)} GP
											</span>
										</div>
										<Progress value={progressPercent} className="h-3" />
										<p className="text-xs text-muted-foreground">
											{numberFormatter.format(data.user.levelProgress.nextLevelRemaining)} GP until Level {data.user.level + 1}
										</p>
									</div>
								</div>

								<div className="flex gap-2 self-center md:self-auto">
									<Button variant="outline" size="icon">
										<Settings className="h-4 w-4" />
									</Button>
									<Button variant="outline" size="icon" onClick={handleShare}>
										<Share2 className="h-4 w-4" />
									</Button>
									<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
										Edit Profile
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>

					<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
						{data.stats.map((stat) => {
							const Icon = getLucideIcon(stat.iconName);
							return (
								<Card key={stat.label} className="glass-card">
									<CardContent className="p-6 text-center">
										<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
											<Icon className={`h-6 w-6 ${stat.color ?? "text-primary"}`} />
										</div>
										<p className="mb-1 text-3xl font-bold">
											{typeof stat.value === "number"
												? numberFormatter.format(stat.value)
												: stat.value}
										</p>
										<p className="text-xs text-muted-foreground">{stat.label}</p>
									</CardContent>
								</Card>
							);
						})}
					</div>

					<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
						<Card className="glass-card">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Award className="h-5 w-5 text-accent" />
									Trophy Case
								</CardTitle>
								<CardDescription>
									{earnedAchievements} of {totalAchievements} achievements unlocked
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 gap-4">
									{data.achievements.map((achievement) => {
										const Icon = getLucideIcon(achievement.iconName);
										const rarityClasses = rarityStyles[achievement.rarity] ?? rarityStyles.common;
										return (
											<div
												key={achievement.id}
												className={`rounded-xl p-5 transition-all ${
													achievement.earned
														? `${rarityClasses} cursor-pointer hover:scale-105`
														: "border-muted/30 bg-muted/5 grayscale opacity-40"
												}`}
											>
												<div className="flex flex-col items-center gap-2 text-center">
													<div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
														<Icon
															className={`h-7 w-7 ${
																achievement.earned
																	? "text-accent"
																	: "text-muted-foreground"
															}`}
														/>
													</div>
													<div>
														<h4 className="mb-1 text-sm font-semibold">{achievement.name}</h4>
														<p className="text-xs text-muted-foreground">
															{achievement.description}
														</p>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</CardContent>
						</Card>

						<Card className="glass-card">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<TrendingUp className="h-5 w-5 text-primary" />
									Recent Challenges
								</CardTitle>
								<CardDescription>Your latest sustainability actions</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{data.recentChallenges.map((challenge) => (
										<div
											key={challenge.name}
											className="flex items-center justify-between rounded-xl border border-white/5 bg-card/40 p-4 transition-all hover:bg-card/60"
										>
											<div className="flex items-center gap-3">
												<div
													className={`flex h-10 w-10 items-center justify-center rounded-xl ${
														challenge.completed
															? "bg-gradient-to-br from-primary/20 to-secondary/20"
															: "bg-muted/20"
													}`}
												>
													{challenge.completed ? (
														<CheckCircle2 className="h-5 w-5 text-primary" />
													) : (
														<Target className="h-5 w-5 text-muted-foreground" />
													)}
												</div>
												<div>
													<h4 className="text-sm font-medium">{challenge.name}</h4>
													<p className="text-xs text-muted-foreground">{challenge.date}</p>
												</div>
											</div>
											<div className="text-right">
												<div className="text-lg font-bold text-accent">
													+{numberFormatter.format(challenge.points)}
												</div>
												<div className="text-xs text-muted-foreground">GP</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>

					<Card className="glass-card">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Users className="h-5 w-5 text-secondary" />
								Team Overview - {data.teamOverview.name}
							</CardTitle>
							<CardDescription>Your team's performance this season</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
								<div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10 p-4 text-center">
									<p className="mb-1 text-sm text-muted-foreground">Team Rank</p>
									<p className="text-4xl font-bold text-gradient">#{data.teamOverview.rank}</p>
								</div>
								<div className="rounded-xl border border-white/5 bg-card/40 p-4 text-center">
									<p className="mb-1 text-sm text-muted-foreground">Total Points</p>
									<p className="text-2xl font-bold">
										{numberFormatter.format(data.teamOverview.totalPoints)}
									</p>
								</div>
								<div className="rounded-xl border border-white/5 bg-card/40 p-4 text-center">
									<p className="mb-1 text-sm text-muted-foreground">Members</p>
									<p className="text-2xl font-bold">{data.teamOverview.members}</p>
								</div>
								<div className="rounded-xl border border-white/5 bg-card/40 p-4 text-center">
									<p className="mb-1 text-sm text-muted-foreground">Avg GP/Player</p>
									<p className="text-2xl font-bold">
										{numberFormatter.format(data.teamOverview.averageGpPerPlayer)}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
};

export default Profile;
