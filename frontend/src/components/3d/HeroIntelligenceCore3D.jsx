import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function HeroIntelligenceCore3D() {
  const containerRef = useRef(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setIsSupported(false);
        return;
      }
    } catch {
      setIsSupported(false);
      return;
    }

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Dimensions
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 600;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 8.5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Root master group for rotation and mouse tilt
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // 1. Central Core: Inner Icosahedron with glass/metallic aesthetic
    const coreGeometry = new THREE.IcosahedronGeometry(1.6, 1);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f274a,
      roughness: 0.2,
      metalness: 0.85,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
      flatShading: true,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    masterGroup.add(coreMesh);

    // 2. Core Wireframe Glow Cage
    const wireGeometry = new THREE.IcosahedronGeometry(1.68, 1);
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const wireMesh = new THREE.Mesh(wireGeometry, wireMaterial);
    masterGroup.add(wireMesh);

    // 3. Nested Geometric Cage (Dodecahedron)
    const cageGeometry = new THREE.DodecahedronGeometry(2.3, 0);
    const cageMaterial = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const cageMesh = new THREE.Mesh(cageGeometry, cageMaterial);
    masterGroup.add(cageMesh);

    // 4. Orbiting Data Rings
    const ringGroup = new THREE.Group();
    masterGroup.add(ringGroup);

    const ringDefs = [
      { radius: 2.9, tube: 0.015, color: 0x38bdf8, opacity: 0.6, rot: [0.8, 0.4, 0] },
      { radius: 3.4, tube: 0.012, color: 0x818cf8, opacity: 0.5, rot: [-0.6, 0.9, 0.4] },
      { radius: 3.9, tube: 0.015, color: 0x06b6d4, opacity: 0.45, rot: [0.3, -0.7, 0.8] },
    ];

    const rings = ringDefs.map((def) => {
      const geo = new THREE.TorusGeometry(def.radius, def.tube, 16, 120);
      const mat = new THREE.MeshBasicMaterial({
        color: def.color,
        transparent: true,
        opacity: def.opacity,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.set(...def.rot);
      ringGroup.add(mesh);
      return { mesh, radius: def.radius, rot: def.rot };
    });

    // 5. Orbiting Glowing Data Nodes
    const nodeGeometry = new THREE.SphereGeometry(0.09, 16, 16);
    const nodeMaterials = [
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 }),
      new THREE.MeshBasicMaterial({ color: 0x34d399 }),
      new THREE.MeshBasicMaterial({ color: 0xa78bfa }),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 }),
      new THREE.MeshBasicMaterial({ color: 0xf472b6 }),
    ];

    const nodes = [];
    for (let i = 0; i < 5; i++) {
      const node = new THREE.Mesh(nodeGeometry, nodeMaterials[i % nodeMaterials.length]);
      masterGroup.add(node);
      nodes.push({
        mesh: node,
        ringIndex: i % rings.length,
        speed: 0.4 + i * 0.15,
        offset: (i * Math.PI * 2) / 5,
      });
    }

    // 6. Ambient Particle Starfield / Data Nebula
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const r = 3.5 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      particlePos[i] = r * Math.sin(phi) * Math.cos(theta);
      particlePos[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePos[i + 2] = r * Math.cos(phi);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    masterGroup.add(particles);

    // 7. Lighting
    const ambientLight = new THREE.AmbientLight(0x0a192f, 2.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 3.0);
    keyLight.position.set(5, 5, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x818cf8, 2.5);
    rimLight.position.set(-6, -4, -4);
    scene.add(rimLight);

    const centerPointLight = new THREE.PointLight(0x06b6d4, 2.0, 10);
    centerPointLight.position.set(0, 0, 0);
    scene.add(centerPointLight);

    // Mouse Tracking Parallax with inertia
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const handlePointerMove = (e) => {
      if (prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.35;
      targetRotX = -y * 0.35;
    };

    window.addEventListener('pointermove', handlePointerMove);

    // Visibility Observer to pause rendering when scrolled out of view
    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Smooth lerp mouse parallax
        mouseX += (targetRotY - mouseX) * 0.05;
        mouseY += (targetRotX - mouseY) * 0.05;

        masterGroup.rotation.y = elapsedTime * 0.15 + mouseX;
        masterGroup.rotation.x = Math.sin(elapsedTime * 0.1) * 0.08 + mouseY;

        // Counter-rotate cages and rings
        cageMesh.rotation.y = -elapsedTime * 0.2;
        cageMesh.rotation.x = elapsedTime * 0.1;
        wireMesh.rotation.y = elapsedTime * 0.1;

        ringGroup.rotation.z = elapsedTime * 0.05;

        // Position nodes on orbital paths
        nodes.forEach((node) => {
          const ring = rings[node.ringIndex];
          const angle = elapsedTime * node.speed + node.offset;
          const x = Math.cos(angle) * ring.radius;
          const y = Math.sin(angle) * ring.radius;
          const z = 0;

          const vec = new THREE.Vector3(x, y, z);
          vec.applyEuler(new THREE.Euler(...ring.rot));
          node.mesh.position.copy(vec);
        });

        // Drift particles
        particles.rotation.y = -elapsedTime * 0.03;
        particles.rotation.x = elapsedTime * 0.02;

        // Core gentle breathing
        const scale = 1 + Math.sin(elapsedTime * 1.5) * 0.03;
        coreMesh.scale.set(scale, scale, scale);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);

      // Dispose Three.js resources
      coreGeometry.dispose();
      coreMaterial.dispose();
      wireGeometry.dispose();
      wireMaterial.dispose();
      cageGeometry.dispose();
      cageMaterial.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      nodeGeometry.dispose();
      nodeMaterials.forEach((m) => m.dispose());
      rings.forEach((r) => {
        r.mesh.geometry.dispose();
        r.mesh.material.dispose();
      });

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  if (!isSupported) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-64 h-64 rounded-full bg-blue-500/10 border border-blue-500/30 blur-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[480px] sm:h-[560px] lg:h-[620px] flex items-center justify-center pointer-events-none select-none"
      aria-hidden="true"
    />
  );
}
