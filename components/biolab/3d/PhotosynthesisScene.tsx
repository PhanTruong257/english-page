'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PhotosynthesisState } from '../types';

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

  // Camera switch animation
  const switchCameraView = (view: 'overview' | 'closeup') => {
    setCameraView(view);
    if (!controlsRef.current || !cameraRef.current) return;
    if (view === 'closeup') {
      // Zoom right into the test tube bubble stream
      cameraRef.current.position.set(0, 2.5, 4.0);
      controlsRef.current.target.set(0, 2.2, 0);
    } else {
      // Overview
      cameraRef.current.position.set(0, 4.2, 8.5);
      controlsRef.current.target.set(0, 2.0, 0);
    }
    controlsRef.current.update();
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14);
    scene.fog = new THREE.FogExp2(0x070b14, 0.025);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 4.2, 8.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.minDistance = 2.0;
    controls.maxDistance = 18;
    controls.target.set(0, 2.0, 0);
    controlsRef.current = controls;

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.7);
    fillLight.position.set(-5, 8, 4);
    scene.add(fillLight);

    // Tube Backlight for maximum bubble clarity
    const tubeGlowLight = new THREE.PointLight(0x38bdf8, 1.2, 5);
    tubeGlowLight.position.set(0, 2.2, -0.6);
    scene.add(tubeGlowLight);

    // 3. Lab Table
    const tableGeo = new THREE.CylinderGeometry(5.5, 5.8, 0.4, 48);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.6 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = -0.2;
    table.receiveShadow = true;
    scene.add(table);

    const grid = new THREE.GridHelper(9, 18, 0x06b6d4, 0x1e293b);
    grid.position.y = 0.01;
    scene.add(grid);

    // Ruler on Table (Distance cm)
    const rulerGeo = new THREE.BoxGeometry(4.8, 0.02, 0.35);
    const rulerMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });
    const ruler = new THREE.Mesh(rulerGeo, rulerMat);
    ruler.position.set(-2.0, 0.02, 1.2);
    scene.add(ruler);

    // 4. Glass Aquarium Tank
    const tankGroup = new THREE.Group();
    scene.add(tankGroup);

    // Glass walls
    const tankGeo = new THREE.BoxGeometry(2.8, 3.2, 1.8);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transmission: 0.94,
      opacity: 1,
      transparent: true,
      roughness: 0.04,
      ior: 1.45,
      thickness: 0.15,
      depthWrite: false,
    });
    const tank = new THREE.Mesh(tankGeo, glassMat);
    tank.position.y = 1.6;
    tankGroup.add(tank);

    // Water volume inside tank
    const waterGeo = new THREE.BoxGeometry(2.7, 2.8, 1.7);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      transmission: 0.88,
      opacity: 0.75,
      transparent: true,
      roughness: 0.02,
      ior: 1.33,
      depthWrite: false,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = 1.45;
    tankGroup.add(water);

    // 5. Funnel and Inverted Test Tube
    const funnelGroup = new THREE.Group();
    funnelGroup.position.set(0, 0.8, 0);

    // Funnel cone
    const funnelGeo = new THREE.ConeGeometry(0.85, 0.9, 32, 1, true);
    funnelGeo.rotateX(Math.PI);
    const funnel = new THREE.Mesh(funnelGeo, glassMat);
    funnel.position.y = 0.45;
    funnelGroup.add(funnel);

    // Funnel Stem
    const stemGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 16, 1, true);
    const funnelStem = new THREE.Mesh(stemGeo, glassMat);
    funnelStem.position.y = 1.2;
    funnelGroup.add(funnelStem);

    // Inverted Test Tube
    const testTubeGeo = new THREE.CylinderGeometry(0.24, 0.24, 1.7, 24, 1, false);
    const testTube = new THREE.Mesh(testTubeGeo, glassMat);
    testTube.position.y = 2.05;
    funnelGroup.add(testTube);

    // Gas pocket at top of inverted tube (Oxygen gas pocket)
    const gasPocketGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.6, 24);
    const gasPocketMat = new THREE.MeshStandardMaterial({
      color: 0xf0fdf4,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
    });
    const gasPocket = new THREE.Mesh(gasPocketGeo, gasPocketMat);
    gasPocket.position.y = 2.5;
    gasPocket.scale.set(1, 0.1, 1);
    funnelGroup.add(gasPocket);

    tankGroup.add(funnelGroup);

    // 6. Elodea Water Plant Sprig (Rong đuôi chó)
    const plantGroup = new THREE.Group();
    plantGroup.position.set(0, 0.15, 0);

    // Main stalk
    const stalkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.1, 0),
      new THREE.Vector3(0.08, 0.35, 0.04),
      new THREE.Vector3(-0.05, 0.65, -0.03),
      new THREE.Vector3(0, 0.95, 0), // Cut tip right under the funnel stem!
    ]);
    const stalkGeo = new THREE.TubeGeometry(stalkCurve, 20, 0.045, 8, false);
    const stalkMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
    const stalk = new THREE.Mesh(stalkGeo, stalkMat);
    plantGroup.add(stalk);

    // Plant cut tip highlight (where O2 bubbles originate)
    const cutTipGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.02, 12);
    const cutTipMat = new THREE.MeshStandardMaterial({ color: 0x86efac, emissive: 0x22c55e, emissiveIntensity: 0.6 });
    const cutTip = new THREE.Mesh(cutTipGeo, cutTipMat);
    cutTip.position.set(0, 0.95, 0);
    plantGroup.add(cutTip);

    // Whorls of leaves along stalk
    const leafGeo = new THREE.ConeGeometry(0.065, 0.38, 8);
    leafGeo.rotateX(Math.PI / 2);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.45 });

    for (let h = 0.22; h <= 0.88; h += 0.11) {
      const pt = stalkCurve.getPoint(h);
      for (let r = 0; r < 4; r++) {
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.copy(pt);
        leaf.rotation.y = (r * Math.PI) / 2 + h * 3;
        leaf.rotation.z = 0.4;
        plantGroup.add(leaf);
      }
    }
    funnelGroup.add(plantGroup);

    // 7. SUPER-VISIBLE BUBBLE SYSTEM
    // Bubbles must be clearly visible, glistening, large enough to clearly observe, and continuously rising!
    const maxBubbles = 90;
    const bubblesGroup = new THREE.Group();
    bubblesGroup.renderOrder = 20; // Ensure rendered on top of transparent glass
    scene.add(bubblesGroup);

    // Shared sphere geometry with crisp high-res subdivisions
    const bubbleGeoLarge = new THREE.SphereGeometry(0.09, 16, 16);
    const bubbleGeoMed = new THREE.SphereGeometry(0.065, 14, 14);
    const bubbleGeoSmall = new THREE.SphereGeometry(0.045, 12, 12);

    // Bright iridescent cyan-white material with emissive glow
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

    // Inner highlight ring/sphere for realistic bubble look
    const bubbles: Array<{
      mesh: THREE.Mesh;
      active: boolean;
      speed: number;
      baseX: number;
      baseZ: number;
      offset: number;
      sizeFactor: number;
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
        baseX: (Math.random() - 0.5) * 0.05,
        baseZ: (Math.random() - 0.5) * 0.05,
        offset: Math.random() * Math.PI * 2,
        sizeFactor: 0.8 + Math.random() * 0.4,
      });
    }

    // 8. Moveable Bench Lamp with Filter
    const lampRig = new THREE.Group();
    scene.add(lampRig);

    const lampShade = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 0.8, 32, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x0f766e, metalness: 0.7, roughness: 0.3 })
    );
    lampShade.rotation.z = -Math.PI / 2;
    lampRig.add(lampShade);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2 })
    );
    bulb.position.x = 0.15;
    lampRig.add(bulb);

    const spotLight = new THREE.SpotLight(0xffffff, 5, 12, Math.PI / 4, 0.2, 1);
    spotLight.position.set(0, 0, 0);
    spotLight.target.position.set(2, 0, 0);
    lampRig.add(spotLight);
    lampRig.add(spotLight.target);

    // Colored Optical Filter Glass
    const filterGeo = new THREE.BoxGeometry(0.04, 1.4, 1.4);
    const filterMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.8,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
    });
    const filterMesh = new THREE.Mesh(filterGeo, filterMat);
    filterMesh.position.set(0.65, 0, 0);
    lampRig.add(filterMesh);

    // 9. Glowing Splint & Flame
    const splintGroup = new THREE.Group();
    splintGroup.position.set(0, 3.8, 0);
    splintGroup.visible = false;
    scene.add(splintGroup);

    // Wood stick
    const stick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 1.2, 12),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 })
    );
    stick.position.y = 0.6;
    splintGroup.add(stick);

    // Glowing Ember tip
    const emberGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const emberMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xff2200,
      emissiveIntensity: 3.5,
    });
    const ember = new THREE.Mesh(emberGeo, emberMat);
    ember.position.y = 0;
    splintGroup.add(ember);

    // Bursting flame mesh
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

    // Animation & Biological Calculation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let spawnCounter = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const s = stateRef.current;
      const playing = isPlayingRef.current;

      // Biological formula:
      // Rate = LightFactor * CO2Factor * TempFactor * FilterFactor
      const distMeters = Math.max(s.lampDistance, 10) / 100;
      const lightIntensity = (s.lampPower / (distMeters * distMeters * 80)) * 0.75;
      const lightFactor = Math.min(lightIntensity, 1.85);

      // CO2 Factor (NaHCO3): 0% -> 0 rate; optimal around 2-3%
      const co2Factor = (s.co2Concentration * 1.5) / (0.8 + s.co2Concentration);

      // Temperature Factor (Bell curve around 28C, drops sharply >45C)
      let tempFactor = 0;
      if (s.waterTemperature >= 5 && s.waterTemperature <= 50) {
        if (s.waterTemperature < 30) {
          tempFactor = Math.max(0, (s.waterTemperature - 5) / 25);
        } else {
          tempFactor = Math.max(0, 1 - Math.pow((s.waterTemperature - 30) / 16, 2));
        }
      }

      // Filter Factor
      let filterFactor = 1.0;
      let filterColorHex = 0xffffff;
      if (s.colorFilter === 'blue') {
        filterFactor = 0.92;
        filterColorHex = 0x38bdf8;
      } else if (s.colorFilter === 'red') {
        filterFactor = 0.88;
        filterColorHex = 0xef4444;
      } else if (s.colorFilter === 'green') {
        filterFactor = 0.12; // Chlorophyll reflects green light!
        filterColorHex = 0x22c55e;
      }

      // Final rate in Bubbles Per Minute (0 to 90 bpm)
      const rawBPM = 52 * lightFactor * co2Factor * tempFactor * filterFactor;
      const bubblesPerMinute = Math.round(rawBPM * 10) / 10;

      // Update lamp position on rail
      const lampX = -1.6 - (s.lampDistance / 100) * 3.0;
      lampRig.position.set(lampX, 1.8, 0);

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

      // Scale gas pocket mesh inside test tube
      // World space test tube is at y = 0.8 + 2.05 = 2.85; top of tube is ~3.65
      const volScale = Math.max(0.05, (collectedVolRef.current / 100) * 1.6);
      gasPocket.scale.set(1, volScale, 1);
      gasPocket.position.y = 2.75 - volScale * 0.3;

      // 🫧 EMIT RISING O2 BUBBLES
      // Cut stem tip in world coordinates is at (0, 1.75, 0).
      // Funnel neck is from y = 1.8 to 2.2.
      // Inverted test tube is from y = 2.2 to 3.5.
      if (playing && bubblesPerMinute > 0.5) {
        // Frequency of bubble emission based on rate
        const spawnInterval = Math.max(0.04, 1.0 / ((bubblesPerMinute / 60) * s.timeMultiplier));
        spawnCounter += delta;

        if (spawnCounter >= spawnInterval) {
          spawnCounter = 0;
          const inactive = bubbles.find((b) => !b.active);
          if (inactive) {
            inactive.active = true;
            inactive.mesh.visible = true;
            // Spawn right at the cut stem tip (world coordinates: y = 1.75)
            inactive.mesh.position.set(inactive.baseX, 1.75, inactive.baseZ);
          }
        }
      }

      // Animate bubbles rising through the funnel neck into the test tube
      const time = clock.getElapsedTime();
      const gasTopLimit = 3.55 - (volScale * 0.28); // Level where gas accumulates

      for (const b of bubbles) {
        if (!b.active) continue;
        // Float upwards
        b.mesh.position.y += b.speed * delta * (playing ? s.timeMultiplier : 0.2);

        // Realistic horizontal wobble
        b.mesh.position.x = b.baseX + Math.sin(time * 8 + b.offset) * 0.025;
        b.mesh.position.z = b.baseZ + Math.cos(time * 8 + b.offset) * 0.025;

        // When bubble reaches the gas chamber boundary at top of tube -> pops into gas
        if (b.mesh.position.y >= gasTopLimit) {
          b.active = false;
          b.mesh.visible = false;
        }
      }

      // Glowing splint animation
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

      // Callback
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
    <div className="relative w-full h-full min-h-[480px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D HUD Badges */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/80 text-xs font-semibold text-cyan-400 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          Thí nghiệm Quang hợp ở Rong đuôi chó (Elodea)
        </div>
        <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300">
          Đèn: <strong className="text-amber-400">{state.lampDistance} cm</strong> | $CO_2$: <strong className="text-emerald-400">{state.co2Concentration}%</strong> | Nước: <strong className="text-cyan-400">{state.waterTemperature}°C</strong>
        </div>
      </div>

      {/* Camera View Switcher Buttons */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={() => switchCameraView('overview')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition cursor-pointer flex items-center gap-1.5 ${
            cameraView === 'overview'
              ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-lg'
              : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          <span>🔭</span> Toàn cảnh
        </button>
        <button
          onClick={() => switchCameraView('closeup')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition cursor-pointer flex items-center gap-1.5 ${
            cameraView === 'closeup'
              ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-lg ring-2 ring-cyan-500/40'
              : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          <span>🔍</span> Cận cảnh bọt khí
        </button>
      </div>

      {/* Prominent Live Bubble Stream Indicator */}
      <div className="absolute bottom-16 left-4 bg-slate-900/95 border border-cyan-500/50 backdrop-blur-md px-4 py-3 rounded-2xl text-xs text-slate-200 shadow-2xl flex items-center gap-3 max-w-[280px]">
        <div className="relative w-10 h-10 rounded-xl bg-cyan-950 flex items-center justify-center border border-cyan-500/40 text-cyan-300">
          <span className="text-xl animate-bounce">🫧</span>
          {state.bubblesPerMinute > 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
          )}
        </div>
        <div>
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Dòng bọt khí $O_2$ thoát ra
          </div>
          <div className="text-xl font-black text-cyan-300 flex items-baseline gap-1">
            {state.bubblesPerMinute}
            <span className="text-xs font-normal text-slate-400">bọt/phút</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-medium">
            {state.bubblesPerMinute > 30 ? 'Quang hợp rất mạnh' : state.bubblesPerMinute > 10 ? 'Quang hợp ổn định' : 'Quang hợp yếu/ngừng'}
          </div>
        </div>
      </div>

      {/* Oxygen Gas Tank Tube fill meter */}
      <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-800 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs flex items-center gap-3">
        <div className="w-2.5 h-10 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700 flex flex-col justify-end">
          <div
            className="w-full bg-gradient-to-t from-cyan-500 to-emerald-300 rounded-full transition-all duration-300"
            style={{ height: `${Math.min(100, state.collectedO2Volume)}%` }}
          />
        </div>
        <div>
          <div className="text-[10px] text-slate-400">Khí Oxy tích lũy trong ống</div>
          <div className="text-xs font-bold text-white">{Math.round(state.collectedO2Volume)}% thể tích</div>
        </div>
      </div>

      {/* Flame Burst Toast */}
      {state.glowingSplintActive && state.splintBurstEffect && state.collectedO2Volume >= 25 && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-amber-950/95 border border-amber-500 text-amber-200 px-5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-bounce z-20">
          <span className="text-2xl">🔥</span>
          <div>
            <div className="text-xs font-extrabold text-amber-300">Que đóm bùng cháy mãnh liệt!</div>
            <div className="text-[11px] text-amber-200/90">Chứng minh chất khí thoát ra là Khí Oxy ($O_2$) duy trì sự cháy!</div>
          </div>
        </div>
      )}

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/75 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-700/50 text-[11px] text-slate-400 pointer-events-none">
        🖱️ Giữ chuột trái để xoay 360° • Lăn chuột để zoom • Bấm &quot;Cận cảnh bọt khí&quot; để quan sát rõ hơn
      </div>
    </div>
  );
}
