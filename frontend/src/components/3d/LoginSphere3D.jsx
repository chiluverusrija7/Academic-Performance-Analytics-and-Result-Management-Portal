import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function LoginSphere3D() {
  const containerRef = useRef(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const width = container.clientWidth || 450;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // 1. Central Core Sphere
    const coreGeo = new THREE.SphereGeometry(1.4, 24, 24);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x0c1e3d,
      roughness: 0.3,
      metalness: 0.8,
      emissive: 0x0369a1,
      emissiveIntensity: 0.3,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    masterGroup.add(coreMesh);

    // 2. Wireframe Cage
    const wireGeo = new THREE.SphereGeometry(1.45, 18, 18);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    masterGroup.add(wireMesh);

    // 3. Equatorial & Polar Rings
    const ringGeo1 = new THREE.TorusGeometry(2.1, 0.015, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    masterGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(2.4, 0.012, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.5 });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 5;
    masterGroup.add(ring2);

    // 4. Orbiting Data Satellite Nodes
    const nodeGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const nodeMats = [
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 }),
      new THREE.MeshBasicMaterial({ color: 0x34d399 }),
      new THREE.MeshBasicMaterial({ color: 0xa78bfa }),
    ];

    const nodes = [
      { mesh: new THREE.Mesh(nodeGeo, nodeMats[0]), radius: 2.1, speed: 0.6, offset: 0, rot: [Math.PI / 3, Math.PI / 6, 0] },
      { mesh: new THREE.Mesh(nodeGeo, nodeMats[1]), radius: 2.1, speed: 0.6, offset: Math.PI, rot: [Math.PI / 3, Math.PI / 6, 0] },
      { mesh: new THREE.Mesh(nodeGeo, nodeMats[2]), radius: 2.4, speed: -0.45, offset: Math.PI / 2, rot: [-Math.PI / 4, 0, Math.PI / 5] },
    ];

    nodes.forEach((n) => masterGroup.add(n.mesh));

    // 5. Nebula Particles
    const pCount = 100;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
      const r = 2.5 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      pPos[i] = r * Math.sin(phi) * Math.cos(theta);
      pPos[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPos[i + 2] = r * Math.cos(phi);
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 0.04,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeo, pMat);
    masterGroup.add(particles);

    // 6. Lights
    const ambient = new THREE.AmbientLight(0x0f172a, 2.0);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 3.0);
    dirLight.position.set(4, 4, 5);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x818cf8, 2.0);
    rimLight.position.set(-4, -4, -3);
    scene.add(rimLight);

    // Mouse Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handlePointerMove = (e) => {
      if (prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.25;
      targetY = -y * 0.25;
    };

    window.addEventListener('pointermove', handlePointerMove);

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    let animationId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;

        masterGroup.rotation.y = t * 0.12 + mouseX;
        masterGroup.rotation.x = Math.sin(t * 0.15) * 0.05 + mouseY;
        wireMesh.rotation.y = t * 0.08;

        nodes.forEach((n) => {
          const angle = t * n.speed + n.offset;
          const x = Math.cos(angle) * n.radius;
          const y = Math.sin(angle) * n.radius;
          const vec = new THREE.Vector3(x, y, 0);
          vec.applyEuler(new THREE.Euler(...n.rot));
          n.mesh.position.copy(vec);
        });

        particles.rotation.y = -t * 0.02;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);

      coreGeo.dispose();
      coreMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      nodeGeo.dispose();
      nodeMats.forEach((m) => m.dispose());
      pGeo.dispose();
      pMat.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  if (!isSupported) {
    return (
      <div className="w-48 h-48 rounded-full bg-blue-500/10 border border-blue-500/20 blur-xl animate-pulse" />
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[320px] sm:h-[400px] flex items-center justify-center pointer-events-none select-none"
      aria-hidden="true"
    />
  );
}
