import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Lenis from "@studio-freight/lenis";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RetroGrid } from "@/components/ui/retro-grid";
import { ZoomParallax } from "@/components/ui/zoom-parallax";
import DisplayCards from "@/components/ui/display-cards";
import { API_BASE_URL } from "@/lib/api";
import { getLucideIcon } from "@/lib/icon-map";
import logo from "@/assets/green11-logo.png";

type FeatureCard = {
  iconName: string;
  title: string;
  description: string;
  date: string;
  iconClassName?: string;
  titleClassName?: string;
  className?: string;
};

type BenefitItem = {
  iconName: string;
  title: string;
  description: string;
};

type DifferentiatorStat = {
  value: string;
  label: string;
};

type IndexResponse = {
  hero: {
    taglineIcon?: string;
    tagline: string;
    headingPrimary: string;
    headingAccent: string;
    description: string;
    primaryCta?: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
  };
  sustainabilityImages: Array<{ src: string; alt: string }>;
  featureCards: FeatureCard[];
  benefits: {
    students: BenefitItem[];
    campus: BenefitItem[];
  };
  differentiators: {
    headline: string;
    description: string;
    stats: DifferentiatorStat[];
  };
  cta: {
    heading: string;
    description: string;
    primaryCta?: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
    disclaimer?: string;
  };
};

const Index = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<IndexResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const lenis = new Lenis();
    
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadIndexContent() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/index`);
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const payload: IndexResponse = await response.json();
        if (isMounted) {
          setData(payload);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load landing content");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadIndexContent();

    return () => {
      isMounted = false;
    };
  }, []);

  const hero = data?.hero;
  const sustainabilityImages = data?.sustainabilityImages ?? [];
  const displayCards = useMemo(() => {
    if (!data?.featureCards) {
      return undefined;
    }

    return data.featureCards.map((card) => {
      const Icon = getLucideIcon(card.iconName);
      return {
        ...card,
        icon: <Icon className={`size-4 ${card.iconClassName ?? "text-primary"}`} />
      };
    });
  }, [data?.featureCards]);

  const studentBenefits = data?.benefits.students ?? [];
  const campusBenefits = data?.benefits.campus ?? [];
  const differentiators = data?.differentiators;
  const cta = data?.cta;

  const TaglineIcon = hero?.taglineIcon ? getLucideIcon(hero.taglineIcon) : getLucideIcon("Leaf");

  const handlePrimaryCta = () => {
    const href = hero?.primaryCta?.href ?? "/dashboard";
    navigate(href);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with RetroGrid */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-background px-4">
        <RetroGrid className="opacity-40" />
        
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-8 flex justify-center">
            <img 
              src={logo} 
              alt="SustainaLeague Logo" 
              className="h-32 w-auto animate-in fade-in-0 zoom-in-95 duration-700"
            />
          </div>
          
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 backdrop-blur-sm">
            <TaglineIcon className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{hero?.tagline ?? "Sustainability Gamified"}</span>
          </div>
          
          <h1 className="mb-6 bg-gradient-to-b from-foreground via-foreground to-muted-foreground bg-clip-text text-5xl font-bold leading-tight tracking-tighter text-transparent md:text-6xl lg:text-7xl">
            {hero?.headingPrimary ?? "GET GREEN NOW,"}
            <br />
            <span className="text-primary">{hero?.headingAccent ?? "INSTANT IMPACT"}</span>
          </h1>
          
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
            {hero?.description ?? "Turn eco-friendly actions into bragging rights. Compete for your hostel, earn real rewards through our revolutionary platform."}
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handlePrimaryCta}>
              {hero?.primaryCta?.label ?? "Join the League"} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline">
              {hero?.secondaryCta?.label ?? "Watch Demo"}
            </Button>
          </div>
        </div>
      </section>

      {isLoading && (
        <div className="mx-auto mt-8 max-w-3xl rounded-lg border border-white/10 bg-card/40 px-6 py-4 text-center text-sm text-muted-foreground">
          Fetching the latest landing content...
        </div>
      )}

      {error && (
        <div className="mx-auto mt-6 max-w-3xl rounded-lg border border-destructive/30 bg-destructive/10 px-6 py-4 text-center text-sm text-destructive">
          Could not load landing data: {error}
        </div>
      )}

      {/* Zoom Parallax Section */}
      <ZoomParallax images={sustainabilityImages} />

      {/* Features Showcase Section */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Your Sustainability Journey
            </h2>
            <p className="text-lg text-muted-foreground">
              Discover how easy it is to make an impact
            </p>
          </div>
          
          <div className="flex min-h-[400px] w-full items-center justify-center">
            <DisplayCards cards={displayCards} />
          </div>
        </div>
      </section>

      {/* Platform Benefits Section */}
      <section className="bg-muted/30 px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Platform Benefits
            </h2>
            <p className="text-lg text-muted-foreground">
              Built for Everyone
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2">
            {[{ title: "For Students", items: studentBenefits }, { title: "For Campus", items: campusBenefits }].map((section) => (
              <div key={section.title} className="rounded-2xl border border-border bg-card p-8">
                <h3 className="mb-6 text-2xl font-bold text-card-foreground">{section.title}</h3>
                <div className="space-y-4">
                  {section.items.map((benefit) => {
                    const Icon = getLucideIcon(benefit.iconName);
                    return (
                      <div key={benefit.title} className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-card-foreground">{benefit.title}</h4>
                          <p className="text-sm text-muted-foreground">{benefit.description}</p>
                        </div>
                      </div>
                    );
                  })}
                  {!section.items.length && (
                    <p className="text-sm text-muted-foreground">Additional benefits coming soon.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {differentiators?.headline ?? "What Makes Us Different?"}
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
              {differentiators?.description ??
                "We Turn Sustainability Into a Competitive Sport. Other initiatives just talk about awareness. SustainaLeague uses verifiable proof, real-time leaderboards, and tangible rewards to make sustainability exciting and impactful."}
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-4">
            {(differentiators?.stats ?? []).map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mb-2 text-5xl font-bold text-primary">{stat.value}</div>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
            {!differentiators?.stats?.length && (
              <p className="col-span-full text-center text-sm text-muted-foreground">
                Impact stats will appear once administrators publish them.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden px-4 py-24">
        <RetroGrid className="opacity-30" angle={45} />
        
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            {cta?.heading ?? "Ready to Make an Impact?"}
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            {cta?.description ??
              "Join thousands of students turning sustainable actions into campus glory and real rewards."}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handlePrimaryCta}>
              {cta?.primaryCta?.label ?? "Start Your Journey"} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline">
              {cta?.secondaryCta?.label ?? "View Demo"}
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            {cta?.disclaimer ?? "No credit card required • Free to join • Start earning GP today"}
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;
