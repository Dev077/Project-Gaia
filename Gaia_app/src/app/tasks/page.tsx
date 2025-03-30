"use client";

import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

export default function TasksPage() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Use Resuable Products",
      description: "Use reusable bags, containers, and water bottles",
      completed: false,
      xp: 30, // saves ~50g plastic/day
    },
    {
      id: 2,
      title: "Compost Organic Waste",
      description: "Compost food scraps to reduce landfill waste",
      completed: false,
      xp: 35, // saves ~.4kg CO2e/day 
    },
    {
      id: 3,
      title: "Save Energy at Home",
      description: "Turn off electric based devices when not in use or not needed",
      completed: false,
      xp: 40, // saves ~0.3kg
    },
    {
      id: 4,
      title: "Commute sustainably",
      description: "Walk, bike, or use public transport instead of driving alone",
      completed: false,
      xp: 45, // saves ~8.8 kg CO2e/day
    },
    {
      id: 5,
      title: "Eat plant-based meals",
      description: "Have meals without meat or with less meat",
      completed: false,
      xp: 50, // saves ~6kg CO2e/day
    },
  ]);

  // Calculate completion percentage
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionPercentage = (completedTasks / tasks.length) * 100;

  // Toggle task completion
  const toggleTask = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold">Daily Tasks</h1>
          <p className="text-muted-foreground">Complete tasks to earn XP</p>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <span>Progress</span>
              <span className="text-primary ml-auto">{completedTasks}/{tasks.length}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={completionPercentage} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {completionPercentage === 100
                ? "All tasks completed! Great job!"
                : `${completedTasks} of ${tasks.length} tasks completed`}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {tasks.map(task => (
            <Card key={task.id} className={task.completed ? "border-primary/50 bg-primary/5" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`task-${task.id}`}
                      className={`text-base font-medium block ${task.completed ? "line-through text-muted-foreground" : ""}`}
                    >
                      {task.title}
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                  </div>
                  <div className="text-sm font-medium text-primary">
                    +{task.xp} XP
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
