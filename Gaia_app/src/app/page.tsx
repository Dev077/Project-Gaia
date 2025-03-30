import MobileLayout from "@/components/MobileLayout";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AvatarPage() {
  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        <div className="flex flex-col items-center justify-center py-6">
          <Avatar className="h-32 w-32 border-4 border-primary shadow-lg mb-4">
            <AvatarImage src="/avatar-dog.jpg" alt="Avatar" />
            <AvatarFallback className="bg-primary/20 text-primary text-3xl">
              AV
            </AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold text-center">Buddy</h1>
          <p className="text-muted-foreground text-center">Level 7 Companion</p>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <span className="mr-2">Health</span>
              <span className="text-primary ml-auto">85%</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={85} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              Daily walk completed - health improved!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <span className="mr-2">Energy</span>
              <span className="text-primary ml-auto">62%</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={62} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              Energy decreasing - time for a break!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <span className="mr-2">Happiness</span>
              <span className="text-primary ml-auto">92%</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={92} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              Play session boosted happiness!
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
