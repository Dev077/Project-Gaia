"use client";

import { useEffect, useState, useRef } from "react";
import MobileLayout from "@/components/MobileLayout";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, PlusCircle, MinusCircle, Recycle } from "lucide-react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function MirrorPage() {
  const [totalCarbonEmitted, setTotalCarbonEmitted] = useState(156);
  const [weeklyXp, setWeeklyXp] = useState(650);
  const [carbonSaved, setCarbonSaved] = useState(278);
  const [plasticSaved, setPlasticSaved] = useState(5.2);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Load saved carbon emissions on component mount
  useEffect(() => {
    const savedEmissions = localStorage.getItem('totalCarbonEmitted');
    if (savedEmissions) {
      try {
        const emissionsValue = parseFloat(savedEmissions);
        setTotalCarbonEmitted(emissionsValue);
      } catch (err) {
        console.error('Error parsing saved emissions:', err);
      }
    }

    // Load saved plastic weight
    const savedPlastic = localStorage.getItem('plasticSaved');
    if (savedPlastic) {
      try {
        const plasticValue = parseFloat(savedPlastic);
        setPlasticSaved(plasticValue);
      } catch (err) {
        console.error('Error parsing saved plastic:', err);
      }
    }
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
              <span className="text-destructive ml-auto">{totalCarbonEmitted} kg</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={32} className="h-3 bg-destructive/10 [&>div]:bg-destructive" />
            <p className="text-xs text-muted-foreground mt-2">
              Reduced emissions by 8% compared to last month
            </p>
          </CardContent>
        </Card>

        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Recycle className="h-4 w-4 mr-2 text-primary" />
              <span className="mr-2">Plastic Saved</span>
              <span className="text-primary ml-auto">{plasticSaved} kg</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={52} className="h-3 bg-primary/10" />
            <p className="text-xs text-muted-foreground mt-2">
              <PlusCircle className="h-3 w-3 inline mr-1 text-primary" />
              0.8 kg saved this week through reusable containers
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