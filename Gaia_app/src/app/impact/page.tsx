"use client";

import Image from "next/image";
import MobileLayout from "@/components/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function ImpactPage() {
  // Impact metrics (would normally be fetched from API/backend)
  const impactMetrics = [
    {
      id: 1,
      title: "Activity Score",
      value: 78,
      maxValue: 100,
      description: "Based on daily movement and exercise",
      color: "bg-primary",
    },
    {
      id: 2,
      title: "Social Skills",
      value: 65,
      maxValue: 100,
      description: "Interactions with other pets and people",
      color: "bg-blue-500",
    },
    {
      id: 3,
      title: "Training Progress",
      value: 42,
      maxValue: 100,
      description: "Command learning and retention",
      color: "bg-purple-500",
    },
    {
      id: 4,
      title: "Wellness Score",
      value: 91,
      maxValue: 100,
      description: "Overall health and wellbeing",
      color: "bg-green-500",
    },
  ];

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold">Impact Dashboard</h1>
          <p className="text-muted-foreground">Track your progress and impact</p>
        </div>

        <div className="relative w-full h-56 rounded-lg overflow-hidden shadow-lg mb-6">
          <Image
            src="/walk-map.jpg"
            alt="Walk Map"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 z-10" />
          <div className="absolute bottom-4 left-4 right-4 z-20">
            <h2 className="text-white text-lg font-bold">Today's Walk</h2>
            <p className="text-white/80 text-sm">2.21 km - 15:12 min</p>
          </div>
        </div>

        <div className="space-y-4">
          {impactMetrics.map(metric => (
            <Card key={metric.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <span>{metric.title}</span>
                  <span className="ml-auto text-primary">{metric.value}%</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={metric.value} className={`h-3 ${metric.color}`} />
                <p className="text-xs text-muted-foreground mt-2">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 text-center">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="text-sm text-muted-foreground">{day}</div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mt-1 ${
                    index < 5 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {index < 5 ? "✓" : ""}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              5 active days this week - Keep it up!
            </p>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
