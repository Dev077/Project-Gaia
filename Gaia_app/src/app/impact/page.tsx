"use client";

import { useEffect, useRef, useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
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
        
        // Position model in the center of the screen
        model.position.set(-5.5, 0.5, 0);
        
        // Scale appropriately
        model.scale.set(1.2, 1.2, 1.2);
        
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
        {/* Full screen canvas with centered animation */}
        <canvas ref={canvasRef} className="absolute inset-0" />
        
        {/* Loading indicator */}
        {loading && <GlobeLoading />}
        
        {/* Top Left - Atmospheric CO2 */}
        {!loading && (
          <div className="absolute top-12 left-4 pointer-events-none">
            <div className="bg-[#0D1B2A]/80 backdrop-blur-sm p-3 rounded-lg shadow-lg">
              <div className="text-gray-300">Atmospheric CO₂</div>
              <div className="text-2xl font-bold text-amber-500">420 ppm</div>
            </div>
          </div>
        )}
        
        {/* Top Right - Deforestation Rate */}
        {!loading && (
          <div className="absolute top-12 right-4 pointer-events-none">
            <div className="bg-[#0D1B2A]/80 backdrop-blur-sm p-3 rounded-lg shadow-lg">
              <div className="text-gray-300">Deforestation Rate</div>
              <div className="text-2xl font-bold text-red-500">100,000</div>
              <div className="text-sm text-gray-400">km² per year</div>
            </div>
          </div>
        )}
        
        {/* Bottom Left - Biodiversity Loss */}
        {!loading && (
          <div className="absolute bottom-24 left-4 pointer-events-none">
            <div className="bg-[#0D1B2A]/80 backdrop-blur-sm p-3 rounded-lg shadow-lg">
              <div className="text-gray-300">Biodiversity Loss</div>
              <div className="text-2xl font-bold text-red-500">42,000</div>
              <div className="text-sm text-gray-400">threatened species</div>
            </div>
          </div>
        )}
        
        {/* Bottom Right - Future Generations */}
        {!loading && (
          <div className="absolute bottom-24 right-4 pointer-events-none">
            <div className="bg-[#0D1B2A]/80 backdrop-blur-sm p-3 rounded-lg shadow-lg">
              <div className="text-gray-300">Future Generations</div>
              <div className="text-2xl font-bold text-amber-500">~4</div>
              <div className="text-sm text-gray-400">at current trajectory</div>
            </div>
          </div>
        )}
        
        {/* Title overlay */}
        <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
          <h2 className="text-lg font-semibold text-white bg-black/30 inline-block px-4 py-2 rounded-full backdrop-blur-sm">
            Global Health
          </h2>
        </div>
      </div>
    </MobileLayout>
  );
}