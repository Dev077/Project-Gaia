"use client";

import { useEffect, useRef, useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
//import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"; //for orbit controls
import GlobeLoading from "@/components/GlobeLoading";

export default function ImpactPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create scene and set a dark background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Pure black background

    // Set up camera
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 10); // Position directly in front
    camera.lookAt(0, 0, 0); // Look at center

    // Set up renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    
    // Enable shadow mapping
    renderer.shadowMap.enabled = true;

    // Add ambient light (brighter)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Add directional light (from front)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 0, 10);
    scene.add(directionalLight);

    // Set up texture path
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setPath('/earth-cartoon/textures/');

    // Load GLB model
    const loader = new GLTFLoader();
    // Optional: Set the path for external resources
    loader.setPath('/earth-cartoon/');
    
    loader.load(
      'source/earth-cartoon.glb',
      (gltf) => {
        // Auto-rotate the model
        const model = gltf.scene;
        
        // Specifically position the model in the center of the screen
        model.position.set(0, 0, 0);
        
        // Scale appropriately
        model.scale.set(1.4, 1.4, 1.5);
        
        // Important: Manually shift the model to center it
        // Moving it slightly to the left and down
        model.translateX(-5.5);
        
        // Traverse to ensure materials/textures are properly applied
        model.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            // Ensure materials render correctly
            node.material.needsUpdate = true;
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
        
        scene.add(model);
          
        // Model loaded successfully
        setLoading(false);
      },
      (xhr) => {
        // Loading progress
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        // Error handling
        console.error("An error occurred loading the GLB model:", error);
      }
    );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate the model (not the entire scene)
      if (scene.children.length > 2) { // Check if model is loaded
        const model = scene.children[2]; // The model (after lights)
        if (model) {
          model.rotation.y += 0.005;
        }
      }
      
      // Render
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current) return;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      
      // Ensure the model stays properly in view on resize
      if (scene.children.length > 2) { // Check if model is loaded (scene has lights + model)
        const model = scene.children[2]; // The model (after lights)
        if (model) {
          // Adjust camera or model position if needed for different screen sizes
          if (width < 768) { // Mobile view
            camera.position.z = 12; // Move camera back on small screens
          } else {
            camera.position.z = 10;
          }
          camera.lookAt(0, 0, 0);
        }
      }
    };
    
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (canvasRef.current) {
        renderer.dispose();
      }
    };
  }, []);

  return (
    <MobileLayout>
      <div className="relative h-full w-full">
        <canvas ref={canvasRef} className="absolute inset-0" />
        
        {/* Title overlay */}
        <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
          <h2 className="text-lg font-semibold text-white bg-black/30 inline-block px-4 py-2 rounded-full backdrop-blur-sm">
            Global Environmental Impact
          </h2>
        </div>
        
        {/* Loading indicator */}
        {loading && <GlobeLoading />}
        
        {/* Stats panels - only show when model is loaded */}
        {!loading && (
          <div className="absolute inset-x-0 top-4 px-4 pointer-events-none">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card/80 backdrop-blur-sm p-3 rounded-lg shadow-lg">
                <div className="text-xs text-muted-foreground mb-1">Global CO₂ Reduction</div>
                <div className="text-lg font-bold text-primary">126.4M tons</div>
              </div>
              
              <div className="bg-card/80 backdrop-blur-sm p-3 rounded-lg shadow-lg">
                <div className="text-xs text-muted-foreground mb-1">Active Users</div>
                <div className="text-lg font-bold text-primary">1.2M+</div>
              </div>
            </div>
          </div>
        )}
        

      </div>
    </MobileLayout>
  );
}