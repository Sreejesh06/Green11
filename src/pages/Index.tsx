import { Button } from "@/components/ui/button";
import { RetroGrid } from "@/components/ui/retro-grid";
import { ZoomParallax } from "@/components/ui/zoom-parallax";
import DisplayCards from "@/components/ui/display-cards";
import { ArrowRight, Zap, Trophy, Users, Sparkles, Leaf, Recycle, Award, TrendingUp, Target, Gift, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Lenis from '@studio-freight/lenis';
import logo from "@/assets/green11-logo.png";

const Index = () => {
  const navigate = useNavigate();

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

  const sustainabilityImages = [
    {
      src: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1280&h=720&fit=crop&crop=entropy&auto=format&q=80',
      alt: 'Renewable energy and sustainability',
    },
    {
      src: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1280&h=720&fit=crop&crop=entropy&auto=format&q=80',
      alt: 'Recycling and waste management',
    },
    {
      src: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=800&fit=crop&crop=entropy&auto=format&q=80',
      alt: 'Green campus and nature',
    },
    {
      src: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1280&h=720&fit=crop&crop=entropy&auto=format&q=80',
      alt: 'Eco-friendly lifestyle',
    },
    {
      src: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=800&fit=crop&crop=entropy&auto=format&q=80',
      alt: 'Environmental conservation',
    },
    {
      src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1280&h=720&fit=crop&crop=entropy&auto=format&q=80',
      alt: 'Green forest and ecosystem',
    },
    {
      src: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1280&h=720&fit=crop&crop=entropy&auto=format&q=80',
      alt: 'Sustainable living',
    },
  ];

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
            <Leaf className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Sustainability Gamified</span>
          </div>
          
          <h1 className="mb-6 bg-gradient-to-b from-foreground via-foreground to-muted-foreground bg-clip-text text-5xl font-bold leading-tight tracking-tighter text-transparent md:text-6xl lg:text-7xl">
            GET GREEN NOW,
            <br />
            <span className="text-primary">INSTANT IMPACT</span>
          </h1>
          
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Turn eco-friendly actions into bragging rights. Compete for your hostel, earn real rewards through our revolutionary platform.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => navigate('/dashboard')}>
              Join the League <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

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
            <DisplayCards
              cards={[
                {
                  icon: <Target className="size-4 text-emerald-300" />,
                  title: "Daily Challenges",
                  description: "Complete eco-tasks & earn GP",
                  date: "Updated daily",
                  iconClassName: "text-emerald-500",
                  titleClassName: "text-emerald-500",
                  className:
                    "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
                },
                {
                  icon: <Trophy className="size-4 text-amber-300" />,
                  title: "Leaderboard",
                  description: "Compete with your hostel",
                  date: "Live rankings",
                  iconClassName: "text-amber-500",
                  titleClassName: "text-amber-500",
                  className:
                    "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
                },
                {
                  icon: <Gift className="size-4 text-purple-300" />,
                  title: "Rewards Store",
                  description: "Redeem exclusive prizes",
                  date: "New items weekly",
                  iconClassName: "text-purple-500",
                  titleClassName: "text-purple-500",
                  className:
                    "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
                },
              ]}
            />
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
            <div className="rounded-2xl border border-border bg-card p-8">
              <h3 className="mb-6 text-2xl font-bold text-card-foreground">For Students</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">Earn Green Points (GP)</h4>
                    <p className="text-sm text-muted-foreground">Convert actions into currency</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">Win Prizes</h4>
                    <p className="text-sm text-muted-foreground">Compete in tournaments for real rewards</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">Represent Your Team</h4>
                    <p className="text-sm text-muted-foreground">Build hostel/department pride</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8">
              <h3 className="mb-6 text-2xl font-bold text-card-foreground">For Campus</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">Track Impact</h4>
                    <p className="text-sm text-muted-foreground">Get real data on campus sustainability</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">Boost Engagement</h4>
                    <p className="text-sm text-muted-foreground">Foster a campus-wide green culture</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Recycle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">Promote Change</h4>
                    <p className="text-sm text-muted-foreground">Encourage measurable eco-friendly habits</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              What Makes Us Different?
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
              We Turn Sustainability Into a Competitive Sport. Other initiatives just talk about awareness. SustainaLeague uses verifiable proof, real-time leaderboards, and tangible rewards to make sustainability exciting and impactful.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold text-primary">10K+</div>
              <p className="text-muted-foreground">Green Points Earned</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold text-primary">500+</div>
              <p className="text-muted-foreground">Active Students</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold text-primary">50+</div>
              <p className="text-muted-foreground">Rewards Redeemed</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold text-primary">20+</div>
              <p className="text-muted-foreground">Campus Partners</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden px-4 py-24">
        <RetroGrid className="opacity-30" angle={45} />
        
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Ready to Make an Impact?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join thousands of students turning sustainable actions into campus glory and real rewards.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => navigate('/dashboard')}>
              Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
              View Demo
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required • Free to join • Start earning GP today
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;
