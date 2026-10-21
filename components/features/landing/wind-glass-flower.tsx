"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as THREE from "three";

export function WindGlassFlower() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 600;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 3. Flower Group
    const flowerGroup = new THREE.Group();

    // Glass Material with physical transmission and refractive brilliance
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#e0f7ff"),
      emissive: new THREE.Color("#00f5d4"),
      emissiveIntensity: 0.18,
      roughness: 0.08,
      metalness: 0.02,
      transmission: 0.92,
      thickness: 1.4,
      ior: 1.52,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      specularIntensity: 1.2,
      specularColor: new THREE.Color("#ffffff"),
      transparent: true,
      opacity: 0.95,
    });

    // 8 Petals arranged radially
    const petalCount = 8;
    const petalRadius = 1.55;
    const petalTube = 0.28;

    for (let i = 0; i < petalCount; i++) {
      const angle = (i * Math.PI * 2) / petalCount;
      const petalGeo = new THREE.TorusGeometry(petalRadius * 0.6, petalTube, 24, 48, Math.PI * 1.5);
      const petalMesh = new THREE.Mesh(petalGeo, glassMaterial);

      petalMesh.rotation.z = angle;
      petalMesh.position.x = Math.cos(angle) * 1.05;
      petalMesh.position.y = Math.sin(angle) * 1.05;
      petalMesh.scale.set(0.9, 1.4, 0.9);

      flowerGroup.add(petalMesh);
    }

    // Center Core Sphere (glowing luminous nucleus)
    const coreGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#38bdf8"),
      emissive: new THREE.Color("#00f5d4"),
      emissiveIntensity: 0.55,
      roughness: 0.1,
      transmission: 0.85,
      thickness: 1.2,
      ior: 1.45,
      transparent: true,
      opacity: 0.9,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    flowerGroup.add(coreMesh);

    scene.add(flowerGroup);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    sunLight.position.set(5, 6, 8);
    scene.add(sunLight);

    const cyanRimLight = new THREE.DirectionalLight(0x00f5d4, 2.2);
    cyanRimLight.position.set(-6, -4, 4);
    scene.add(cyanRimLight);

    const centerPointLight = new THREE.PointLight(0x38bdf8, 3.5, 8);
    centerPointLight.position.set(0, 0, 1.5);
    scene.add(centerPointLight);

    setIsLoaded(true);

    // 5. Mouse Interaction & Spring Lerp
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      mouseX = x;
      mouseY = y;
      targetRotY = mouseX * 0.45;
      targetRotX = -mouseY * 0.35;
    };

    window.addEventListener("pointermove", handlePointerMove);

    // 6. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth lerp rotation toward cursor
      flowerGroup.rotation.y += (targetRotY - flowerGroup.rotation.y) * 0.05;
      flowerGroup.rotation.x += (targetRotX - flowerGroup.rotation.x) * 0.05;

      // Gentle continuous ambient breathing float & spin
      flowerGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.12;
      flowerGroup.position.z = Math.cos(elapsedTime * 0.8) * 0.08;
      flowerGroup.rotation.z = Math.sin(elapsedTime * 0.4) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    // 7. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);

      // Clean disposal
      renderer.dispose();
      glassMaterial.dispose();
      coreMat.dispose();
      flowerGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
        }
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative flex items-center justify-center size-[380px] sm:size-[520px] md:size-[640px] pointer-events-none select-none">
      {/* Real-time WebGL 3D Flower Canvas */}
      <div
        ref={mountRef}
        className={`absolute inset-0 size-full transition-opacity duration-700 pointer-events-auto ${
          isLoaded && webglSupported ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* High-Resolution Translucent Cutout Fallback / Backdrop Glow */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${
          isLoaded && webglSupported
            ? "opacity-40 blur-xl scale-95"
            : "opacity-100 blur-none scale-100"
        }`}
      >
        <Image
          src="/images/glass-flower.png"
          alt="Translucent 3D Glass Flower Star"
          width={580}
          height={580}
          priority
          className="size-4/5 object-contain drop-shadow-[0_0_50px_rgba(0,245,212,0.45)] animate-pulse"
        />
      </div>

      {/* Volumetric Radial Aura Glow behind the center */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-72 sm:size-96 rounded-full bg-cyan-400/35 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-48 sm:size-64 rounded-full bg-white/40 blur-2xl" />
    </div>
  );
}
