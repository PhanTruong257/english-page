'use client';

import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.03);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 4.2, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 18;
    controls.target.set(0, 2.0, 0);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.5);
    fillLight.position.set(-5, 8, 4);
    scene.add(fillLight);

    // 3. Lab Table
    const tableGeo = new THREE.CylinderGeometry(5.5, 5.8, 0.4, 48);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.3, metalness: 0.5 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = -0.2;
    table.receiveShadow = true;
    scene.add(table);

    const grid = new THREE.GridHelper(9, 18, 0x06b6d4, 0x1e293b);
    grid.position.y = 0.01;
    scene.add(grid);

    // Ruler on Table (Distance cm)
    const rulerGeo = new THREE.BoxGeometry(4.5, 0.02, 0.3);
    const rulerMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 });
    const ruler = new THREE.Mesh(rulerGeo, rulerMat);
    ruler.position.set(-1.8, 0.02, 1.2);
    scene.add(ruler);

    // 4. Glass Aquarium Tank
    const tankGroup = new THREE.Group();
    scene.add(tankGroup);

    // Glass walls
    const tankGeo = new THREE.BoxGeometry(2.8, 3.2, 1.8);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transmission: 0.92,
      opacity: 1,
      transparent: true,
      roughness: 0.05,
      ior: 1.45,
      thickness: 0.2,
      depthWrite: false,
    });
    const tank = new THREE.Mesh(tankGeo, glassMat);
    tank.position.y = 1.6;
    tankGroup.add(tank);

    // Water volume inside tank
    const waterGeo = new THREE.BoxGeometry(2.7, 2.8, 1.7);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: 0.85,
      opacity: 0.85,
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
    const testTubeGeo = new THREE.CylinderGeometry(0.22, 0.22, 1.6, 24, 1, false);
    const testTube = new THREE.Mesh(testTubeGeo, glassMat);
    testTube.position.y = 2.0;
    funnelGroup.add(testTube);

    // Gas pocket at top of inverted tube (Oxygen gas pocket)
    const gasPocketGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 24);
    const gasPocketMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.15,
      roughness: 0.1,
    });
    const gasPocket = new THREE.Mesh(gasPocketGeo, gasPocketMat);
    gasPocket.position.y = 2.45;
    gasPocket.scale.set(1, 0.1, 1);
    funnelGroup.add(gasPocket);

    tankGroup.add(funnelGroup);

    // 6. Elodea Water Plant Sprig (Rong đuôi chó)
    const plantGroup = new THREE.Group();
    plantGroup.position.set(0, 0.2, 0);

    // Main stalk
    const stalkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.1, 0),
      new THREE.Vector3(0.08, 0.4, 0.05),
      new THREE.Vector3(-0.06, 0.7, -0.04),
      new THREE.Vector3(0, 1.0, 0),
    ]);
    const stalkGeo = new THREE.TubeGeometry(stalkCurve, 20, 0.04, 8, false);
    const stalkMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
    const stalk = new THREE.Mesh(stalkGeo, stalkMat);
    plantGroup.add(stalk);

    // Whorls of leaves along stalk
    const leafGeo = new THREE.ConeGeometry(0.06, 0.35, 8);
    leafGeo.rotateX(Math.PI / 2);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 });

    for (let h = 0.25; h <= 0.95; h += 0.12) {
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

    // 7. Bubble Particle System (Rising Oxygen Bubbles)
    const maxBubbles = 120;
    const bubbleGeo = new THREE.SphereGeometry(0.035, 12, 12);
    const bubbleMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.85,
    });

    const bubbles: Array<{
      mesh: THREE.Mesh;
      active: boolean;
      speed: number;
      baseX: number;
      baseZ: number;
      offset: number;
    }> = [];

    const bubblesGroup = new THREE.Group();
    for (let i = 0; i < maxBubbles; i++) {
      const bMesh = new THREE.Mesh(bubbleGeo, bubbleMat);
      bMesh.visible = false;
      bubblesGroup.add(bMesh);
      bubbles.push({
        mesh: bMesh,
        active: false,
        speed: 0.6 + Math.random() * 0.4,
        baseX: (Math.random() - 0.5) * 0.06,
        baseZ: (Math.random() - 0.5) * 0.06,
        offset: Math.random() * Math.PI * 2,
      });
    }
    scene.add(bubblesGroup);

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
    const emberGeo = new THREE.SphereGeometry(0.04, 12, 12);
    const emberMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xff2200,
      emissiveIntensity: 3,
    });
    const ember = new THREE.Mesh(emberGeo, emberMat);
    ember.position.y = 0;
    splintGroup.add(ember);

    // Bursting flame mesh
    const flameGeo = new THREE.ConeGeometry(0.12, 0.45, 16);
    flameGeo.translate(0, 0.22, 0);
    const flameMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf97316,
      emissiveIntensity: 4,
      transparent: true,
      opacity: 0.9,
    });
    const flameMesh = new THREE.Mesh(flameGeo, flameMat);
    flameMesh.visible = false;
    splintGroup.add(flameMesh);

    // PointLight from flame
    const flameLight = new THREE.PointLight(0xf97316, 0, 4);
    flameLight.position.y = 0.2;
    splintGroup.add(flameLight);

    // Animation & Biological Calculation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let spawnTimer = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const s = stateRef.current;
      const playing = isPlayingRef.current;

      // Biological formula:
      // Rate = LightFactor * CO2Factor * TempFactor * FilterFactor
      // Light: Distance 10cm-100cm, Power 20W-200W
      const distMeters = Math.max(s.lampDistance, 10) / 100;
      const lightIntensity = (s.lampPower / (distMeters * distMeters * 80)) * 0.7;
      const lightFactor = Math.min(lightIntensity, 1.8);

      // CO2 Factor (NaHCO3): 0% -> 0 rate; optimal around 2-3%
      const co2Factor = (s.co2Concentration * 1.5) / (0.8 + s.co2Concentration);

      // Temperature Factor (Bell curve around 28C, drops sharply >45C)
      let tempFactor = 0;
      if (s.waterTemperature >= 5 && s.waterTemperature <= 50) {
        if (s.waterTemperature < 30) {
          tempFactor = Math.max(0, (s.waterTemperature - 5) / 25);
        } else {
          // Enzyme denaturation above 35-40C
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
        filterFactor = 0.12; // Green light mostly reflected!
        filterColorHex = 0x22c55e;
      }

      // Final rate in Bubbles Per Minute (0 to 90 bpm)
      const rawBPM = 52 * lightFactor * co2Factor * tempFactor * filterFactor;
      const bubblesPerMinute = Math.round(rawBPM * 10) / 10;

      // Update lamp position on rail
      // lampDistance: 10cm -> x: -1.8; 100cm -> x: -4.8
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

      // Scale gas pocket mesh
      const volScale = Math.max(0.05, (collectedVolRef.current / 100) * 1.5);
      gasPocket.scale.set(1, volScale, 1);
      gasPocket.position.y = 2.8 - (volScale * 0.3);

      // Bubble Generation
      if (playing && bubblesPerMinute > 2) {
        spawnTimer += delta * (bubblesPerMinute / 12) * s.timeMultiplier;
        if (spawnTimer >= 1.0) {
          spawnTimer = 0;
          const inactive = bubbles.find((b) => !b.active);
          if (inactive) {
            inactive.active = true;
            inactive.mesh.visible = true;
            inactive.mesh.position.set(inactive.baseX, 1.8, inactive.baseZ);
          }
        }
      }

      // Update bubbles rising
      const time = clock.getElapsedTime();
      for (const b of bubbles) {
        if (!b.active) continue;
        b.mesh.position.y += b.speed * delta * (playing ? s.timeMultiplier : 0.2);
        b.mesh.position.x = b.baseX + Math.sin(time * 6 + b.offset) * 0.02;

        // When bubble reaches top of inverted tube (y ~ 2.6)
        if (b.mesh.position.y >= 2.65 - (volScale * 0.25)) {
          b.active = false;
          b.mesh.visible = false;
        }
      }

      // Glowing splint animation
      if (s.glowingSplintActive) {
        splintGroup.visible = true;
        // Move downwards into the tube mouth
        splintGroup.position.y = THREE.MathUtils.lerp(splintGroup.position.y, 2.7, delta * 3);

        if (s.splintBurstEffect && collectedVolRef.current >= 25) {
          flameMesh.visible = true;
          flameLight.intensity = 2.5 + Math.sin(time * 20) * 0.8;
          flameMesh.scale.set(
            1 + Math.sin(time * 15) * 0.15,
            1 + Math.cos(time * 20) * 0.2,
            1 + Math.sin(time * 15) * 0.15
          );
        } else {
          flameMesh.visible = false;
          flameLight.intensity = 0;
        }
      } else {
        splintGroup.visible = false;
        splintGroup.position.y = 4.2;
        flameMesh.visible = false;
        flameLight.intensity = 0;
      }

      // Periodic callback
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
    <div className="relative w-full h-full min-h-[460px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D HUD Badges */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/80 text-xs font-semibold text-sky-400 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
          Mô hình 3D Quang Hợp Rong Đuôi Chó (Elodea)
        </div>
        <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300">
          Khoảng cách đèn: <strong className="text-amber-400">{state.lampDistance} cm</strong> | $CO_2$ ($NaHCO_3$): <strong className="text-emerald-400">{state.co2Concentration}%</strong>
        </div>
      </div>

      {/* Live O2 Bubble Counter Badge */}
      <div className="absolute top-4 right-4 bg-slate-900/90 border border-cyan-500/40 backdrop-blur-md px-4 py-2.5 rounded-2xl text-xs text-slate-200 shadow-xl flex items-center gap-3">
        <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
          <svg className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="16" />
          </svg>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Tốc độ thoát bọt khí $O_2$</div>
          <div className="text-lg font-black text-cyan-300">
            {state.bubblesPerMinute} <span className="text-xs font-normal text-slate-400">bọt/phút</span>
          </div>
        </div>
      </div>

      {/* Test tube O2 fill indicator */}
      <div className="absolute bottom-4 left-4 bg-slate-900/85 border border-slate-800 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs flex items-center gap-3">
        <div className="w-2.5 h-10 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700 flex flex-col justify-end">
          <div
            className="w-full bg-gradient-to-t from-sky-500 to-cyan-300 rounded-full transition-all duration-300"
            style={{ height: `${Math.min(100, state.collectedO2Volume)}%` }}
          />
        </div>
        <div>
          <div className="text-[10px] text-slate-400">Khí $O_2$ thu được</div>
          <div className="text-xs font-bold text-white">{Math.round(state.collectedO2Volume)}% ống nghiệm</div>
        </div>
      </div>

      {/* Flame Burst Toast */}
      {state.glowingSplintActive && state.splintBurstEffect && state.collectedO2Volume >= 25 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-amber-950/90 border border-amber-500/80 text-amber-200 px-4 py-2 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce">
          <span className="text-lg">🔥</span>
          <span className="text-xs font-bold">Que đóm bùng cháy mãnh liệt! Chứng minh khí thu được là Khí Oxy ($O_2$)!</span>
        </div>
      )}

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/75 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-700/50 text-[11px] text-slate-400 pointer-events-none">
        🖱️ Giữ chuột trái để xoay 360° • Lăn chuột để phóng to/thu nhỏ
      </div>
    </div>
  );
}
