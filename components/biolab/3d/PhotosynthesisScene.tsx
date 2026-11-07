'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PhotosynthesisState } from '../types';
import { setupLabEnvironment } from './LabEnvironment';

interface Props {
  state: PhotosynthesisState;
  onUpdateBubbleRate?: (bpm: number, volume: number) => void;
  isPlaying: boolean;
}

export default function PhotosynthesisScene({ state, onUpdateBubbleRate, isPlaying }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const collectedVolRef = useRef(state.collectedO2Volume);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const [cameraView, setCameraView] = useState<'overview' | 'closeup'>('overview');

  const switchCameraView = (view: 'overview' | 'closeup') => {
    setCameraView(view);
    if (!controlsRef.current || !cameraRef.current) return;
    if (view === 'closeup') {
      cameraRef.current.position.set(0, 2.5, 4.0);
      controlsRef.current.target.set(0, 2.2, 0);
    } else {
      cameraRef.current.position.set(0, 3.8, 8.2);
      controlsRef.current.target.set(0, 1.8, 0);
    }
    controlsRef.current.update();
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 3.8, 8.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.02;
    controls.minDistance = 2.0;
    controls.maxDistance = 16;
    controls.target.set(0, 1.8, 0);
    controlsRef.current = controls;

    // 2. Setup Realistic Bright Laboratory Environment
    setupLabEnvironment(scene);

    // 3. Lab Retort Stand (Giá đỡ sắt thí nghiệm giữ ống nghiệm và phễu)
    const standGroup = new THREE.Group();
    standGroup.position.set(1.5, 0, 0);
    scene.add(standGroup);

    // Heavy Cast Iron Base
    const standBase = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.1, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.35 })
    );
    standBase.position.y = 0.05;
    standBase.castShadow = true;
    standBase.receiveShadow = true;
    standGroup.add(standBase);

    // Steel Vertical Rod
    const standRod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 3.8, 16),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 })
    );
    standRod.position.set(-0.45, 1.95, 0);
    standRod.castShadow = true;
    standGroup.add(standRod);

    // Boss Head & Clamp Arm holding the test tube
    const bossHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.18, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.3 })
    );
    bossHead.position.set(-0.45, 2.7, 0);
    standGroup.add(bossHead);

    const clampArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 1.1, 12),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })
    );
    clampArm.rotation.z = Math.PI / 2;
    clampArm.position.set(-1.0, 2.7, 0);
    standGroup.add(clampArm);

    // Ring clamp around the test tube
    const clampRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.03, 12, 24),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.3 })
    );
    clampRing.rotation.x = Math.PI / 2;
    clampRing.position.set(-1.5, 2.7, 0);
    standGroup.add(clampRing);

    // 4. Glass Aquarium Tank (Bể kính nuôi rong)
    const tankGroup = new THREE.Group();
    scene.add(tankGroup);

    // High quality borosilicate glass material
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.95,
      opacity: 0.9,
      transparent: true,
      roughness: 0.03,
      ior: 1.5,
      thickness: 0.12,
      depthWrite: false,
    });

    const tankGeo = new THREE.BoxGeometry(2.8, 3.2, 1.9);
    const tank = new THREE.Mesh(tankGeo, glassMat);
    tank.position.y = 1.6;
    tank.castShadow = true;
    tankGroup.add(tank);

    // Tank Frame Edges (Sleek black silicone border)
    const tankEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(tankGeo),
      new THREE.LineBasicMaterial({ color: 0x334155, linewidth: 2 })
    );
    tankEdges.position.copy(tank.position);
    tankGroup.add(tankEdges);

    // Clear Water Volume inside tank
    const waterGeo = new THREE.BoxGeometry(2.74, 2.85, 1.84);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: 0.88,
      opacity: 0.7,
      transparent: true,
      roughness: 0.02,
      ior: 1.33,
      depthWrite: false,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = 1.48;
    tankGroup.add(water);

    // 5. Funnel and Inverted Test Tube
    const funnelGroup = new THREE.Group();
    funnelGroup.position.set(0, 0.85, 0);

    // Inverted Funnel Cone
    const funnelGeo = new THREE.ConeGeometry(0.88, 0.95, 36, 1, true);
    funnelGeo.rotateX(Math.PI);
    const funnel = new THREE.Mesh(funnelGeo, glassMat);
    funnel.position.y = 0.48;
    funnelGroup.add(funnel);

    // Funnel Stem
    const stemGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.85, 24, 1, true);
    const funnelStem = new THREE.Mesh(stemGeo, glassMat);
    funnelStem.position.y = 1.25;
    funnelGroup.add(funnelStem);

    // Inverted Graduated Test Tube (Ống nghiệm có chia vạch thể tích ml)
    const testTubeGeo = new THREE.CylinderGeometry(0.24, 0.24, 1.7, 32, 1, false);
    const testTube = new THREE.Mesh(testTubeGeo, glassMat);
    testTube.position.y = 2.05;
    funnelGroup.add(testTube);

    // Test Tube Volume Marks (ml graduations)
    const markMat = new THREE.LineBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.7 });
    for (let my = 1.4; my <= 2.7; my += 0.25) {
      const markGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.24, my, 0),
        new THREE.Vector3(-0.16, my, 0),
      ]);
      const mark = new THREE.Line(markGeo, markMat);
      funnelGroup.add(mark);
    }

    // Gas pocket at top of inverted tube (Oxygen gas pocket)
    const gasPocketGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.6, 24);
    const gasPocketMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.25,
      roughness: 0.1,
    });
    const gasPocket = new THREE.Mesh(gasPocketGeo, gasPocketMat);
    gasPocket.position.y = 2.5;
    gasPocket.scale.set(1, 0.1, 1);
    funnelGroup.add(gasPocket);

    tankGroup.add(funnelGroup);

    // 6. Elodea Water Plant Sprig (Rong đuôi chó xanh mướt nhiều tầng lá)
    const plantGroup = new THREE.Group();
    plantGroup.position.set(0, 0.15, 0);

    const stalkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.1, 0),
      new THREE.Vector3(0.07, 0.35, 0.04),
      new THREE.Vector3(-0.05, 0.65, -0.03),
      new THREE.Vector3(0, 0.95, 0), // Cut tip right under the funnel stem!
    ]);
    const stalkGeo = new THREE.TubeGeometry(stalkCurve, 24, 0.045, 10, false);
    const stalkMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });
    const stalk = new THREE.Mesh(stalkGeo, stalkMat);
    plantGroup.add(stalk);

    // Distinct cut stem tip with light green cell edge (Bubble generation port)
    const cutTipGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.025, 16);
    const cutTipMat = new THREE.MeshStandardMaterial({
      color: 0x86efac,
      emissive: 0x22c55e,
      emissiveIntensity: 0.7,
      roughness: 0.3,
    });
    const cutTip = new THREE.Mesh(cutTipGeo, cutTipMat);
    cutTip.position.set(0, 0.95, 0);
    plantGroup.add(cutTip);

    // Detailed whorls of lanceolate leaves
    const leafGeo = new THREE.ConeGeometry(0.065, 0.42, 8);
    leafGeo.rotateX(Math.PI / 2);
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x16a34a,
      roughness: 0.4,
      metalness: 0.05,
    });

    for (let h = 0.22; h <= 0.88; h += 0.1) {
      const pt = stalkCurve.getPoint(h);
      for (let r = 0; r < 4; r++) {
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.copy(pt);
        leaf.rotation.y = (r * Math.PI) / 2 + h * 3;
        leaf.rotation.z = 0.45;
        plantGroup.add(leaf);
      }
    }
    funnelGroup.add(plantGroup);

    // 7. Glistening Oxygen Bubbles (Super-visible & crystal clear)
    const maxBubbles = 90;
    const bubblesGroup = new THREE.Group();
    bubblesGroup.renderOrder = 20;
    scene.add(bubblesGroup);

    const bubbleGeoLarge = new THREE.SphereGeometry(0.095, 16, 16);
    const bubbleGeoMed = new THREE.SphereGeometry(0.07, 14, 14);
    const bubbleGeoSmall = new THREE.SphereGeometry(0.048, 12, 12);

    const bubbleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.85,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });

    const bubbles: Array<{
      mesh: THREE.Mesh;
      active: boolean;
      speed: number;
      baseX: number;
      baseZ: number;
      offset: number;
    }> = [];

    for (let i = 0; i < maxBubbles; i++) {
      const geo = i % 3 === 0 ? bubbleGeoLarge : i % 3 === 1 ? bubbleGeoMed : bubbleGeoSmall;
      const bMesh = new THREE.Mesh(geo, bubbleMat);
      bMesh.visible = false;
      bubblesGroup.add(bMesh);

      bubbles.push({
        mesh: bMesh,
        active: false,
        speed: 0.85 + Math.random() * 0.45,
        baseX: (Math.random() - 0.5) * 0.04,
        baseZ: (Math.random() - 0.5) * 0.04,
        offset: Math.random() * Math.PI * 2,
      });
    }

    // 8. Calibrated Optical Bench Rail (Thước quang học kim loại chia vạch cm)
    const railGroup = new THREE.Group();
    railGroup.position.set(-3.2, 0.02, 0);
    scene.add(railGroup);

    // Aluminum Rail Track
    const railGeo = new THREE.BoxGeometry(3.6, 0.06, 0.45);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.3 });
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.set(0, 0.03, 0);
    rail.receiveShadow = true;
    railGroup.add(rail);

    // Rail Graduation Ticks (10cm to 100cm marks)
    const tickMat = new THREE.LineBasicMaterial({ color: 0xffffff });
    for (let rx = -1.6; rx <= 1.6; rx += 0.35) {
      const tickGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(rx, 0.065, -0.18),
        new THREE.Vector3(rx, 0.065, 0.18),
      ]);
      const tick = new THREE.Line(tickGeo, tickMat);
      railGroup.add(tick);
    }

    // 9. Moveable Bench Lamp with Optical Filter
    const lampRig = new THREE.Group();
    scene.add(lampRig);

    // Carriage base sliding on the rail
    const carriage = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.1, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 })
    );
    carriage.position.y = 0.08;
    carriage.castShadow = true;
    lampRig.add(carriage);

    // Lamp Stand Post
    const lampPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.7, 16),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })
    );
    lampPost.position.set(0, 0.95, 0);
    lampPost.castShadow = true;
    lampRig.add(lampPost);

    // Lamp Shade
    const lampShade = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 0.8, 36, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.25 })
    );
    lampShade.position.set(0, 1.8, 0);
    lampShade.rotation.z = -Math.PI / 2;
    lampShade.castShadow = true;
    lampRig.add(lampShade);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 20, 20),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2.2 })
    );
    bulb.position.set(0.18, 1.8, 0);
    lampRig.add(bulb);

    const spotLight = new THREE.SpotLight(0xffffff, 6, 14, Math.PI / 3.8, 0.25, 1);
    spotLight.position.set(0, 1.8, 0);
    spotLight.target.position.set(2, 1.8, 0);
    lampRig.add(spotLight);
    lampRig.add(spotLight.target);

    // Optical Colored Filter Glass Plate
    const filterGeo = new THREE.BoxGeometry(0.04, 1.4, 1.4);
    const filterMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.85,
      transparent: true,
      opacity: 0.75,
      roughness: 0.05,
    });
    const filterMesh = new THREE.Mesh(filterGeo, filterMat);
    filterMesh.position.set(0.68, 1.8, 0);
    lampRig.add(filterMesh);

    // 10. Glowing Splint & Flame
    const splintGroup = new THREE.Group();
    splintGroup.position.set(0, 3.8, 0);
    splintGroup.visible = false;
    scene.add(splintGroup);

    const stick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 1.25, 12),
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 })
    );
    stick.position.y = 0.62;
    splintGroup.add(stick);

    const emberGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const emberMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xff2200,
      emissiveIntensity: 3.5,
    });
    const ember = new THREE.Mesh(emberGeo, emberMat);
    ember.position.y = 0;
    splintGroup.add(ember);

    const flameGeo = new THREE.ConeGeometry(0.14, 0.5, 16);
    flameGeo.translate(0, 0.25, 0);
    const flameMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf97316,
      emissiveIntensity: 4.5,
      transparent: true,
      opacity: 0.95,
    });
    const flameMesh = new THREE.Mesh(flameGeo, flameMat);
    flameMesh.visible = false;
    splintGroup.add(flameMesh);

    const flameLight = new THREE.PointLight(0xf97316, 0, 5);
    flameLight.position.y = 0.25;
    splintGroup.add(flameLight);

    // Animation & Calculation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let spawnCounter = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const s = stateRef.current;
      const playing = isPlayingRef.current;

      // Biological formula: Rate = LightFactor * CO2Factor * TempFactor * FilterFactor
      const distMeters = Math.max(s.lampDistance, 10) / 100;
      const lightIntensity = (s.lampPower / (distMeters * distMeters * 80)) * 0.75;
      const lightFactor = Math.min(lightIntensity, 1.85);

      const co2Factor = (s.co2Concentration * 1.5) / (0.8 + s.co2Concentration);

      let tempFactor = 0;
      if (s.waterTemperature >= 5 && s.waterTemperature <= 50) {
        if (s.waterTemperature < 30) {
          tempFactor = Math.max(0, (s.waterTemperature - 5) / 25);
        } else {
          tempFactor = Math.max(0, 1 - Math.pow((s.waterTemperature - 30) / 16, 2));
        }
      }

      let filterFactor = 1.0;
      let filterColorHex = 0xffffff;
      if (s.colorFilter === 'blue') {
        filterFactor = 0.92;
        filterColorHex = 0x38bdf8;
      } else if (s.colorFilter === 'red') {
        filterFactor = 0.88;
        filterColorHex = 0xef4444;
      } else if (s.colorFilter === 'green') {
        filterFactor = 0.12;
        filterColorHex = 0x22c55e;
      }

      const rawBPM = 52 * lightFactor * co2Factor * tempFactor * filterFactor;
      const bubblesPerMinute = Math.round(rawBPM * 10) / 10;

      // Update lamp position on rail
      const lampX = -1.6 - (s.lampDistance / 100) * 3.0;
      lampRig.position.set(lampX, 0, 0);

      // Filter color
      (filterMesh.material as THREE.MeshPhysicalMaterial).color.setHex(filterColorHex);
      spotLight.color.setHex(filterColorHex);
      (bulb.material as THREE.MeshStandardMaterial).emissive.setHex(filterColorHex);
      spotLight.intensity = (s.lampPower / 40) * 4;

      // Accumulate collected O2 volume
      if (playing && bubblesPerMinute > 0) {
        const fillRate = (bubblesPerMinute / 60) * 0.18 * s.timeMultiplier * delta;
        collectedVolRef.current = Math.min(100, collectedVolRef.current + fillRate);
      }

      const volScale = Math.max(0.05, (collectedVolRef.current / 100) * 1.6);
      gasPocket.scale.set(1, volScale, 1);
      gasPocket.position.y = 2.75 - volScale * 0.3;

      // Emit bubbles
      if (playing && bubblesPerMinute > 0.5) {
        const spawnInterval = Math.max(0.04, 1.0 / ((bubblesPerMinute / 60) * s.timeMultiplier));
        spawnCounter += delta;

        if (spawnCounter >= spawnInterval) {
          spawnCounter = 0;
          const inactive = bubbles.find((b) => !b.active);
          if (inactive) {
            inactive.active = true;
            inactive.mesh.visible = true;
            inactive.mesh.position.set(inactive.baseX, 1.8, inactive.baseZ);
          }
        }
      }

      const time = clock.getElapsedTime();
      const gasTopLimit = 3.55 - (volScale * 0.28);

      for (const b of bubbles) {
        if (!b.active) continue;
        b.mesh.position.y += b.speed * delta * (playing ? s.timeMultiplier : 0.2);
        b.mesh.position.x = b.baseX + Math.sin(time * 8 + b.offset) * 0.025;
        b.mesh.position.z = b.baseZ + Math.cos(time * 8 + b.offset) * 0.025;

        if (b.mesh.position.y >= gasTopLimit) {
          b.active = false;
          b.mesh.visible = false;
        }
      }

      // Glowing splint
      if (s.glowingSplintActive) {
        splintGroup.visible = true;
        splintGroup.position.y = THREE.MathUtils.lerp(splintGroup.position.y, 3.1, delta * 3.5);

        if (s.splintBurstEffect && collectedVolRef.current >= 25) {
          flameMesh.visible = true;
          flameLight.intensity = 3.0 + Math.sin(time * 25) * 1.0;
          flameMesh.scale.set(
            1 + Math.sin(time * 18) * 0.2,
            1 + Math.cos(time * 22) * 0.25,
            1 + Math.sin(time * 18) * 0.2
          );
        } else {
          flameMesh.visible = false;
          flameLight.intensity = 0;
        }
      } else {
        splintGroup.visible = false;
        splintGroup.position.y = 4.4;
        flameMesh.visible = false;
        flameLight.intensity = 0;
      }

      if (onUpdateBubbleRate) {
        onUpdateBubbleRate(bubblesPerMinute, Math.round(collectedVolRef.current * 10) / 10);
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-300 shadow-xl">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D HUD Badges */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-cyan-700 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
          Phòng Thí Nghiệm Sinh Học • Mô Hình Quang Hợp
        </div>
        <div className="bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] text-slate-700 shadow-sm">
          Đèn: <strong className="text-amber-600">{state.lampDistance} cm</strong> | $CO_2$: <strong className="text-emerald-600">{state.co2Concentration}%</strong> | Nước: <strong className="text-cyan-600">{state.waterTemperature}°C</strong>
        </div>
      </div>

      {/* Camera View Switcher Buttons */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={() => switchCameraView('overview')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition cursor-pointer flex items-center gap-1.5 shadow-sm ${
            cameraView === 'overview'
              ? 'bg-cyan-50 border-cyan-400 text-cyan-700 ring-2 ring-cyan-500/20'
              : 'bg-white/90 border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>🔭</span> Toàn cảnh
        </button>
        <button
          onClick={() => switchCameraView('closeup')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition cursor-pointer flex items-center gap-1.5 shadow-sm ${
            cameraView === 'closeup'
              ? 'bg-cyan-50 border-cyan-400 text-cyan-700 ring-2 ring-cyan-500/20'
              : 'bg-white/90 border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>🔍</span> Cận cảnh bọt khí
        </button>
      </div>

      {/* Prominent Live Bubble Stream Indicator */}
      <div className="absolute bottom-16 left-4 bg-white/95 border border-cyan-300 backdrop-blur-md px-4 py-3 rounded-2xl text-xs text-slate-800 shadow-lg flex items-center gap-3 max-w-[280px]">
        <div className="relative w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center border border-cyan-300 text-cyan-600">
          <span className="text-xl animate-bounce">🫧</span>
          {state.bubblesPerMinute > 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
          )}
        </div>
        <div>
          <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            Dòng bọt khí $O_2$ thoát ra
          </div>
          <div className="text-xl font-black text-cyan-600 flex items-baseline gap-1">
            {state.bubblesPerMinute}
            <span className="text-xs font-normal text-slate-500">bọt/phút</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-medium">
            {state.bubblesPerMinute > 30 ? 'Quang hợp rất mạnh' : state.bubblesPerMinute > 10 ? 'Quang hợp ổn định' : 'Quang hợp yếu/ngừng'}
          </div>
        </div>
      </div>

      {/* Oxygen Gas Tank Tube fill meter */}
      <div className="absolute bottom-4 right-4 bg-white/90 border border-slate-200 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs flex items-center gap-3 shadow-sm">
        <div className="w-2.5 h-10 bg-slate-200 rounded-full overflow-hidden p-0.5 border border-slate-300 flex flex-col justify-end">
          <div
            className="w-full bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full transition-all duration-300"
            style={{ height: `${Math.min(100, state.collectedO2Volume)}%` }}
          />
        </div>
        <div>
          <div className="text-[10px] text-slate-500">Khí Oxy tích lũy trong ống</div>
          <div className="text-xs font-bold text-slate-800">{Math.round(state.collectedO2Volume)}% thể tích</div>
        </div>
      </div>

      {/* Flame Burst Toast */}
      {state.glowingSplintActive && state.splintBurstEffect && state.collectedO2Volume >= 25 && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 px-5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-bounce z-20 font-bold border-2 border-amber-300">
          <span className="text-2xl">🔥</span>
          <div>
            <div className="text-xs font-extrabold">Que đóm bùng cháy mãnh liệt!</div>
            <div className="text-[11px] font-medium">Chứng minh chất khí thoát ra là Khí Oxy ($O_2$) duy trì sự cháy!</div>
          </div>
        </div>
      )}

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-300 text-[11px] text-slate-600 pointer-events-none shadow-sm">
        🖱️ Giữ chuột trái để xoay 360° • Lăn chuột để zoom • Bấm &quot;Cận cảnh bọt khí&quot; để quan sát rõ hơn
      </div>
    </div>
  );
}
