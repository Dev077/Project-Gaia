"use client";

import { useEffect, useState, useRef } from "react";
import MobileLayout from "@/components/MobileLayout";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, PlusCircle, MinusCircle, Recycle } from "lucide-react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import api from "@/lib/api";

// User stats interface
interface UserStats {
  _id: string;
  username: string;
  level: number;
  experience: number;
  weeklyXP: number;
  weeklyXPTarget: number;
  weeklyXPPercentage: number;
  carbonSaved: number;
  carbonEmitted: number;
  plasticSaved: number;
  streak: number;
  nextLevelXP: number;
  xpToNextLevel: number;
}

export default function MirrorPage() {
  // User stats state
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const MONTHLY_CARBON_TARGET = 20; 
  const MONTHLY_PLASTIC_TARGET = 1;
  
  // Fetch user stats from backend
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await api.getUserStats();
        setUserStats(response.data);
        
        // Store the stats in localStorage for offline access
        localStorage.setItem('totalCarbonEmitted', response.data.carbonEmitted.toString());
        localStorage.setItem('plasticSaved', response.data.plasticSaved.toString());
      } catch (err) {
        console.error('Error fetching user stats:', err);
        
        // Fallback to localStorage if API fails
        const savedEmissions = localStorage.getItem('totalCarbonEmitted');
        const savedPlastic = localStorage.getItem('plasticSaved');
        
        if (savedEmissions && savedPlastic) {
          setUserStats(prev => ({
            ...prev,
            carbonEmitted: parseFloat(savedEmissions),
            plasticSaved: parseFloat(savedPlastic)
          } as UserStats));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  // 3D model setup and animation
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Pure black background

    // Set up camera
    const camera = new THREE.PerspectiveCamera(
      50,
      1, 
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 5, 5);
    scene.add(directionalLight);

    // Animation mixer for natural animations
    let mixer: THREE.AnimationMixer;
    let clock = new THREE.Clock();

    // Load Drakosha model
    const loader = new GLTFLoader();
    loader.load(
      "/drakosha_2/scene.gltf",
      (gltf) => {
        const model = gltf.scene;
        
        // Center and scale the model
        model.position.set(0, -3.0, 0); // Slightly lower to show more of the model
        model.scale.set(3.25, 3.25, 3.25);
        
        // Ensure materials are correctly applied
        model.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.material.needsUpdate = true;
          }
        });
        
        scene.add(model);
        
        // Set up animation if available
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          const animation = gltf.animations[0]; // Use the first animation
          const action = mixer.clipAction(animation);
          action.play();
        }
        
        setLoading(false);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.error('Error loading GLTF model:', error);
        setLoading(false);
      }
    );

    // Update canvas size based on its container
    const updateSize = () => {
      if (!canvasRef.current) return;
      
      const container = canvasRef.current.parentElement;
      if (!container) return;
      
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      // Update camera aspect ratio
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      // Update renderer size
      renderer.setSize(width, height);
    };
    
    // Initial size setup
    setTimeout(updateSize, 0);
    
    // Handle window resize
    window.addEventListener('resize', updateSize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Update animation mixer if it exists
      if (mixer) {
        const delta = clock.getDelta();
        mixer.update(delta);
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateSize);
      renderer.dispose();
    };
  }, []);

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        <div className="flex flex-col items-center justify-center py-6">
          {/* 3D model container with circular border */}
          <div className="relative h-32 w-32 rounded-full border-4 border-primary shadow-lg mb-4 overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0" />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-center">EcoUser</h1>
          <p className="text-muted-foreground text-center">
            Level {userStats?.level || 0} Eco Warrior
          </p>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <span className="mr-2">Weekly XP Target</span>
              <span className="text-primary ml-auto">{userStats?.weeklyXPPercentage || 0}%</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={userStats?.weeklyXPPercentage || 0} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {userStats?.weeklyXP || 0}/{userStats?.weeklyXPTarget || 1000} XP this week - keep up the good work!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Leaf className="h-4 w-4 mr-2 text-primary" />
              <span className="mr-2">Carbon Avoidance</span>
              <span className="text-primary ml-auto">{userStats?.carbonSaved || 0} kg</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
          <Progress 
            value={Math.min(((userStats?.carbonSaved || 0) / MONTHLY_CARBON_TARGET) * 100, 100)} 
            className="h-3 bg-primary/10" 
          />
            <p className="text-xs text-muted-foreground mt-2">
              <PlusCircle className="h-3 w-3 inline mr-1 text-primary" />
              12.5 kg emission reduction this month through green commuting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Recycle className="h-4 w-4 mr-2 text-primary" />
              <span className="mr-2">Material efficiency</span>
              <span className="text-primary ml-auto">{userStats?.plasticSaved || 0} kg</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
          <Progress 
            value={Math.min(((userStats?.plasticSaved || 0) / MONTHLY_PLASTIC_TARGET) * 100, 100)} 
            className="h-3 bg-primary/10" 
          />
            <p className="text-xs text-muted-foreground mt-2">
              <PlusCircle className="h-3 w-3 inline mr-1 text-primary" />
              0.8 kg of plasticavoided last Month through reusable containers
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Experience</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl font-bold text-primary">{userStats?.experience || 0} XP</div>
              <p className="text-xs text-muted-foreground">
                {userStats?.xpToNextLevel || 0} XP to next level
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Streak</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl font-bold text-primary">{userStats?.streak || 0} days</div>
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