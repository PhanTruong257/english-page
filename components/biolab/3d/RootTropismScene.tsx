'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HydrotropismState } from '../types';
import { setupLabEnvironment } from './LabEnvironment';

interface Props {
  state: HydrotropismState;
  onUpdateState?: (updater: (prev: HydrotropismState) => HydrotropismState) => void;
  onUpdateRootAngle?: (angle: number) => void;
  isPlaying: boolean;
}

export default function RootTropismScene({ state, onUpdateState, onUpdateRootAngle, isPlaying }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentAngleRef = useRef(0);
  const [isWaterControlOpen, setIsWaterControlOpen] = useState(false);
  const [isHoveringSponge, setIsHoveringSponge] = useState(false);

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

    // Outer Hollow Frame bars (Top, Bottom, Left, Right)
    const frameThickness = 0.12;
    const boxW = 3.6;
    const boxH = 3.4;
    const boxD = 0.42;

    const topBar = new THREE.Mesh(new THREE.BoxGeometry(boxW, frameThickness, boxD), frameMat);
    topBar.position.y = boxH / 2;
    topBar.castShadow = true;
    chamberRig.add(topBar);

    const btmBar = new THREE.Mesh(new THREE.BoxGeometry(boxW, frameThickness, boxD), frameMat);
    btmBar.position.y = -boxH / 2;
    btmBar.castShadow = true;
    chamberRig.add(btmBar);

    const leftBar = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, boxH, boxD), frameMat);
    leftBar.position.x = -boxW / 2;
    leftBar.castShadow = true;
    chamberRig.add(leftBar);

    const rightBar = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, boxH, boxD), frameMat);
    rightBar.position.x = boxW / 2;
    rightBar.castShadow = true;
    chamberRig.add(rightBar);

    // Corner Knurled Fastening Screws
    const screwMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.2 });
    const screwGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.46, 16);
    screwGeo.rotateX(Math.PI / 2);

    const screwOffsets = [
      [-boxW / 2 + 0.18, boxH / 2 - 0.18],
      [boxW / 2 - 0.18, boxH / 2 - 0.18],
      [-boxW / 2 + 0.18, -boxH / 2 + 0.18],
      [boxW / 2 - 0.18, -boxH / 2 + 0.18],
    ];
    screwOffsets.forEach(([sx, sy]) => {
      const screw = new THREE.Mesh(screwGeo, screwMat);
      screw.position.set(sx, sy, 0);
      chamberRig.add(screw);
    });

    // Dark Peat / Moist Agar Contrast Backplate inside chamber
    const backplateGeo = new THREE.BoxGeometry(3.36, 3.16, 0.04);
    const backplateMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.92,
      metalness: 0.05,
    });
    const backplate = new THREE.Mesh(backplateGeo, backplateMat);
    backplate.position.set(0, 0, -0.08);
    chamberRig.add(backplate);

    // Front Ultra-Clear Glass Viewing Pane (Borosilicate viewing window)
    const glassPaneGeo = new THREE.BoxGeometry(3.36, 3.16, 0.03);
    const glassPaneMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.95,
      opacity: 1,
      transparent: true,
      roughness: 0.03,
      ior: 1.5,
      thickness: 0.2,
    });
    const glassPane = new THREE.Mesh(glassPaneGeo, glassPaneMat);
    glassPane.position.set(0, 0, 0.18);
    chamberRig.add(glassPane);

    // Metric Graduation Grid Lines (1cm squares for scientific root tracking)
    const gridLineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
    });
    for (let gy = -1.4; gy <= 1.4; gy += 0.35) {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-1.55, gy, 0.17),
        new THREE.Vector3(1.55, gy, 0.17),
      ]);
      const line = new THREE.Line(lineGeo, gridLineMat);
      chamberRig.add(line);
    }
    for (let gx = -1.4; gx <= 1.4; gx += 0.35) {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(gx, -1.4, 0.17),
        new THREE.Vector3(gx, 1.4, 0.17),
      ]);
      const line = new THREE.Line(lineGeo, gridLineMat);
      chamberRig.add(line);
    }

    // 5. Germinated Bean Seedling at Top (Botanical realism with split cotyledons)
    const seedGroup = new THREE.Group();
    seedGroup.position.set(0, 1.25, 0.08);

    // Split Bean Seed: 2 plump cotyledon halves (Hạt đậu nở nứt vỏ tự nhiên)
    const seedHalfGeo = new THREE.SphereGeometry(0.22, 20, 20);
    seedHalfGeo.scale(1.3, 0.82, 0.55);
    const seedMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.45 });

    const seedLeft = new THREE.Mesh(seedHalfGeo, seedMat);
    seedLeft.position.set(-0.06, 0, 0);
    seedLeft.rotation.z = 0.15;
    seedLeft.castShadow = true;
    seedGroup.add(seedLeft);

    const seedRight = new THREE.Mesh(seedHalfGeo, seedMat);
    seedRight.position.set(0.06, 0, 0);
    seedRight.rotation.z = -0.15;
    seedRight.castShadow = true;
    seedGroup.add(seedRight);

    // Pale Embryo Core emerging from split
    const embryoGeo = new THREE.SphereGeometry(0.12, 16, 16);
    embryoGeo.scale(0.8, 1.2, 0.8);
    const embryoMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.5 });
    const embryo = new THREE.Mesh(embryoGeo, embryoMat);
    embryo.position.set(0, -0.04, 0.04);
    seedGroup.add(embryo);

    // Green shoot emerging upwards
    const shootGeo = new THREE.CylinderGeometry(0.042, 0.065, 0.55, 16);
    shootGeo.translate(0, 0.3, 0);
    const shootMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 });
    const shoot = new THREE.Mesh(shootGeo, shootMat);
    shoot.castShadow = true;
    seedGroup.add(shoot);

    // 2 Bright green embryonic leaves with curved cupping
    const leafGeo = new THREE.SphereGeometry(0.24, 16, 16);
    leafGeo.scale(1.5, 0.14, 0.75);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.35 });

    const leafL = new THREE.Mesh(leafGeo, leafMat);
    leafL.position.set(-0.24, 0.55, 0);
    leafL.rotation.z = Math.PI / 5;
    leafL.castShadow = true;
    seedGroup.add(leafL);

    const leafR = new THREE.Mesh(leafGeo, leafMat);
    leafR.position.set(0.24, 0.55, 0);
    leafR.rotation.z = -Math.PI / 5;
    leafR.castShadow = true;
    seedGroup.add(leafR);

    chamberRig.add(seedGroup);

    // 6. Water Source Sponge (Interactive sponge)
    const spongeGroup = new THREE.Group();
    spongeGroup.position.set(-1.15, -0.4, 0.08);

    const spongeGeo = new THREE.BoxGeometry(0.75, 0.75, 0.16);
    const spongeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.75,
      metalness: 0.1,
    });
    const sponge = new THREE.Mesh(spongeGeo, spongeMat);
    sponge.castShadow = true;
    sponge.userData = { isSponge: true };
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
    let rootHairsGroup: THREE.Group | null = null;
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

    // Botanical Tapered Taproot Geometry with distinct Root Cap & Root Hairs
    function updateRootGeometry(angleRad: number, s: HydrotropismState) {
      if (rootMesh) chamberRig.remove(rootMesh);
      if (rootCapMesh) chamberRig.remove(rootCapMesh);
      if (rootHairsGroup) chamberRig.remove(rootHairsGroup);

      const length = 2.2;
      const tipX = Math.sin(angleRad) * (length * 0.85);
      const tipY = 1.15 - Math.cos(angleRad) * length;

      const p0 = new THREE.Vector3(0, 1.15, 0.08);
      const p1 = new THREE.Vector3(0, 0.5, 0.08);
      const p2 = new THREE.Vector3(tipX * 0.65, 1.15 - length * 0.65, 0.08);
      const p3 = new THREE.Vector3(tipX, tipY, 0.08);

      const rootCurve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);

      // Tapered Taproot Mesh (từ gốc dày r=0.085 vuốt nhọn dần tới r=0.038)
      const segments = 36;
      const radialSegments = 14;
      const frames = rootCurve.computeFrenetFrames(segments, false);
      const vertices: number[] = [];
      const indices: number[] = [];
      const normals: number[] = [];

      for (let i = 0; i <= segments; i++) {
        const u = i / segments;
        const pt = rootCurve.getPointAt(u);
        const N = frames.normals[i];
        const B = frames.binormals[i];
        const radius = 0.085 - (u * 0.048);

        for (let j = 0; j <= radialSegments; j++) {
          const v = j / radialSegments;
          const theta = v * Math.PI * 2;
          const normal = new THREE.Vector3()
            .copy(N).multiplyScalar(Math.cos(theta))
            .addScaledVector(B, Math.sin(theta))
            .normalize();

          const vertex = new THREE.Vector3().copy(pt).addScaledVector(normal, radius);
          vertices.push(vertex.x, vertex.y, vertex.z);
          normals.push(normal.x, normal.y, normal.z);
        }
      }

      for (let i = 0; i < segments; i++) {
        for (let j = 0; j < radialSegments; j++) {
          const a = i * (radialSegments + 1) + j;
          const b = (i + 1) * (radialSegments + 1) + j;
          const c = (i + 1) * (radialSegments + 1) + (j + 1);
          const d = i * (radialSegments + 1) + (j + 1);
          indices.push(a, b, d);
          indices.push(b, c, d);
        }
      }

      const rootGeo = new THREE.BufferGeometry();
      rootGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      rootGeo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
      rootGeo.setIndex(indices);

      const rootMat = new THREE.MeshStandardMaterial({
        color: s.xrayStatoliths ? 0x06b6d4 : 0xfef08a,
        roughness: 0.35,
        metalness: 0.05,
        transparent: s.xrayStatoliths,
        opacity: s.xrayStatoliths ? 0.45 : 1.0,
      });

      rootMesh = new THREE.Mesh(rootGeo, rootMat);
      rootMesh.castShadow = true;
      chamberRig.add(rootMesh);

      // Distinct Meristematic Root Cap (Calyptra - Chóp rễ màu ngà vàng bảo vệ mô phân sinh)
      const capGeo = new THREE.ConeGeometry(0.045, 0.22, 16);
      capGeo.translate(0, -0.1, 0);
      const capMat = new THREE.MeshStandardMaterial({
        color: s.xrayStatoliths ? 0x38bdf8 : 0xfde047,
        roughness: 0.3,
      });
      rootCapMesh = new THREE.Mesh(capGeo, capMat);
      rootCapMesh.position.copy(p3);

      const tangent = rootCurve.getTangent(1);
      const axis = new THREE.Vector3(0, -1, 0);
      rootCapMesh.quaternion.setFromUnitVectors(axis, tangent);
      chamberRig.add(rootCapMesh);

      // Delicate Root Hairs (Lông hút li ti tỏa ra ở vùng trưởng thành)
      rootHairsGroup = new THREE.Group();
      const hairMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.65,
      });

      for (let h = 0.25; h <= 0.65; h += 0.04) {
        const hPt = rootCurve.getPoint(h);
        for (let side of [-1, 1]) {
          const hairGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(hPt.x, hPt.y, 0.08),
            new THREE.Vector3(hPt.x + side * (0.08 + Math.random() * 0.06), hPt.y + (Math.random() - 0.5) * 0.04, 0.08),
          ]);
          const hairLine = new THREE.Line(hairGeo, hairMat);
          rootHairsGroup.add(hairLine);
        }
      }
      chamberRig.add(rootHairsGroup);

      // Statolith particles in root cap
      if (statolithPoints && s.xrayStatoliths) {
        statolithPoints.visible = true;
        statolithPoints.position.copy(p3);
      } else if (statolithPoints) {
        statolithPoints.visible = false;
      }
    }

    // Direct Raycaster for Interactive Sponge & Chamber
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(sponge, true);
      if (intersects.length > 0) {
        renderer.domElement.style.cursor = 'pointer';
        setIsHoveringSponge(true);
      } else {
        renderer.domElement.style.cursor = 'default';
        setIsHoveringSponge(false);
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(sponge, true);
      if (intersects.length > 0) {
        setIsWaterControlOpen((prev) => !prev);
      }
    };

    renderer.domElement.addEventListener('mousemove', handlePointerMove);
    renderer.domElement.addEventListener('click', handlePointerDown);

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
      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handlePointerDown);
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

      {/* Direct Interactive Water & Chamber Toggle Button */}
      <button
        onClick={() => setIsWaterControlOpen((prev) => !prev)}
        className={`absolute top-4 right-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded-2xl font-bold text-xs shadow-lg backdrop-blur-md transition-all cursor-pointer ${
          isWaterControlOpen
            ? 'bg-sky-500 text-white ring-4 ring-sky-500/20'
            : isHoveringSponge
            ? 'bg-sky-100 text-sky-900 border-2 border-sky-400 scale-105'
            : 'bg-white/95 text-slate-800 border border-slate-200 hover:bg-sky-50 hover:text-sky-800'
        }`}
      >
        <span className="text-base animate-pulse">💧</span>
        <span>{isWaterControlOpen ? 'Đang chỉnh Nước/Hộp' : 'Thao tác Nguồn Nước & Hộp'}</span>
      </button>

      {/* DIRECT WATER & CHAMBER INTERACTIVE CONTROL POPUP OVERLAY */}
      {isWaterControlOpen && onUpdateState && (
        <div className="absolute top-16 right-4 z-30 w-80 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl p-4 shadow-2xl text-slate-800 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-sm font-bold">
                💧
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">Điều Khiển Nguồn Ẩm & Hộp Rễ</h4>
                <p className="text-[10px] text-slate-500">Chuyển nguồn nước & xoay trọng lực</p>
              </div>
            </div>
            <button
              onClick={() => setIsWaterControlOpen(false)}
              className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center text-xs transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* 1. Water Source Position */}
          <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <label className="text-xs font-bold text-slate-700">Vị trí đặt nguồn cấp ẩm (Miếng bọt biển)</label>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {[
                { id: 'left', label: 'Bên trái 💧' },
                { id: 'bottom', label: 'Ở đáy chậu' },
                { id: 'right', label: 'Bên phải 💧' },
              ].map((pos) => (
                <button
                  key={pos.id}
                  onClick={() =>
                    onUpdateState((prev) => ({
                      ...prev,
                      waterSourcePos: pos.id as HydrotropismState['waterSourcePos'],
                    }))
                  }
                  className={`py-1.5 px-1 rounded-xl text-[11px] border transition cursor-pointer font-bold ${
                    state.waterSourcePos === pos.id
                      ? 'bg-sky-500 text-white border-sky-600 shadow-xs ring-2 ring-sky-500/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Rotate Chamber 90 Degrees */}
          <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Xoay hộp Rhizotron (Trọng lực)</span>
              <span className="font-mono text-amber-700 font-extrabold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs">
                {state.boxRotation}°
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onUpdateState((prev) => ({ ...prev, boxRotation: 0 }))}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  state.boxRotation === 0
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Thẳng đứng (0°)
              </button>
              <button
                onClick={() => onUpdateState((prev) => ({ ...prev, boxRotation: 90 }))}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  state.boxRotation === 90
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Xoay ngang (90°)
              </button>
            </div>
          </div>
        </div>
      )}

      {state.xrayStatoliths && (
        <div className="absolute top-16 left-4 bg-amber-50/95 border border-amber-300 backdrop-blur-md px-3.5 py-2.5 rounded-2xl text-xs text-amber-900 shadow-lg max-w-[270px] z-10">
          <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-700">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            X-Ray: Thạch Lạp (Statoliths) Chóp Rễ
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800">
            Hạt tinh bột nặng chìm xuống đáy tế bào theo gia tốc trọng trường, kích hoạt phân phối Auxin để rễ luôn cong xuống đất.
          </p>
        </div>
      )}

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/85 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-300 text-[11px] text-slate-600 pointer-events-none shadow-sm flex items-center gap-2">
        <span>💧 <strong>Mẹo:</strong> Nhấp vào miếng bọt biển ẩm để đổi nguồn nước</span>
        <span>•</span>
        <span>🖱️ Giữ chuột trái để xoay 360°</span>
      </div>
    </div>
  );
}
