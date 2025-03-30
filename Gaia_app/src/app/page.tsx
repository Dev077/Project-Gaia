import MobileLayout from "@/components/MobileLayout";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, PlusCircle, MinusCircle } from "lucide-react";

export default function MirrorPage() {
  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        <div className="flex flex-col items-center justify-center py-6">
          <Avatar className="h-32 w-32 border-4 border-primary shadow-lg mb-4">
            <AvatarImage src="/avatar-dog.jpg" alt="Avatar" />
            <AvatarFallback className="bg-primary/20 text-primary text-3xl">
              EC
            </AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold text-center">EcoUser</h1>
          <p className="text-muted-foreground text-center">Level 7 Eco Warrior</p>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <span className="mr-2">Weekly XP Target</span>
              <span className="text-primary ml-auto">65%</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={65} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              650/1000 XP this week - keep up the good work!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Leaf className="h-4 w-4 mr-2 text-primary" />
              <span className="mr-2">Carbon Saved</span>
              <span className="text-primary ml-auto">278 kg</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={62} className="h-3 bg-primary/10" />
            <p className="text-xs text-muted-foreground mt-2">
              <PlusCircle className="h-3 w-3 inline mr-1 text-primary" />
              12.5 kg saved this week through green commuting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <MinusCircle className="h-4 w-4 mr-2 text-destructive" />
              <span className="mr-2">Carbon Emitted</span>
              <span className="text-destructive ml-auto">156 kg</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={32} className="h-3 bg-destructive/10 [&>div]:bg-destructive" />
            <p className="text-xs text-muted-foreground mt-2">
              Reduced emissions by 8% compared to last month
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Experience</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl font-bold text-primary">1,250 XP</div>
              <p className="text-xs text-muted-foreground">
                250 XP to next level
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Streak</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl font-bold text-primary">7 days</div>
              <p className="text-xs text-muted-foreground">
                Keep it going!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
}