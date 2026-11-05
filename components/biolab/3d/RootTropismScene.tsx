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
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.025);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 3.0, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.minDistance = 2.5;
    controls.maxDistance = 16;
    controls.target.set(0, 1.6, 0);

    // 2. High Quality Lab Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // Front Key Light illuminating the root chamber directly
    const frontLight = new THREE.DirectionalLight(0xffffff, 1.2);
    frontLight.position.set(0, 4, 7);
    scene.add(frontLight);

    const dirLight = new THREE.DirectionalLight(0xa7f3d0, 0.6);
    dirLight.position.set(4, 8, 4);
    scene.add(dirLight);

    const backFillLight = new THREE.PointLight(0x38bdf8, 0.8, 6);
    backFillLight.position.set(0, 2, -2);
    scene.add(backFillLight);

    // 3. Lab Table & Base
    const tableGeo = new THREE.CylinderGeometry(5.5, 5.8, 0.4, 48);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.6 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = -0.2;
    table.receiveShadow = true;
    scene.add(table);

    const grid = new THREE.GridHelper(9, 18, 0x10b981, 0x1e293b);
    grid.position.y = 0.01;
    scene.add(grid);

    // 4. Observation Chamber (Rhizotron Glass Box with HOLLOW FRAME)
    const chamberRig = new THREE.Group();
    chamberRig.position.set(0, 1.6, 0);
    scene.add(chamberRig);

    // Frame Material (Sleek anodized aluminum frame)
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.3,
    });

    // Top beam (nắp trên có khe thoáng)
    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 0.45), frameMat);
    topBeam.position.set(0, 1.6, 0);
    chamberRig.add(topBeam);

    // Bottom base beam (đế khung)
    const bottomBeam = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.15, 0.5), frameMat);
    bottomBeam.position.set(0, -1.6, 0);
    chamberRig.add(bottomBeam);

    // Left post
    const leftPost = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.2, 0.45), frameMat);
    leftPost.position.set(-1.75, 0, 0);
    chamberRig.add(leftPost);

    // Right post
    const rightPost = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.2, 0.45), frameMat);
    rightPost.position.set(1.75, 0, 0);
    chamberRig.add(rightPost);

    // Dark organic soil backplate (Tấm nền đất mùn phía sau giúp rễ màu sáng nổi bật)
    const soilBackGeo = new THREE.BoxGeometry(3.4, 3.08, 0.15);
    const soilBackMat = new THREE.MeshStandardMaterial({
      color: 0x1c120c,
      roughness: 0.95,
      metalness: 0.05,
    });
    const soilBack = new THREE.Mesh(soilBackGeo, soilBackMat);
    soilBack.position.set(0, 0, -0.1);
    chamberRig.add(soilBack);

    // Transparent front glass plate
    const frontGlassGeo = new THREE.BoxGeometry(3.4, 3.1, 0.03);
    const frontGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transmission: 0.92,
      opacity: 0.85,
      transparent: true,
      roughness: 0.05,
      ior: 1.45,
      depthWrite: false,
    });
    const frontGlass = new THREE.Mesh(frontGlassGeo, frontGlassMat);
    frontGlass.position.set(0, 0, 0.2);
    chamberRig.add(frontGlass);

    // Depth Grid Lines on glass (Thước đo mm nghiên cứu rễ)
    const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.25 });
    for (let gy = -1.2; gy <= 1.2; gy += 0.4) {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-1.6, gy, 0.19),
        new THREE.Vector3(1.6, gy, 0.19),
      ]);
      const line = new THREE.Line(lineGeo, lineMat);
      chamberRig.add(line);
    }

    // 5. Germinated Seedling at Top
    const seedGroup = new THREE.Group();
    seedGroup.position.set(0, 1.25, 0.08);

    // Germinated Bean Seed (Hạt mầm)
    const seedGeo = new THREE.SphereGeometry(0.24, 20, 20);
    seedGeo.scale(1.25, 0.85, 0.85);
    const seedMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.6 });
    const seed = new THREE.Mesh(seedGeo, seedMat);
    seedGroup.add(seed);

    // Green shoot emerging upwards out of the top slot
    const shootGeo = new THREE.CylinderGeometry(0.045, 0.065, 0.55, 12);
    shootGeo.translate(0, 0.3, 0);
    const shootMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 });
    const shoot = new THREE.Mesh(shootGeo, shootMat);
    seedGroup.add(shoot);

    // 2 Cotyledon leaves emerging from shoot
    const leafGeo = new THREE.SphereGeometry(0.22, 12, 12);
    leafGeo.scale(1.6, 0.15, 0.7);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.4 });

    const leafL = new THREE.Mesh(leafGeo, leafMat);
    leafL.position.set(-0.25, 0.55, 0);
    leafL.rotation.z = Math.PI / 6;
    seedGroup.add(leafL);

    const leafR = new THREE.Mesh(leafGeo, leafMat);
    leafR.position.set(0.25, 0.55, 0);
    leafR.rotation.z = -Math.PI / 6;
    seedGroup.add(leafR);

    chamberRig.add(seedGroup);

    // 6. Water Source Sponge (Miếng bọt biển ẩm)
    const spongeGroup = new THREE.Group();
    spongeGroup.position.set(-1.1, -0.4, 0.08);

    const spongeGeo = new THREE.BoxGeometry(0.75, 0.75, 0.18);
    const spongeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.8,
      metalness: 0.1,
    });
    const sponge = new THREE.Mesh(spongeGeo, spongeMat);
    spongeGroup.add(sponge);

    // Moisture diffusion ripple rings
    const rippleGeo = new THREE.RingGeometry(0.42, 0.52, 32);
    const rippleMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });
    const ripple = new THREE.Mesh(rippleGeo, rippleMat);
    ripple.position.z = 0.1;
    spongeGroup.add(ripple);

    chamberRig.add(spongeGroup);

    // 7. Dynamic Root Mesh & Statolith Particles
    let rootMesh: THREE.Mesh | null = null;
    let rootCapMesh: THREE.Mesh | null = null;
    let lateralRoots: THREE.Group | null = null;
    let statolithPoints: THREE.Points | null = null;

    // Statolith particles setup (X-Ray view of root cap amyloplasts)
    const statolithCount = 50;
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
      size: 0.07,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    statolithPoints = new THREE.Points(statolithGeo, statolithMat);
    statolithPoints.visible = false;
    chamberRig.add(statolithPoints);

    // Function to rebuild root geometry
    function updateRootGeometry(angleRad: number, s: HydrotropismState) {
      if (rootMesh) chamberRig.remove(rootMesh);
      if (rootCapMesh) chamberRig.remove(rootCapMesh);
      if (lateralRoots) chamberRig.remove(lateralRoots);

      const length = 2.2;
      // Start at seed bottom: (0, 1.15, 0.08)
      // Tip bends towards angleRad
      const tipX = Math.sin(angleRad) * (length * 0.85);
      const tipY = 1.15 - Math.cos(angleRad) * length;

      const p0 = new THREE.Vector3(0, 1.15, 0.08);
      const p1 = new THREE.Vector3(0, 0.5, 0.08);
      const p2 = new THREE.Vector3(tipX * 0.65, 1.15 - length * 0.65, 0.08);
      const p3 = new THREE.Vector3(tipX, tipY, 0.08);

      const rootCurve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);

      // Tube geometry: Clean, crisp, bright creamy root
      const tubeGeo = new THREE.TubeGeometry(rootCurve, 32, 0.075, 14, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: s.xrayStatoliths ? 0x22d3ee : 0xfef08a,
        emissive: s.xrayStatoliths ? 0x0891b2 : 0xfef08a,
        emissiveIntensity: s.xrayStatoliths ? 0.6 : 0.2,
        roughness: 0.5,
        metalness: 0.1,
        transparent: s.xrayStatoliths,
        opacity: s.xrayStatoliths ? 0.45 : 1.0,
      });

      rootMesh = new THREE.Mesh(tubeGeo, tubeMat);
      rootMesh.castShadow = true;
      chamberRig.add(rootMesh);

      // Root tip cap (Chóp rễ sinh trưởng)
      const capGeo = new THREE.ConeGeometry(0.085, 0.22, 14);
      capGeo.translate(0, -0.11, 0);
      const capMat = new THREE.MeshStandardMaterial({
        color: s.xrayStatoliths ? 0x06b6d4 : 0xeab308,
        emissive: 0xeab308,
        emissiveIntensity: 0.35,
        roughness: 0.4,
      });
      rootCapMesh = new THREE.Mesh(capGeo, capMat);
      rootCapMesh.position.copy(p3);
      rootCapMesh.rotation.z = -angleRad;
      chamberRig.add(rootCapMesh);

      // Statoliths position at root cap
      if (statolithPoints && s.xrayStatoliths) {
        statolithPoints.visible = true;
        statolithPoints.position.copy(p3);
      } else if (statolithPoints) {
        statolithPoints.visible = false;
      }

      // Lateral roots branching towards water
      lateralRoots = new THREE.Group();
      for (let t = 0.3; t <= 0.85; t += 0.14) {
        const pt = rootCurve.getPoint(t);
        const dir = angleRad >= 0 ? 1 : -1;
        const branchGeo = new THREE.CylinderGeometry(0.025, 0.04, 0.42, 8);
        branchGeo.translate(0, 0.2, 0);
        const branch = new THREE.Mesh(branchGeo, tubeMat);
        branch.position.copy(pt);
        branch.rotation.z = (Math.PI / 3) * dir;
        lateralRoots.add(branch);

        // Sub-branch
        const subBranch = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.025, 0.25, 8), tubeMat);
        subBranch.position.set(pt.x + dir * 0.2, pt.y + 0.1, pt.z);
        subBranch.rotation.z = (Math.PI / 2.5) * dir;
        lateralRoots.add(subBranch);
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
      chamberRig.rotation.z = THREE.MathUtils.lerp(chamberRig.rotation.z, targetChamberRot, delta * 3.5);

      // Update Sponge / Water Source Position
      let spongeX = 0;
      let spongeY = -0.9;
      if (s.waterSourcePos === 'left') {
        spongeX = -1.15;
        spongeY = -0.4;
      } else if (s.waterSourcePos === 'right') {
        spongeX = 1.15;
        spongeY = -0.4;
      } else if (s.waterSourcePos === 'bottom') {
        spongeX = 0;
        spongeY = -1.1;
      } else if (s.waterSourcePos === 'center') {
        spongeX = 0;
        spongeY = -0.5;
      }
      spongeGroup.position.set(spongeX, spongeY, 0.08);

      // Target Root Angle:
      let targetDeg = 0;
      if (s.waterSourcePos === 'left') targetDeg = -38;
      else if (s.waterSourcePos === 'right') targetDeg = 38;
      else if (s.waterSourcePos === 'bottom') targetDeg = 0;

      // Gravitropism competition when box is turned 90°:
      if (s.boxRotation > 45) {
        targetDeg += 25; // gravity pulls downwards
      }

      const targetRad = (targetDeg * Math.PI) / 180;
      const growthRate = playing ? 1.6 * s.timeMultiplier * delta : 0.4 * delta;
      currentAngleRef.current += (targetRad - currentAngleRef.current) * Math.min(growthRate, 0.2);

      if (onUpdateRootAngle) {
        onUpdateRootAngle(Math.round(((currentAngleRef.current * 180) / Math.PI) * 10) / 10);
      }

      updateRootGeometry(currentAngleRef.current, s);

      // Animate ripple pulse around moisture sponge
      const time = clock.getElapsedTime();
      ripple.scale.setScalar(1 + Math.sin(time * 3.5) * 0.12);

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
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/80 text-xs font-semibold text-emerald-400 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          Hộp Kính Quan Sát Rễ Cây (Rhizotron 3D)
        </div>
        <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300">
          Nguồn nước ẩm: <strong className="text-sky-400 uppercase">{state.waterSourcePos}</strong> | Góc xoay hộp: <strong className="text-amber-400">{state.boxRotation}°</strong> | Góc uốn rễ: <strong className="text-emerald-400">{Math.round(((currentAngleRef.current * 180) / Math.PI) * 10) / 10}°</strong>
        </div>
      </div>

      {state.xrayStatoliths && (
        <div className="absolute top-4 right-4 bg-amber-950/85 border border-amber-500/60 backdrop-blur-md px-3.5 py-2.5 rounded-2xl text-xs text-amber-300 shadow-2xl max-w-[270px] z-10">
          <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-400">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            X-Ray: Thạch Lạp (Statoliths) Chóp Rễ
          </div>
          <p className="text-[11px] leading-relaxed text-amber-200/90">
            Hạt tinh bột nặng ở tế bào chóp rễ lắng xuống cảm nhận trọng lực, đồng thời thụ thể độ ẩm định hướng dòng auxin ức chế tế bào mặt dưới để rễ uốn về phía có nước.
          </p>
        </div>
      )}

      {/* Moisture source callout badge */}
      <div className="absolute bottom-16 left-4 bg-slate-900/90 border border-sky-500/40 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs text-slate-200 shadow-xl flex items-center gap-2.5">
        <span className="text-xl">💧</span>
        <div>
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Nguồn ẩm hoạt động</div>
          <div className="text-xs font-bold text-sky-300">
            {state.waterSourcePos === 'left' ? 'Bên trái (Rễ uốn trái)' : state.waterSourcePos === 'right' ? 'Bên phải (Rễ uốn phải)' : 'Đáy chậu (Rễ cắm thẳng)'}
          </div>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/75 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-700/50 text-[11px] text-slate-400 pointer-events-none">
        🖱️ Giữ chuột trái để xoay 360° • Lăn chuột để zoom cận cảnh rễ
      </div>
    </div>
  );
}
