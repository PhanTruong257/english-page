'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HydrotropismState } from '../types';
import { setupLabEnvironment } from './LabEnvironment';

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

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 3.2, 7.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.02;
    controls.minDistance = 2.5;
    controls.maxDistance = 16;
    controls.target.set(0, 1.6, 0);

    // 2. Setup Realistic Bright Laboratory Environment
    setupLabEnvironment(scene);

    // 3. Observation Chamber Swivel Stand (Giá xoay hộp rễ thí nghiệm)
    const standBaseGroup = new THREE.Group();
    scene.add(standBaseGroup);

    // Heavy Aluminum Desktop Stand Base
    const standBase = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.3, 0.12, 36),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.3 })
    );
    standBase.position.y = 0.06;
    standBase.castShadow = true;
    standBase.receiveShadow = true;
    standBaseGroup.add(standBase);

    // Center Swivel Column
    const centerColumn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.15, 1.6, 24),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 })
    );
    centerColumn.position.set(0, 0.85, -0.4);
    centerColumn.castShadow = true;
    standBaseGroup.add(centerColumn);

    // Protractor Angle Scale on Swivel
    const dialPlate = new THREE.Mesh(
      new THREE.CircleGeometry(0.45, 32),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.3 })
    );
    dialPlate.position.set(0, 1.6, -0.32);
    standBaseGroup.add(dialPlate);

    // 4. Observation Chamber (Rhizotron Glass Sandwich Box)
    const chamberRig = new THREE.Group();
    chamberRig.position.set(0, 1.6, 0);
    scene.add(chamberRig);

    // Frame Material (Sleek anodized aluminum frame)
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.85,
      roughness: 0.25,
    });

    // Top beam with seedling access slot
    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 0.45), frameMat);
    topBeam.position.set(0, 1.6, 0);
    topBeam.castShadow = true;
    chamberRig.add(topBeam);

    // Bottom base beam
    const bottomBeam = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.15, 0.5), frameMat);
    bottomBeam.position.set(0, -1.6, 0);
    bottomBeam.castShadow = true;
    chamberRig.add(bottomBeam);

    // Left and Right Posts
    const leftPost = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.2, 0.45), frameMat);
    leftPost.position.set(-1.75, 0, 0);
    leftPost.castShadow = true;
    chamberRig.add(leftPost);

    const rightPost = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.2, 0.45), frameMat);
    rightPost.position.set(1.75, 0, 0);
    rightPost.castShadow = true;
    chamberRig.add(rightPost);

    // Corner wing-nut bolts (ốc vít cố định bản kính)
    const boltPositions = [
      [-1.65, 1.5, 0.22],
      [1.65, 1.5, 0.22],
      [-1.65, -1.5, 0.22],
      [1.65, -1.5, 0.22],
    ];
    boltPositions.forEach(([bx, by, bz]) => {
      const bolt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 0.08, 12),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.2 })
      );
      bolt.rotation.x = Math.PI / 2;
      bolt.position.set(bx, by, bz);
      chamberRig.add(bolt);
    });

    // Dark Organic Soil Contrast Backplate
    const soilBackGeo = new THREE.BoxGeometry(3.4, 3.08, 0.12);
    const soilBackMat = new THREE.MeshStandardMaterial({
      color: 0x1c120c,
      roughness: 0.95,
      metalness: 0.05,
    });
    const soilBack = new THREE.Mesh(soilBackGeo, soilBackMat);
    soilBack.position.set(0, 0, -0.08);
    chamberRig.add(soilBack);

    // Crystal Clear Front Glass Plate
    const frontGlassGeo = new THREE.BoxGeometry(3.4, 3.1, 0.03);
    const frontGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.95,
      opacity: 0.85,
      transparent: true,
      roughness: 0.04,
      ior: 1.48,
      depthWrite: false,
    });
    const frontGlass = new THREE.Mesh(frontGlassGeo, frontGlassMat);
    frontGlass.position.set(0, 0, 0.18);
    chamberRig.add(frontGlass);

    // Precision Millimeter / Centimeter Metric Grid Lines printed on glass
    const gridLineMat = new THREE.LineBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.35 });
    for (let gy = -1.2; gy <= 1.2; gy += 0.3) {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-1.6, gy, 0.17),
        new THREE.Vector3(1.6, gy, 0.17),
      ]);
      const line = new THREE.Line(lineGeo, gridLineMat);
      chamberRig.add(line);
    }
    for (let gx = -1.5; gx <= 1.5; gx += 0.3) {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(gx, -1.4, 0.17),
        new THREE.Vector3(gx, 1.4, 0.17),
      ]);
      const line = new THREE.Line(lineGeo, gridLineMat);
      chamberRig.add(line);
    }

    // 5. Germinated Bean Seedling at Top
    const seedGroup = new THREE.Group();
    seedGroup.position.set(0, 1.25, 0.08);

    // Plump Bean Seed (Hạt mầm đậu)
    const seedGeo = new THREE.SphereGeometry(0.24, 20, 20);
    seedGeo.scale(1.25, 0.85, 0.85);
    const seedMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.55 });
    const seed = new THREE.Mesh(seedGeo, seedMat);
    seed.castShadow = true;
    seedGroup.add(seed);

    // Green shoot emerging upwards
    const shootGeo = new THREE.CylinderGeometry(0.045, 0.065, 0.55, 12);
    shootGeo.translate(0, 0.3, 0);
    const shootMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.45 });
    const shoot = new THREE.Mesh(shootGeo, shootMat);
    shoot.castShadow = true;
    seedGroup.add(shoot);

    // 2 Bright green embryonic leaves
    const leafGeo = new THREE.SphereGeometry(0.22, 12, 12);
    leafGeo.scale(1.6, 0.15, 0.7);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.4 });

    const leafL = new THREE.Mesh(leafGeo, leafMat);
    leafL.position.set(-0.25, 0.55, 0);
    leafL.rotation.z = Math.PI / 5;
    leafL.castShadow = true;
    seedGroup.add(leafL);

    const leafR = new THREE.Mesh(leafGeo, leafMat);
    leafR.position.set(0.25, 0.55, 0);
    leafR.rotation.z = -Math.PI / 5;
    leafR.castShadow = true;
    seedGroup.add(leafR);

    chamberRig.add(seedGroup);

    // 6. Water Source Sponge (Miếng bọt biển ẩm)
    const spongeGroup = new THREE.Group();
    spongeGroup.position.set(-1.15, -0.4, 0.08);

    const spongeGeo = new THREE.BoxGeometry(0.75, 0.75, 0.16);
    const spongeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.8,
      metalness: 0.1,
    });
    const sponge = new THREE.Mesh(spongeGeo, spongeMat);
    sponge.castShadow = true;
    spongeGroup.add(sponge);

    // Moisture diffusion ripple rings
    const rippleGeo = new THREE.RingGeometry(0.42, 0.54, 32);
    const rippleMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const ripple = new THREE.Mesh(rippleGeo, rippleMat);
    ripple.position.z = 0.09;
    spongeGroup.add(ripple);

    chamberRig.add(spongeGroup);

    // 7. Dynamic Root Mesh & Statolith Particles
    let rootMesh: THREE.Mesh | null = null;
    let rootCapMesh: THREE.Mesh | null = null;
    let lateralRoots: THREE.Group | null = null;
    let statolithPoints: THREE.Points | null = null;

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
      size: 0.08,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    statolithPoints = new THREE.Points(statolithGeo, statolithMat);
    statolithPoints.visible = false;
    chamberRig.add(statolithPoints);

    function updateRootGeometry(angleRad: number, s: HydrotropismState) {
      if (rootMesh) chamberRig.remove(rootMesh);
      if (rootCapMesh) chamberRig.remove(rootCapMesh);
      if (lateralRoots) chamberRig.remove(lateralRoots);

      const length = 2.2;
      const tipX = Math.sin(angleRad) * (length * 0.85);
      const tipY = 1.15 - Math.cos(angleRad) * length;

      const p0 = new THREE.Vector3(0, 1.15, 0.08);
      const p1 = new THREE.Vector3(0, 0.5, 0.08);
      const p2 = new THREE.Vector3(tipX * 0.65, 1.15 - length * 0.65, 0.08);
      const p3 = new THREE.Vector3(tipX, tipY, 0.08);

      const rootCurve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);

      const tubeGeo = new THREE.TubeGeometry(rootCurve, 32, 0.075, 14, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: s.xrayStatoliths ? 0x06b6d4 : 0xfef08a,
        emissive: s.xrayStatoliths ? 0x0891b2 : 0xfde047,
        emissiveIntensity: s.xrayStatoliths ? 0.6 : 0.25,
        roughness: 0.45,
        metalness: 0.05,
        transparent: s.xrayStatoliths,
        opacity: s.xrayStatoliths ? 0.45 : 1.0,
      });

      rootMesh = new THREE.Mesh(tubeGeo, tubeMat);
      rootMesh.castShadow = true;
      chamberRig.add(rootMesh);

      // Root tip cap (Chóp rễ)
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

      const targetChamberRot = (s.boxRotation * Math.PI) / 180;
      chamberRig.rotation.z = THREE.MathUtils.lerp(chamberRig.rotation.z, targetChamberRot, delta * 3.5);

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

      let targetDeg = 0;
      if (s.waterSourcePos === 'left') targetDeg = -38;
      else if (s.waterSourcePos === 'right') targetDeg = 38;
      else if (s.waterSourcePos === 'bottom') targetDeg = 0;

      if (s.boxRotation > 45) {
        targetDeg += 25;
      }

      const targetRad = (targetDeg * Math.PI) / 180;
      const growthRate = playing ? 1.6 * s.timeMultiplier * delta : 0.4 * delta;
      currentAngleRef.current += (targetRad - currentAngleRef.current) * Math.min(growthRate, 0.2);

      if (onUpdateRootAngle) {
        onUpdateRootAngle(Math.round(((currentAngleRef.current * 180) / Math.PI) * 10) / 10);
      }

      updateRootGeometry(currentAngleRef.current, s);

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
    <div className="relative w-full h-full min-h-[480px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-300 shadow-xl">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D HUD Badges */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-emerald-700 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          Phòng Thí Nghiệm Sinh Học • Mô Hình Hướng Nước & Rễ
        </div>
        <div className="bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] text-slate-700 shadow-sm">
          Nguồn nước ẩm: <strong className="text-sky-600 uppercase">{state.waterSourcePos}</strong> | Góc xoay hộp: <strong className="text-amber-600">{state.boxRotation}°</strong> | Góc uốn rễ: <strong className="text-emerald-600">{Math.round(((currentAngleRef.current * 180) / Math.PI) * 10) / 10}°</strong>
        </div>
      </div>

      {state.xrayStatoliths && (
        <div className="absolute top-4 right-4 bg-amber-50/95 border border-amber-300 backdrop-blur-md px-3.5 py-2.5 rounded-2xl text-xs text-amber-900 shadow-lg max-w-[270px] z-10">
          <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-700">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            X-Ray: Thạch Lạp (Statoliths) Chóp Rễ
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800">
            Hạt tinh bột nặng ở tế bào chóp rễ lắng xuống cảm nhận trọng lực, đồng thời thụ thể độ ẩm định hướng auxin ức chế tế bào mặt dưới để rễ uốn về phía có nước.
          </p>
        </div>
      )}

      {/* Moisture source callout badge */}
      <div className="absolute bottom-16 left-4 bg-white/95 border border-sky-300 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs text-slate-800 shadow-md flex items-center gap-2.5">
        <span className="text-xl">💧</span>
        <div>
          <div className="text-[10px] text-slate-500 font-semibold uppercase">Nguồn ẩm hoạt động</div>
          <div className="text-xs font-bold text-sky-700">
            {state.waterSourcePos === 'left' ? 'Bên trái (Rễ uốn trái)' : state.waterSourcePos === 'right' ? 'Bên phải (Rễ uốn phải)' : 'Đáy chậu (Rễ cắm thẳng)'}
          </div>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-300 text-[11px] text-slate-600 pointer-events-none shadow-sm">
        🖱️ Giữ chuột trái để xoay 360° • Lăn chuột để zoom cận cảnh rễ
      </div>
    </div>
  );
}
