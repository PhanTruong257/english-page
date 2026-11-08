'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PhotosynthesisState } from '../types';
import { setupLabEnvironment } from './LabEnvironment';

interface Props {
  state: PhotosynthesisState;
  onUpdateState?: (updater: (prev: PhotosynthesisState) => PhotosynthesisState) => void;
  onUpdateBubbleRate?: (bpm: number, volume: number) => void;
  onOpenInquiry?: () => void;
  isPlaying: boolean;
}

export default function PhotosynthesisScene({
  state,
  onUpdateState,
  onUpdateBubbleRate,
  onOpenInquiry,
  isPlaying,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const collectedVolRef = useRef(state.collectedO2Volume);
  collectedVolRef.current = state.collectedO2Volume;

  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Darkroom Mode state (Default TRUE for high-contrast directional beam & atmospheric glow)
  const [isDarkroom, setIsDarkroom] = useState<boolean>(true);
  const darkroomRef = useRef<boolean>(true);
  darkroomRef.current = isDarkroom;

  // Environment Controller Ref
  const envControllerRef = useRef<{ setDarkroom: (dark: boolean) => void } | null>(null);

  // Anatomical Callout Pins Toggle
  const [showAnatomy, setShowAnatomy] = useState<boolean>(false);
  const showAnatomyRef = useRef<boolean>(false);
  showAnatomyRef.current = showAnatomy;

  // Direct Interactive Lamp Control Modal / Popover
  const [isLampControlOpen, setIsLampControlOpen] = useState(false);

  // Camera View Mode
  const [cameraView, setCameraView] = useState<'overview' | 'closeup'>('overview');

  const switchCameraView = (view: 'overview' | 'closeup') => {
    setCameraView(view);
    if (!controlsRef.current || !cameraRef.current) return;
    if (view === 'closeup') {
      cameraRef.current.position.set(0, 2.3, 3.8);
      controlsRef.current.target.set(0, 2.0, 0);
    } else {
      cameraRef.current.position.set(0, 3.8, 8.2);
      controlsRef.current.target.set(0, 1.8, 0);
    }
    controlsRef.current.update();
  };

  const toggleDarkroom = () => {
    const nextVal = !isDarkroom;
    setIsDarkroom(nextVal);
    darkroomRef.current = nextVal;
    if (envControllerRef.current) {
      envControllerRef.current.setDarkroom(nextVal);
    }
  };

  const triggerSplintTest = () => {
    if (!onUpdateState) return;
    onUpdateState((prev) => ({
      ...prev,
      glowingSplintActive: true,
      splintBurstEffect: prev.collectedO2Volume >= 25,
    }));
    setTimeout(() => {
      onUpdateState((prev) => ({
        ...prev,
        glowingSplintActive: false,
        splintBurstEffect: false,
      }));
    }, 4500);
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
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.02;
    controls.minDistance = 2.0;
    controls.maxDistance = 16;
    controls.target.set(0, 1.8, 0);
    controlsRef.current = controls;

    // 2. Setup Realistic Biology Laboratory Environment (Darkroom mode default)
    const env = setupLabEnvironment(scene, { isDarkroom: darkroomRef.current });
    envControllerRef.current = env;

    // 3. Heavy Lab Retort Stand (Giá đỡ sắt thí nghiệm vững chãi)
    const standGroup = new THREE.Group();
    standGroup.position.set(1.55, 0, 0);
    scene.add(standGroup);

    // Cast Iron Heavy Base Plate
    const standBase = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.12, 1.0),
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.85,
        roughness: 0.35,
      })
    );
    standBase.position.y = 0.06;
    standBase.castShadow = true;
    standBase.receiveShadow = true;
    standGroup.add(standBase);

    // Vertical Stainless Steel Upright Rod
    const standRod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 4.0, 24),
      new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.95,
        roughness: 0.15,
      })
    );
    standRod.position.set(-0.48, 2.05, 0);
    standRod.castShadow = true;
    standGroup.add(standRod);

    // Boss Head (Khóa nối chữ thập)
    const bossHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.85, roughness: 0.25 })
    );
    bossHead.position.set(-0.48, 2.75, 0);
    standGroup.add(bossHead);

    // Extension Clamp Arm
    const clampArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 1.15, 16),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })
    );
    clampArm.rotation.z = Math.PI / 2;
    clampArm.position.set(-1.05, 2.75, 0);
    standGroup.add(clampArm);

    // 3-Prong Rubber-Lined Retort Clamp jaws
    const clampRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.035, 16, 32),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.3 })
    );
    clampRing.rotation.x = Math.PI / 2;
    clampRing.position.set(-1.55, 2.75, 0);
    standGroup.add(clampRing);

    // Rubber cushion lining pads on clamp
    const rubberCushion = new THREE.Mesh(
      new THREE.TorusGeometry(0.29, 0.02, 12, 24),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 })
    );
    rubberCushion.rotation.x = Math.PI / 2;
    rubberCushion.position.set(-1.55, 2.75, 0);
    standGroup.add(rubberCushion);

    // 4. Laboratory Beaker & Optical Water Tank (Cốc thủy tinh chịu nhiệt Borosilicate 1000ml)
    const beakerGroup = new THREE.Group();
    beakerGroup.position.set(0, 0, 0);
    scene.add(beakerGroup);

    // Borosilicate Glass Material (Ultra-realistic glass shader)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.96,
      opacity: 1,
      transparent: true,
      roughness: 0.03,
      ior: 1.52,
      thickness: 0.4,
      reflectivity: 0.6,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });

    // Glass Beaker Cylindrical Body (Bình thủy tinh trụ chia vạch)
    const beakerRadius = 1.25;
    const beakerHeight = 2.85;
    const beakerGeo = new THREE.CylinderGeometry(beakerRadius, beakerRadius * 0.97, beakerHeight, 48, 1, true);
    const beaker = new THREE.Mesh(beakerGeo, glassMat);
    beaker.position.y = beakerHeight / 2 + 0.04;
    beaker.castShadow = true;
    beakerGroup.add(beaker);

    // Thick Beaker Bottom Rim
    const beakerBottomGeo = new THREE.CylinderGeometry(beakerRadius * 0.97, beakerRadius * 0.97, 0.08, 48);
    const beakerBottom = new THREE.Mesh(beakerBottomGeo, glassMat);
    beakerBottom.position.y = 0.04;
    beakerBottom.receiveShadow = true;
    beakerGroup.add(beakerBottom);

    // Top Rolled Glass Rim Lip
    const beakerRimGeo = new THREE.TorusGeometry(beakerRadius, 0.035, 16, 48);
    beakerRimGeo.rotateX(Math.PI / 2);
    const beakerRim = new THREE.Mesh(beakerRimGeo, glassMat);
    beakerRim.position.y = beakerHeight + 0.04;
    beakerGroup.add(beakerRim);

    // Printed White Graduation Marks on Glass Beaker (200ml - 1000ml)
    const beakerMarkMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    });

    for (let ml = 200; ml <= 1000; ml += 200) {
      const markY = 0.35 + (ml / 1000) * 2.2;
      const arcWidth = ml % 400 === 0 ? 0.35 : 0.2;
      const markArcGeo = new THREE.BufferGeometry();
      const markPoints: THREE.Vector3[] = [];
      for (let a = -arcWidth; a <= arcWidth; a += 0.05) {
        const mx = Math.sin(a) * (beakerRadius + 0.005);
        const mz = Math.cos(a) * (beakerRadius + 0.005);
        markPoints.push(new THREE.Vector3(mx, markY, mz));
      }
      markArcGeo.setFromPoints(markPoints);
      const markLine = new THREE.Line(markArcGeo, beakerMarkMat);
      beakerGroup.add(markLine);
    }

    // Submerged Water Body (Dung dịch đệm NaHCO3 trong suốt có ánh xanh ngọc dịu)
    const waterHeight = beakerHeight * 0.88;
    const waterRadius = beakerRadius * 0.96;
    const waterGeo = new THREE.CylinderGeometry(waterRadius, waterRadius * 0.98, waterHeight, 48);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: 0.92,
      opacity: 0.75,
      transparent: true,
      roughness: 0.02,
      ior: 1.333,
      thickness: 0.5,
      depthWrite: false,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = waterHeight / 2 + 0.08;
    beakerGroup.add(water);

    // Upper Water Meniscus Ring
    const meniscusGeo = new THREE.TorusGeometry(waterRadius, 0.025, 12, 48);
    meniscusGeo.rotateX(Math.PI / 2);
    const meniscusMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.5 });
    const meniscus = new THREE.Mesh(meniscusGeo, meniscusMat);
    meniscus.position.y = waterHeight + 0.08;
    beakerGroup.add(meniscus);

    // 5. Inverted Glass Funnel & Inverted Graduated Test Tube (Phễu & Ống nghiệm lộn ngược)
    const funnelGroup = new THREE.Group();
    funnelGroup.position.set(0, 0, 0);
    beakerGroup.add(funnelGroup);

    // 3 Rubber Spacers / Glass Feet elevating the funnel rim off the bottom
    const footMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });
    for (let f = 0; f < 3; f++) {
      const fAngle = (f * Math.PI * 2) / 3;
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 16), footMat);
      foot.position.set(Math.sin(fAngle) * 0.88, 0.12, Math.cos(fAngle) * 0.88);
      funnelGroup.add(foot);
    }

    // Inverted Glass Funnel Cone (Mặt nón phễu lộn ngược úp trên cành rong)
    const funnelConeGeo = new THREE.ConeGeometry(0.92, 0.95, 48, 1, true);
    funnelConeGeo.rotateX(Math.PI);
    const funnelCone = new THREE.Mesh(funnelConeGeo, glassMat);
    funnelCone.position.y = 0.65;
    funnelGroup.add(funnelCone);

    // Funnel Stem (Cuống phễu thủy tinh thẳng đứng)
    const funnelStemGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.85, 32, 1, true);
    const funnelStem = new THREE.Mesh(funnelStemGeo, glassMat);
    funnelStem.position.y = 1.48;
    funnelGroup.add(funnelStem);

    // Inverted Graduated Test Tube (Ống nghiệm chia vạch lộn ngược chụp trên cuống phễu)
    const testTubeGeo = new THREE.CylinderGeometry(0.25, 0.25, 1.85, 36, 1, false);
    const testTube = new THREE.Mesh(testTubeGeo, glassMat);
    testTube.position.y = 2.45;
    funnelGroup.add(testTube);

    // Inverted Test Tube Volume Marks (ml graduation lines)
    const tubeMarkMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 });
    for (let my = 1.8; my <= 3.2; my += 0.22) {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.25, my, 0),
        new THREE.Vector3(-0.16, my, 0),
      ]);
      const line = new THREE.Line(lineGeo, tubeMarkMat);
      funnelGroup.add(line);
    }

    // Oxygen Gas Pocket at top of inverted tube (Khối khí Oxy đẩy nước xuống khi quang hợp)
    const gasPocketGeo = new THREE.CylinderGeometry(0.23, 0.23, 1.0, 32);
    const gasPocketMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.25,
      roughness: 0.05,
    });
    const gasPocket = new THREE.Mesh(gasPocketGeo, gasPocketMat);
    gasPocket.position.y = 3.25;
    gasPocket.scale.set(1, 0.08, 1);
    funnelGroup.add(gasPocket);

    // Internal meniscus disc between collected O2 and water column in tube
    const tubeMeniscusGeo = new THREE.CircleGeometry(0.23, 32);
    tubeMeniscusGeo.rotateX(Math.PI / 2);
    const tubeMeniscusMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    const tubeMeniscus = new THREE.Mesh(tubeMeniscusGeo, tubeMeniscusMat);
    tubeMeniscus.position.y = 3.25;
    funnelGroup.add(tubeMeniscus);

    // 6. Realistic Botanical Elodea Sprig (Cành rong đuôi chó chân thực)
    const elodeaGroup = new THREE.Group();
    elodeaGroup.position.set(0, 0.15, 0);
    beakerGroup.add(elodeaGroup);

    // Main Aquatic Stalk: organic S-curve under the funnel
    const mainStalkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.15, 0.05, 0.08),
      new THREE.Vector3(0.12, 0.28, -0.06),
      new THREE.Vector3(-0.08, 0.58, 0.05),
      new THREE.Vector3(0.0, 0.95, 0.0), // Ascending directly into funnel neck!
    ]);

    const stalkGeo = new THREE.TubeGeometry(mainStalkCurve, 42, 0.048, 14, false);
    const stalkMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.45,
      metalness: 0.05,
    });
    const stalk = new THREE.Mesh(stalkGeo, stalkMat);
    stalk.castShadow = true;
    elodeaGroup.add(stalk);

    // Secondary side sprig branching off at lower node for lush appearance
    const sideStalkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.08, 0.25, -0.04),
      new THREE.Vector3(0.28, 0.38, 0.12),
      new THREE.Vector3(0.36, 0.58, 0.06),
    ]);
    const sideStalkGeo = new THREE.TubeGeometry(sideStalkCurve, 24, 0.034, 10, false);
    const sideStalk = new THREE.Mesh(sideStalkGeo, stalkMat);
    sideStalk.castShadow = true;
    elodeaGroup.add(sideStalk);

    // Distinct 45-degree Angled Cut Stem Port (Vết cắt xéo 45° giải phóng khí O₂)
    const cutTipGeo = new THREE.CylinderGeometry(0.056, 0.056, 0.03, 16);
    cutTipGeo.rotateZ(Math.PI / 4);
    const cutTipMat = new THREE.MeshStandardMaterial({
      color: 0x86efac,
      emissive: 0x22c55e,
      emissiveIntensity: 0.8,
      roughness: 0.3,
    });
    const cutTip = new THREE.Mesh(cutTipGeo, cutTipMat);
    cutTip.position.set(0, 0.96, 0);
    elodeaGroup.add(cutTip);

    // Botanical Lanceolate Leaf Geometry Generator (Phiến lá rong mềm lượn sóng trong nước)
    const elodeaLeafShape = new THREE.Shape();
    elodeaLeafShape.moveTo(0, 0);
    elodeaLeafShape.bezierCurveTo(0.032, 0.12, 0.042, 0.32, 0, 0.46);
    elodeaLeafShape.bezierCurveTo(-0.042, 0.32, -0.032, 0.12, 0, 0);

    const elodeaLeafGeo = new THREE.ShapeGeometry(elodeaLeafShape, 8);
    elodeaLeafGeo.rotateX(-Math.PI / 2);

    const elodeaLeafMat = new THREE.MeshStandardMaterial({
      color: 0x16a34a,
      roughness: 0.35,
      metalness: 0.04,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.94,
    });

    const leafMeshes: THREE.Mesh[] = [];

    // Dense whorls of 4-5 leaves at each node along main stalk
    for (let t = 0.12; t <= 0.88; t += 0.075) {
      const pt = mainStalkCurve.getPoint(t);
      const leafCountAtNode = 4;
      for (let r = 0; r < leafCountAtNode; r++) {
        const leaf = new THREE.Mesh(elodeaLeafGeo, elodeaLeafMat);
        leaf.position.copy(pt);
        leaf.rotation.y = (r * Math.PI * 2) / leafCountAtNode + t * 4.2;
        leaf.rotation.x = 0.42 + Math.sin(t * 10) * 0.12; // Outward arch in water
        leaf.scale.setScalar(0.85 + Math.sin(t * Math.PI) * 0.3);
        leaf.castShadow = true;
        elodeaGroup.add(leaf);
        leafMeshes.push(leaf);
      }
    }

    // Add leaves on the side branch as well
    for (let t = 0.2; t <= 0.85; t += 0.1) {
      const pt = sideStalkCurve.getPoint(t);
      for (let r = 0; r < 3; r++) {
        const leaf = new THREE.Mesh(elodeaLeafGeo, elodeaLeafMat);
        leaf.position.copy(pt);
        leaf.rotation.y = (r * Math.PI * 2) / 3 + t * 5.0;
        leaf.rotation.x = 0.4;
        leaf.scale.setScalar(0.7);
        leaf.castShadow = true;
        elodeaGroup.add(leaf);
        leafMeshes.push(leaf);
      }
    }

    // 7. Glistening Oxygen Bubbles with Light Refraction (Chuỗi bọt khí Oxy chân thực)
    const maxBubbles = 100;
    const bubblesGroup = new THREE.Group();
    scene.add(bubblesGroup);

    interface BubbleItem {
      mesh: THREE.Mesh;
      active: boolean;
      speed: number;
      baseX: number;
      baseZ: number;
      offset: number;
    }
    const bubbles: BubbleItem[] = [];

    const bubbleGeoSmall = new THREE.SphereGeometry(0.038, 16, 16);
    const bubbleGeoMed = new THREE.SphereGeometry(0.052, 16, 16);
    const bubbleGeoLarge = new THREE.SphereGeometry(0.068, 16, 16);

    const bubbleMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.5,
      transmission: 0.94,
      opacity: 0.95,
      transparent: true,
      roughness: 0.02,
      ior: 1.1,
    });

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

    // 8. Optical Bench Rail Track with Metric Graduations (Ray quang học chia vạch cm)
    const railGroup = new THREE.Group();
    railGroup.position.set(-3.2, 0.02, 0);
    scene.add(railGroup);

    // Aluminum Rail Track Bar
    const railGeo = new THREE.BoxGeometry(3.8, 0.08, 0.48);
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.88,
      roughness: 0.25,
    });
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.set(0, 0.04, 0);
    rail.receiveShadow = true;
    railGroup.add(rail);

    // Metric Graduation Ticks on Rail (10cm - 100cm)
    const railTickMat = new THREE.LineBasicMaterial({ color: 0xffffff });
    for (let rx = -1.7; rx <= 1.7; rx += 0.34) {
      const tickGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(rx, 0.085, -0.2),
        new THREE.Vector3(rx, 0.085, 0.2),
      ]);
      const tick = new THREE.Line(tickGeo, railTickMat);
      railGroup.add(tick);
    }

    // 9. Moveable Bench Lamp with Volumetric Light Beam & Floating Photons
    const lampRig = new THREE.Group();
    scene.add(lampRig);

    // Sliding Carriage Base
    const carriage = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.12, 0.58),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.3 })
    );
    carriage.position.y = 0.1;
    carriage.castShadow = true;
    lampRig.add(carriage);

    // Lamp Vertical Chrome Post
    const lampPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.042, 1.85, 16),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.92, roughness: 0.15 })
    );
    lampPost.position.set(0, 1.05, 0);
    lampPost.castShadow = true;
    lampRig.add(lampPost);

    // Lamp Shade (Chao đèn hướng thẳng vào cốc nước)
    const lampShade = new THREE.Mesh(
      new THREE.ConeGeometry(0.58, 0.88, 36, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.25, side: THREE.DoubleSide })
    );
    lampShade.position.set(0, 1.85, 0);
    lampShade.rotation.z = -Math.PI / 2;
    lampShade.castShadow = true;
    lampRig.add(lampShade);

    // Lamp Inner Reflector
    const reflector = new THREE.Mesh(
      new THREE.ConeGeometry(0.56, 0.84, 36, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.95, roughness: 0.08, side: THREE.DoubleSide })
    );
    reflector.position.copy(lampShade.position);
    reflector.rotation.copy(lampShade.rotation);
    lampRig.add(reflector);

    // Bright High-Power LED Bulb
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 3.5 })
    );
    bulb.position.set(0.2, 1.85, 0);
    lampRig.add(bulb);

    // High-Contrast Directional SpotLight
    const spotLight = new THREE.SpotLight(0xffffff, 8, 16, Math.PI / 3.4, 0.35, 1);
    spotLight.position.set(0.2, 1.85, 0);
    spotLight.target.position.set(3.5, 1.85, 0);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.bias = -0.0004;
    lampRig.add(spotLight);
    lampRig.add(spotLight.target);

    // Volumetric Horizontal Conical Light Beam (Luồng ánh sáng thể tích Additive Blending)
    const beamGeo = new THREE.ConeGeometry(1.65, 4.2, 36, 1, true);
    beamGeo.rotateZ(-Math.PI / 2);
    beamGeo.translate(2.1, 0, 0); // Apex at bulb, widening through the water beaker!

    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.position.set(0.2, 1.85, 0);
    lampRig.add(beamMesh);

    // Floating Photon Motes / Dust inside light beam
    const dustCount = 75;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3 + 0] = 0.3 + Math.random() * 3.8;
      dustPos[i * 3 + 1] = 1.85 + (Math.random() - 0.5) * 1.4;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 1.4;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    lampRig.add(dustPoints);

    // Optical Colored Filter Plate (Kính lọc màu quang phổ)
    const filterGeo = new THREE.BoxGeometry(0.04, 1.4, 1.4);
    const filterMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.88,
      transparent: true,
      opacity: 0.75,
      roughness: 0.05,
    });
    const filterMesh = new THREE.Mesh(filterGeo, filterMat);
    filterMesh.position.set(0.72, 1.85, 0);
    lampRig.add(filterMesh);

    // 10. Glowing Wooden Splint & Combustion Flame (Que đóm thử khí Oxy bùng cháy)
    const splintGroup = new THREE.Group();
    splintGroup.position.set(0, 4.4, 0);
    splintGroup.visible = false;
    scene.add(splintGroup);

    // Wooden Stick Body
    const stick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 1.35, 12),
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.85 })
    );
    stick.position.y = 0.68;
    splintGroup.add(stick);

    // Red Smoldering Charcoal Ember
    const emberGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const emberMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xff2200,
      emissiveIntensity: 3.5,
    });
    const ember = new THREE.Mesh(emberGeo, emberMat);
    ember.position.y = 0;
    splintGroup.add(ember);

    // Crackling Combustion Flame Cone
    const flameGeo = new THREE.ConeGeometry(0.15, 0.55, 16);
    flameGeo.translate(0, 0.28, 0);
    const flameMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf97316,
      emissiveIntensity: 5.0,
      transparent: true,
      opacity: 0.95,
    });
    const flameMesh = new THREE.Mesh(flameGeo, flameMat);
    flameMesh.visible = false;
    splintGroup.add(flameMesh);

    const flameLight = new THREE.PointLight(0xf97316, 0, 6);
    flameLight.position.y = 0.28;
    splintGroup.add(flameLight);

    // 11. 3D Anatomical Pin Callouts
    const anatomyGroup = new THREE.Group();
    scene.add(anatomyGroup);

    function createPin(x: number, y: number, z: number, label: string) {
      const pin = new THREE.Group();
      pin.position.set(x, y, z);

      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0891b2, emissiveIntensity: 0.8 })
      );
      pin.add(sphere);

      const stalkLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.45, 0)]),
        new THREE.LineBasicMaterial({ color: 0x38bdf8 })
      );
      pin.add(stalkLine);

      // Canvas badge
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.roundRect(0, 0, 256, 64, 16);
      ctx.fill();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 128, 32);

      const tex = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(0, 0.65, 0);
      sprite.scale.set(1.4, 0.35, 1);
      pin.add(sprite);

      return pin;
    }

    const pin1 = createPin(0, 3.4, 0, 'Ống nghiệm thu O₂');
    const pin2 = createPin(0, 1.1, 0, 'Vết cắt xéo 45°');
    const pin3 = createPin(0.4, 0.4, 0, 'Rong đuôi chó');
    const pin4 = createPin(-1.3, 1.8, 0, 'Cốc thủy tinh NaHCO₃');
    anatomyGroup.add(pin1, pin2, pin3, pin4);
    anatomyGroup.visible = false;

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
      const lightFactor = Math.min(1.0, 0.35 / (distMeters * distMeters));
      const co2Factor = Math.min(1.0, s.co2Concentration / 1.5);

      let tempFactor = 0;
      if (s.waterTemperature < 10) {
        tempFactor = 0.2;
      } else if (s.waterTemperature <= 32) {
        tempFactor = 0.2 + ((s.waterTemperature - 10) / 22) * 0.8;
      } else if (s.waterTemperature <= 42) {
        tempFactor = 1.0 - ((s.waterTemperature - 32) / 10) * 0.6;
      } else {
        tempFactor = Math.max(0, 0.4 - ((s.waterTemperature - 42) / 8) * 0.4);
      }

      let filterFactor = 1.0;
      if (s.colorFilter === 'white') filterFactor = 1.0;
      else if (s.colorFilter === 'blue') filterFactor = 0.92;
      else if (s.colorFilter === 'red') filterFactor = 0.85;
      else if (s.colorFilter === 'green') filterFactor = 0.08;

      const rateNormalized = lightFactor * co2Factor * tempFactor * filterFactor;
      const bubblesPerMinute = Math.round(rateNormalized * 65);

      // Slide lamp position along rail according to lampDistance
      const normalizedDist = (s.lampDistance - 10) / 90;
      const railX = -1.6 - normalizedDist * 2.8;
      lampRig.position.set(railX, 0, 0);

      // Light Color & Intensity
      let filterHex = 0xffffff;
      if (s.colorFilter === 'blue') filterHex = 0x38bdf8;
      else if (s.colorFilter === 'red') filterHex = 0xef4444;
      else if (s.colorFilter === 'green') filterHex = 0x22c55e;

      (filterMesh.material as THREE.MeshPhysicalMaterial).color.setHex(filterHex);
      spotLight.color.setHex(filterHex);
      beamMat.color.setHex(filterHex);
      dustMat.color.setHex(filterHex);

      const intensityScale = (100 - (s.lampDistance - 10) * 0.7) / 100;
      spotLight.intensity = Math.max(1.5, intensityScale * 9.5);
      beamMat.opacity = Math.max(0.06, intensityScale * 0.22);

      // Gentle natural underwater leaf swaying animation
      const time = clock.getElapsedTime();
      for (let idx = 0; idx < leafMeshes.length; idx++) {
        leafMeshes[idx].rotation.z = Math.sin(time * 2.2 + idx * 0.35) * 0.045;
      }

      // Collect Gas in Inverted Test Tube
      if (playing && bubblesPerMinute > 0) {
        const fillRate = (bubblesPerMinute / 60) * 0.18 * s.timeMultiplier * delta;
        collectedVolRef.current = Math.min(100, collectedVolRef.current + fillRate);
      }

      // Update gas pocket scale in tube
      const volScale = collectedVolRef.current / 100;
      gasPocket.scale.set(1, Math.max(0.08, volScale * 1.8), 1);
      gasPocket.position.y = 3.25 - (volScale * 0.45);
      tubeMeniscus.position.y = gasPocket.position.y - (gasPocket.scale.y * 0.5);

      // Emit bubbles from cut stem port
      if (playing && bubblesPerMinute > 0.5) {
        const spawnInterval = Math.max(0.04, 1.0 / ((bubblesPerMinute / 60) * s.timeMultiplier));
        spawnCounter += delta;

        if (spawnCounter >= spawnInterval) {
          spawnCounter = 0;
          const inactive = bubbles.find((b) => !b.active);
          if (inactive) {
            inactive.active = true;
            inactive.mesh.visible = true;
            inactive.mesh.position.set(inactive.baseX, 1.05, inactive.baseZ);
          }
        }
      }

      const gasTopLimit = Math.max(1.5, tubeMeniscus.position.y);

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

      // Glowing splint combustion animation
      if (s.glowingSplintActive) {
        splintGroup.visible = true;
        splintGroup.position.y = THREE.MathUtils.lerp(splintGroup.position.y, 3.1, delta * 3.5);

        if (s.splintBurstEffect && collectedVolRef.current >= 25) {
          flameMesh.visible = true;
          flameLight.intensity = 3.5 + Math.sin(time * 25) * 1.2;
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

      anatomyGroup.visible = showAnatomyRef.current;

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
    <div className={`relative w-full h-full min-h-[480px] rounded-2xl overflow-hidden border shadow-xl transition-colors duration-500 ${
      isDarkroom ? 'bg-[#0a0f1d] border-slate-800' : 'bg-slate-100 border-slate-300'
    }`}>
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D HUD Badges */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10">
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur-md shadow-sm transition-colors ${
          isDarkroom
            ? 'bg-slate-900/85 border-slate-700/80 text-cyan-400'
            : 'bg-white/90 border-slate-200 text-cyan-700'
        }`}>
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
          Phòng Thí Nghiệm Sinh Học • Mô Hình Quang Hợp
        </div>
        <div className={`px-3 py-1.5 rounded-xl border text-[11px] backdrop-blur-md shadow-sm transition-colors ${
          isDarkroom
            ? 'bg-slate-900/80 border-slate-800 text-slate-300'
            : 'bg-white/85 border-slate-200 text-slate-700'
        }`}>
          Đèn: <strong className="text-amber-500">{state.lampDistance} cm</strong> | CO₂: <strong className="text-emerald-400">{state.co2Concentration}%</strong> | Nước: <strong className="text-cyan-400">{state.waterTemperature}°C</strong> | Kính: <strong className="text-pink-400 uppercase">{state.colorFilter}</strong>
        </div>
      </div>

      {/* Top HUD Controls Bar */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20 flex-wrap justify-end">
        {/* Darkroom Mode Toggle Button */}
        <button
          onClick={toggleDarkroom}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md border transition cursor-pointer flex items-center gap-1.5 shadow-sm ${
            isDarkroom
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span>{isDarkroom ? '🌙' : '☀️'}</span>
          <span>{isDarkroom ? 'Buồng tối (Bật)' : 'Phòng sáng'}</span>
        </button>

        {/* Glowing Splint Test Button */}
        <button
          onClick={triggerSplintTest}
          disabled={state.glowingSplintActive}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md border transition cursor-pointer flex items-center gap-1.5 shadow-sm ${
            state.glowingSplintActive
              ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
              : isDarkroom
              ? 'bg-slate-900/80 border-slate-700 text-amber-400 hover:bg-amber-500/20'
              : 'bg-white/90 border-slate-200 text-amber-700 hover:bg-amber-50'
          }`}
        >
          <span>🔥</span> Thử que đóm
        </button>

        {/* Anatomical Pins Toggle */}
        <button
          onClick={() => setShowAnatomy((prev) => !prev)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md border transition cursor-pointer flex items-center gap-1.5 shadow-sm ${
            showAnatomy
              ? 'bg-cyan-500 text-white border-cyan-400 ring-2 ring-cyan-500/20'
              : isDarkroom
              ? 'bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              : 'bg-white/90 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <span>🏷️</span> Chú Thích
        </button>

        {/* Open Inquiry Tab in Sidebar */}
        {onOpenInquiry && (
          <button
            onClick={onOpenInquiry}
            className="px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md border transition cursor-pointer flex items-center gap-1.5 shadow-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-indigo-400 hover:brightness-110"
          >
            <span>🔬</span> Nghiên cứu
          </button>
        )}

        {/* Camera View Switcher */}
        <button
          onClick={() => switchCameraView(cameraView === 'overview' ? 'closeup' : 'overview')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition cursor-pointer flex items-center gap-1.5 shadow-sm ${
            isDarkroom
              ? 'bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              : 'bg-white/90 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <span>{cameraView === 'overview' ? '🔍 Cận cảnh' : '🔭 Toàn cảnh'}</span>
        </button>

        {/* Direct Lamp Control Button */}
        <button
          onClick={() => setIsLampControlOpen((prev) => !prev)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md border transition cursor-pointer flex items-center gap-1.5 shadow-sm ${
            isLampControlOpen
              ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-500/30'
              : isDarkroom
              ? 'bg-slate-900/80 border-slate-700 text-amber-300 hover:bg-amber-500/20'
              : 'bg-white/90 border-slate-200 text-slate-700 hover:bg-amber-50'
          }`}
        >
          <span>💡</span> Chỉnh Đèn
        </button>
      </div>

      {/* DIRECT INTERACTIVE LAMP CONTROL POPUP OVERLAY */}
      {isLampControlOpen && onUpdateState && (
        <div className={`absolute top-16 right-4 z-30 w-80 backdrop-blur-xl border rounded-3xl p-4 shadow-2xl space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200 ${
          isDarkroom ? 'bg-slate-900/95 border-slate-700 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-700/40 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold">
                💡
              </span>
              <div>
                <h4 className="text-xs font-bold leading-tight">Đèn Chiếu Trên Ray Quang Học</h4>
                <p className="text-[10px] text-slate-400">Chỉnh khoảng cách đèn & kính lọc màu</p>
              </div>
            </div>
            <button
              onClick={() => setIsLampControlOpen(false)}
              className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* 1. Lamp Distance Slider */}
          <div className={`space-y-1.5 p-3 rounded-2xl border ${
            isDarkroom ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold">Khoảng cách đèn (Ray thước cm)</span>
              <span className="font-mono text-amber-400 font-extrabold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 text-xs">
                {state.lampDistance} cm
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={state.lampDistance}
              onChange={(e) => {
                const val = Number(e.target.value);
                onUpdateState((prev) => ({ ...prev, lampDistance: val }));
              }}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
            />
            <div className="flex justify-between gap-1 pt-1">
              {[10, 25, 50, 80].map((preset) => (
                <button
                  key={preset}
                  onClick={() => onUpdateState((prev) => ({ ...prev, lampDistance: preset }))}
                  className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition cursor-pointer ${
                    state.lampDistance === preset
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : isDarkroom
                      ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset}cm
                </button>
              ))}
            </div>
          </div>

          {/* 2. Color Filter */}
          <div className={`space-y-1.5 p-3 rounded-2xl border ${
            isDarkroom ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <label className="text-xs font-bold">Kính lọc màu quang phổ</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'white', label: 'Trắng', activeClass: 'bg-white text-slate-900 border-slate-400 font-bold shadow-xs' },
                { id: 'blue', label: 'Lam', activeClass: 'bg-sky-500 text-white border-sky-400 font-bold shadow-xs' },
                { id: 'red', label: 'Đỏ', activeClass: 'bg-rose-500 text-white border-rose-400 font-bold shadow-xs' },
                { id: 'green', label: 'Lục', activeClass: 'bg-emerald-500 text-white border-emerald-400 font-bold shadow-xs' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() =>
                    onUpdateState((prev) => ({
                      ...prev,
                      colorFilter: f.id as PhotosynthesisState['colorFilter'],
                    }))
                  }
                  className={`py-1 px-1 rounded-lg text-[11px] border transition cursor-pointer ${
                    state.colorFilter === f.id
                      ? `${f.activeClass} ring-2 ring-cyan-500/30`
                      : isDarkroom
                      ? 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Fast CO2 & Temperature quick tweaks */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
            <button
              onClick={() => onUpdateState((prev) => ({ ...prev, co2Concentration: prev.co2Concentration >= 3.5 ? 0.5 : prev.co2Concentration + 1.0 }))}
              className="py-1.5 px-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold hover:bg-emerald-500/30 transition cursor-pointer text-center"
            >
              + Bơm thêm CO₂
            </button>
            <button
              onClick={() => onUpdateState((prev) => ({ ...prev, waterTemperature: 30 }))}
              className="py-1.5 px-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-xl font-bold hover:bg-cyan-500/30 transition cursor-pointer text-center"
            >
              Nước tối ưu 30°C
            </button>
          </div>
        </div>
      )}

      {/* Prominent Live Bubble Stream Indicator */}
      <div className={`absolute bottom-16 left-4 border backdrop-blur-md px-4 py-3 rounded-2xl text-xs shadow-lg flex items-center gap-3 max-w-[280px] z-10 transition-colors ${
        isDarkroom
          ? 'bg-slate-900/90 border-cyan-500/40 text-slate-200'
          : 'bg-white/95 border-cyan-300 text-slate-800'
      }`}>
        <div className="relative w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-400/40 text-cyan-400">
          <span className="text-xl animate-bounce">🫧</span>
          {state.bubblesPerMinute > 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
          )}
        </div>
        <div>
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Dòng bọt khí O₂ thoát ra
          </div>
          <div className="text-xl font-black text-cyan-400 flex items-baseline gap-1">
            {state.bubblesPerMinute}
            <span className="text-xs font-normal text-slate-400">bọt/phút</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-medium">
            {state.bubblesPerMinute > 30 ? 'Quang hợp rất mạnh' : state.bubblesPerMinute > 10 ? 'Quang hợp ổn định' : 'Quang hợp yếu / ngừng'}
          </div>
        </div>
      </div>

      {/* Oxygen Gas Tank Tube fill meter */}
      <div className={`absolute bottom-4 right-4 border backdrop-blur-md px-3.5 py-2 rounded-xl text-xs flex items-center gap-3 shadow-sm z-10 transition-colors ${
        isDarkroom
          ? 'bg-slate-900/90 border-slate-800 text-slate-200'
          : 'bg-white/90 border-slate-200 text-slate-800'
      }`}>
        <div className="w-2.5 h-10 bg-slate-700 rounded-full overflow-hidden p-0.5 border border-slate-600 flex flex-col justify-end">
          <div
            className="w-full bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full transition-all duration-300"
            style={{ height: `${Math.min(100, state.collectedO2Volume)}%` }}
          />
        </div>
        <div>
          <div className="text-[10px] text-slate-400 font-semibold">Khí Oxy tích lũy trong ống</div>
          <div className="text-xs font-bold text-cyan-400">{Math.round(state.collectedO2Volume)}% thể tích</div>
        </div>
      </div>

      {/* Flame Burst Toast */}
      {state.glowingSplintActive && state.splintBurstEffect && state.collectedO2Volume >= 25 && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 px-5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-bounce z-30 font-bold border-2 border-amber-300">
          <span className="text-2xl">🔥</span>
          <div>
            <div className="text-xs font-extrabold">Que đóm bùng cháy mãnh liệt!</div>
            <div className="text-[11px] font-medium">Chứng minh chất khí thoát ra là Khí Oxy (O₂) duy trì sự cháy!</div>
          </div>
        </div>
      )}

      {/* BOTANICAL & APPARATUS ANATOMY CALLOUTS (Khi bật Chú Thích) */}
      {showAnatomy && (
        <div className={`absolute bottom-16 left-4 border backdrop-blur-xl p-3.5 rounded-2xl text-xs shadow-2xl max-w-[360px] space-y-2 animate-in fade-in duration-200 z-20 ${
          isDarkroom ? 'bg-slate-950/95 border-cyan-500/50 text-slate-200' : 'bg-white/95 border-cyan-400 text-slate-800'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-1.5">
            <span className="font-bold text-cyan-400 flex items-center gap-1.5">
              <span>🌿</span> Cấu Tạo Thí Nghiệm Quang Hợp Ở Rong
            </span>
            <button
              onClick={() => setShowAnatomy(false)}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-start gap-1.5">
              <span className="text-cyan-400 font-bold">1. Ống nghiệm lộn ngược:</span>
              <span className="text-slate-300">Được đổ đầy nước ban đầu; khí O₂ sinh ra từ quang hợp sẽ đẩy nước xuống để tích lũy ở đáy ống.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold">2. Vết cắt xéo 45°:</span>
              <span className="text-slate-300">Cắt chéo cuống rong dưới nước để mở các ống khí mô (aerenchyma), giúp bọt khí O₂ thoát ra liên tục và dễ đếm.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold">3. Cành rong đuôi chó (Elodea):</span>
              <span className="text-slate-300">Thực vật thủy sinh có phiến lá mỏng ngập nước, hấp thụ trực tiếp CO₂ hòa tan và ánh sáng để quang hợp mạnh.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-amber-400 font-bold">4. Cốc chứa NaHCO₃:</span>
              <span className="text-slate-300">Dung dịch muối NaHCO₃ phân ly cung cấp ion HCO₃⁻ và khí CO₂ hòa tan ổn định cho phản ứng pha tối.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-pink-400 font-bold">5. Kính lọc màu & Đèn ray:</span>
              <span className="text-slate-300">Thay đổi bước sóng photon (quang phổ) và khoảng cách chiếu sáng để khảo sát điểm bù và điểm bão hòa ánh sáng.</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Hint */}
      <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 backdrop-blur-sm px-4 py-1.5 rounded-full border text-[11px] pointer-events-none shadow-sm flex items-center gap-2 z-10 transition-colors ${
        isDarkroom
          ? 'bg-slate-900/80 border-slate-700/80 text-slate-400'
          : 'bg-white/85 border-slate-300 text-slate-600'
      }`}>
        <span>💡 <strong>Mẹo:</strong> Nhấn nút "Chỉnh Đèn" hoặc kéo thanh trượt để di chuyển đèn</span>
        <span>•</span>
        <span>🖱️ Xoay 3D 360° tự do</span>
      </div>
    </div>
  );
}
