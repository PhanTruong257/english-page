'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HydrotropismState } from '../types';

interface Props {
  state: HydrotropismState;
  onUpdateRootAngle?: (angle: number) => void;
  isPlaying: boolean;
}

export default function RootTropismScene({ state, onUpdateRootAngle, isPlaying }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentAngleRef = useRef(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);
    scene.fog = new THREE.FogExp2(0x0a0e1a, 0.035);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 3.8, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 18;
    controls.target.set(0, 1.8, 0);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xa7f3d0, 0.65);
    dirLight.position.set(4, 9, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // 3. Lab Table & Base
    const tableGeo = new THREE.CylinderGeometry(5.5, 5.8, 0.4, 48);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.3, metalness: 0.5 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = -0.2;
    table.receiveShadow = true;
    scene.add(table);

    const grid = new THREE.GridHelper(9, 18, 0x10b981, 0x1e293b);
    grid.position.y = 0.01;
    scene.add(grid);

    // 4. Observation Chamber (Rhizotron Box with transparent glass face)
    const chamberRig = new THREE.Group();
    chamberRig.position.set(0, 1.8, 0);
    scene.add(chamberRig);

    // Frame
    const frameGeo = new THREE.BoxGeometry(3.6, 3.4, 0.6);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.8 });
    const chamberFrame = new THREE.Mesh(frameGeo, frameMat);
    chamberRig.add(chamberFrame);

    // Substrate / Agar gel
    const agarGeo = new THREE.BoxGeometry(3.3, 3.1, 0.4);
    const agarMat = new THREE.MeshPhysicalMaterial({
      color: 0x064e3b,
      transmission: 0.85,
      opacity: 0.85,
      transparent: true,
      roughness: 0.2,
      depthWrite: false,
    });
    const agarMesh = new THREE.Mesh(agarGeo, agarMat);
    chamberRig.add(agarMesh);

    // Transparent front glass plate
    const frontGlassGeo = new THREE.BoxGeometry(3.4, 3.2, 0.05);
    const frontGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.95,
      opacity: 1,
      transparent: true,
      roughness: 0.05,
      depthWrite: false,
    });
    const frontGlass = new THREE.Mesh(frontGlassGeo, frontGlassMat);
    frontGlass.position.z = 0.28;
    chamberRig.add(frontGlass);

    // 5. Seedling at Top
    const seedGroup = new THREE.Group();
    seedGroup.position.set(0, 1.1, 0.05);

    // Germinated Seed (Bean seed / Hạt đậu)
    const seedGeo = new THREE.SphereGeometry(0.22, 16, 16);
    seedGeo.scale(1.2, 0.8, 0.8);
    const seedMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.7 });
    const seed = new THREE.Mesh(seedGeo, seedMat);
    seedGroup.add(seed);

    // Tiny shoot going upward (Negative Gravitropism)
    const shootGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.45, 12);
    shootGeo.translate(0, 0.22, 0);
    const shootMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.5 });
    const shoot = new THREE.Mesh(shootGeo, shootMat);
    seedGroup.add(shoot);

    chamberRig.add(seedGroup);

    // 6. Water Source Element (Wet porous sponge / Porous clay cup)
    const spongeGroup = new THREE.Group();
    const spongeGeo = new THREE.BoxGeometry(0.65, 0.65, 0.35);
    const spongeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.9,
      metalness: 0.1,
    });
    const sponge = new THREE.Mesh(spongeGeo, spongeMat);
    spongeGroup.add(sponge);

    // Water Droplet Icon Mesh or halo
    const haloGeo = new THREE.RingGeometry(0.38, 0.46, 24);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.z = 0.2;
    spongeGroup.add(halo);

    chamberRig.add(spongeGroup);

    // 7. Dynamic Root Mesh & Statolith particles
    let rootMesh: THREE.Mesh | null = null;
    let lateralRoots: THREE.Group | null = null;
    let statolithPoints: THREE.Points | null = null;

    // Statolith particles setup (X-Ray view of root cap amyloplasts)
    const statolithCount = 60;
    const statolithGeo = new THREE.BufferGeometry();
    const statolithPositions = new Float32Array(statolithCount * 3);
    for (let i = 0; i < statolithCount; i++) {
      statolithPositions[i * 3 + 0] = (Math.random() - 0.5) * 0.1;
      statolithPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
      statolithPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
    }
    statolithGeo.setAttribute('position', new THREE.BufferAttribute(statolithPositions, 3));
    const statolithMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.06,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    statolithPoints = new THREE.Points(statolithGeo, statolithMat);
    statolithPoints.visible = false;
    chamberRig.add(statolithPoints);

    // Rebuild root geometry
    function updateRootGeometry(angleRad: number, s: HydrotropismState) {
      if (rootMesh) chamberRig.remove(rootMesh);
      if (lateralRoots) chamberRig.remove(lateralRoots);

      const length = 2.0;
      // Main Taproot curve
      // Start at seed: (0, 1.0, 0.05)
      // Tip bends towards angleRad
      const tipX = Math.sin(angleRad) * (length * 0.85);
      const tipY = 1.0 - Math.cos(angleRad) * length;

      const p0 = new THREE.Vector3(0, 1.0, 0.05);
      const p1 = new THREE.Vector3(0, 0.4, 0.05);
      const p2 = new THREE.Vector3(tipX * 0.6, 1.0 - length * 0.65, 0.05);
      const p3 = new THREE.Vector3(tipX, tipY, 0.05);

      const rootCurve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);

      const tubeGeo = new THREE.TubeGeometry(rootCurve, 28, 0.055, 12, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: s.xrayStatoliths ? 0x67e8f9 : 0xfef08a,
        roughness: 0.6,
        metalness: 0.1,
        transparent: s.xrayStatoliths,
        opacity: s.xrayStatoliths ? 0.4 : 1.0,
      });

      rootMesh = new THREE.Mesh(tubeGeo, tubeMat);
      chamberRig.add(rootMesh);

      // Root tip cap
      const capGeo = new THREE.ConeGeometry(0.06, 0.16, 12);
      capGeo.translate(0, -0.08, 0);
      const capMat = new THREE.MeshStandardMaterial({
        color: s.xrayStatoliths ? 0x06b6d4 : 0xeab308,
        roughness: 0.5,
      });
      const rootCap = new THREE.Mesh(capGeo, capMat);
      rootCap.position.copy(p3);
      rootCap.rotation.z = -angleRad;
      chamberRig.add(rootCap);

      // Statoliths position at root cap
      if (statolithPoints && s.xrayStatoliths) {
        statolithPoints.visible = true;
        statolithPoints.position.copy(p3);
      } else if (statolithPoints) {
        statolithPoints.visible = false;
      }

      // Lateral roots branching towards water
      lateralRoots = new THREE.Group();
      for (let t = 0.35; t <= 0.85; t += 0.15) {
        const pt = rootCurve.getPoint(t);
        // Lateral branch towards moisture
        const dir = angleRad >= 0 ? 1 : -1;
        const branchGeo = new THREE.CylinderGeometry(0.02, 0.03, 0.35, 8);
        branchGeo.translate(0, 0.15, 0);
        const branch = new THREE.Mesh(branchGeo, tubeMat);
        branch.position.copy(pt);
        branch.rotation.z = (Math.PI / 3) * dir;
        lateralRoots.add(branch);
      }
      chamberRig.add(lateralRoots);
    }

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const s = stateRef.current;
      const playing = isPlayingRef.current;

      // Update Chamber Rotation (0 or 90 degrees)
      const targetChamberRot = (s.boxRotation * Math.PI) / 180;
      chamberRig.rotation.z = THREE.MathUtils.lerp(chamberRig.rotation.z, targetChamberRot, delta * 3);

      // Update Sponge / Water Source Position
      let spongeX = 0;
      let spongeY = -0.9;
      if (s.waterSourcePos === 'left') {
        spongeX = -1.2;
        spongeY = -0.4;
      } else if (s.waterSourcePos === 'right') {
        spongeX = 1.2;
        spongeY = -0.4;
      } else if (s.waterSourcePos === 'bottom') {
        spongeX = 0;
        spongeY = -1.1;
      } else if (s.waterSourcePos === 'center') {
        spongeX = 0;
        spongeY = -0.5;
      }
      spongeGroup.position.set(spongeX, spongeY, 0.05);

      // Target Root Angle:
      // Hydrotropism: bends towards water source (-35 deg for left, +35 deg for right, 0 for bottom)
      // Gravitropism: in upright box (0 deg), gravity pulls downwards.
      // In 90 deg tilted box: gravity exerts lateral force!
      let targetDeg = 0;
      if (s.waterSourcePos === 'left') targetDeg = -38;
      else if (s.waterSourcePos === 'right') targetDeg = 38;
      else if (s.waterSourcePos === 'bottom') targetDeg = 0;

      // If box is rotated 90 deg, gravistimulation competes:
      if (s.boxRotation > 45) {
        // Root wants to bend relative to box to go down in real world
        targetDeg += 25; // gravity pull
      }

      const targetRad = (targetDeg * Math.PI) / 180;
      const growthRate = playing ? 1.6 * s.timeMultiplier * delta : 0.4 * delta;
      currentAngleRef.current += (targetRad - currentAngleRef.current) * Math.min(growthRate, 0.2);

      if (onUpdateRootAngle) {
        onUpdateRootAngle(Math.round(((currentAngleRef.current * 180) / Math.PI) * 10) / 10);
      }

      updateRootGeometry(currentAngleRef.current, s);

      // Pulse halo
      const time = clock.getElapsedTime();
      halo.scale.setScalar(1 + Math.sin(time * 3) * 0.08);

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
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/80 text-xs font-semibold text-emerald-400 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          Hộp Kính Quan Sát Rễ Cây (Rhizotron)
        </div>
        <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300">
          Vị trí nguồn nước: <strong className="text-sky-400 uppercase">{state.waterSourcePos}</strong> | Góc xoay hộp: <strong className="text-amber-400">{state.boxRotation}°</strong>
        </div>
      </div>

      {state.xrayStatoliths && (
        <div className="absolute top-4 right-4 bg-amber-950/80 border border-amber-500/50 backdrop-blur-md px-3 py-2 rounded-xl text-xs text-amber-300 shadow-xl max-w-[260px]">
          <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-400">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            X-Ray: Thạch Lạp (Statoliths)
          </div>
          <p className="text-[11px] leading-relaxed text-amber-200/90">
            Các hạt tinh bột (thạch lạp) tại chóp rễ lắng xuống dưới theo trọng lực, kích hoạt kênh auxin gây ức chế tế bào mặt dưới để rễ cắm xuống, đồng thời cảm nhận độ ẩm để rễ uốn về nguồn nước.
          </p>
        </div>
      )}

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/75 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-700/50 text-[11px] text-slate-400 pointer-events-none">
        🖱️ Giữ chuột trái để xoay 360° • Lăn chuột để phóng to/thu nhỏ
      </div>
    </div>
  );
}
