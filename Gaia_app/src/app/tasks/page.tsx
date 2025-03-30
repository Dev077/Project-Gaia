"use client";

import { useState, useEffect } from "react";
import MobileLayout from "@/components/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import api from "@/lib/api";

// Task interface
interface Task {
  _id: string;
  title: string;
  description: string;
  xp: number;
  completed: boolean;
  carbonSaved: number;
  plasticSaved: number;
  completedAt: string | null;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tasks on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.getTasks();
        setTasks(response.data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Calculate completion percentage
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionPercentage = (tasks.length > 0) 
    ? (completedTasks / tasks.length) * 100 
    : 0;

  // Toggle task completion
  const toggleTask = async (id: string) => {
    try {
      const task = tasks.find(t => t._id === id);
      if (!task) return;

      // Send request to update task
      const response = await api.updateTask(id, { completed: !task.completed });
      
      // Update local state with the updated task
      setTasks(tasks.map(task => 
        task._id === id ? response.data.task : task
      ));

      // Check if all tasks are completed to update streak
      if (!task.completed && completedTasks + 1 === tasks.length) {
        try {
          await api.updateStreak();
        } catch (err) {
          console.error('Error updating streak:', err);
        }
      }
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  if (loading) {
    return (
      <MobileLayout>
        <div className="p-4 flex justify-center items-center h-full">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </MobileLayout>
    );
  }

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
            <Card key={task._id} className={task.completed ? "border-primary/50 bg-primary/5" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id={`task-${task._id}`}
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task._id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`task-${task._id}`}
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
