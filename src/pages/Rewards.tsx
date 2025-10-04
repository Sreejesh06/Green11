import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Sparkles, ShoppingBag, Coffee, Book, Shirt, Bike, Leaf, Star, Filter } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const rewards = [
  { id: 1, name: "Campus Cafe Voucher", cost: 200, icon: Coffee, category: "Food & Drink", stock: 45, description: "₹100 voucher for sustainable cafe items", rarity: "common" },
  { id: 2, name: "Eco-Friendly Water Bottle", cost: 350, icon: Sparkles, category: "Merchandise", stock: 20, description: "Insulated steel bottle with SustainaLeague logo", rarity: "rare" },
  { id: 3, name: "Organic Cotton T-Shirt", cost: 500, icon: Shirt, category: "Merchandise", stock: 15, description: "100% organic cotton tee in multiple colors", rarity: "epic" },
  { id: 4, name: "Sustainability Guide Book", cost: 150, icon: Book, category: "Education", stock: 30, description: "Digital access to premium eco-living guides", rarity: "common" },
  { id: 5, name: "Campus Bike Share Pass", cost: 800, icon: Bike, category: "Transportation", stock: 10, description: "1-month unlimited bike sharing access", rarity: "legendary" },
  { id: 6, name: "Plant Starter Kit", cost: 300, icon: Leaf, category: "Gardening", stock: 25, description: "Seeds, soil, and pot to grow your own herbs", rarity: "rare" },
  { id: 7, name: "Reusable Shopping Bag Set", cost: 180, icon: ShoppingBag, category: "Merchandise", stock: 40, description: "Set of 3 durable mesh produce bags", rarity: "common" },
  { id: 8, name: "Mystery Eco Box", cost: 600, icon: Gift, category: "Special", stock: 8, description: "Curated box of sustainable goodies worth ₹1000+", rarity: "legendary" },
];

const categories = ["All", "Food & Drink", "Merchandise", "Education", "Transportation", "Gardening", "Special"];

export default function Rewards() {
  const userPoints = 1247;
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleRedeem = (reward: typeof rewards[0]) => {
    if (userPoints >= reward.cost) {
      toast.success(`Successfully redeemed ${reward.name}! 🎉`);
    } else {
      toast.error(`You need ${reward.cost - userPoints} more GP to redeem this item.`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2"><span className="text-gradient">Reward Marketplace</span></h1>
          <p className="text-muted-foreground">Redeem your Green Points for awesome rewards! 🎁</p>
        </div>
        <Card className="glass-card w-fit">
          <CardContent className="p-4 text-center">
            <div className="flex items-center gap-2 mb-1"><Star className="h-4 w-4 text-accent" /><p className="text-sm text-muted-foreground">Balance</p></div>
            <p className="text-4xl font-bold text-gradient-accent">{userPoints.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">GP</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <Button key={cat} variant={cat === selectedCategory ? "default" : "outline"} size="sm" className={cat === selectedCategory ? "bg-primary hover:bg-primary/90" : ""} onClick={() => setSelectedCategory(cat)}>{cat}</Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rewards.map((reward) => {
          const Icon = reward.icon;
          const canAfford = userPoints >= reward.cost;
          return (
            <Card key={reward.id} className="glass-card transition-all hover:scale-105 hover:shadow-2xl">
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"><Icon className="w-8 h-8 text-primary" /></div>
                  <Badge variant="outline" className="text-[10px]">{reward.stock} left</Badge>
                </div>
                <CardTitle className="text-lg">{reward.name}</CardTitle>
                <CardDescription className="text-xs">{reward.category}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground min-h-[40px]">{reward.description}</p>
                <div className="flex items-end justify-between pt-2 border-t border-white/5">
                  <div><div className="text-3xl font-bold text-accent">{reward.cost}</div><div className="text-xs text-muted-foreground">GP</div></div>
                  <Button variant={canAfford ? "default" : "outline"} size="sm" disabled={!canAfford} onClick={() => handleRedeem(reward)} className={canAfford ? "bg-primary hover:bg-primary/90" : ""}>{canAfford ? "Redeem" : "Locked"}</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
