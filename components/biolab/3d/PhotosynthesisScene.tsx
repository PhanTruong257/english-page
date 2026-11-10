'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PhotosynthesisState } from '../types';
import { setupLabEnvironment, disposeSceneResources } from './LabEnvironment';

interface Props {
  state: PhotosynthesisState;
  onUpdateState?: (updater: (prev: PhotosynthesisState) => PhotosynthesisState) => void;
  onUpdateBubbleRate?: (bpm: number, volume: number) => void;
  onOpenInquiry?: () => void;
  isPlaying: boolean;
  isActive?: boolean;
}

export default function PhotosynthesisScene({
  state,
  onUpdateState,
  onUpdateBubbleRate,
  onOpenInquiry,
  isPlaying,
  isActive = true,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  const collectedVolRef = useRef(state.collectedO2Volume);
  collectedVolRef.current = state.collectedO2Volume;

  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Synchronize size when scene becomes active again
  useEffect(() => {
    if (isActive && mountRef.current && rendererRef.current && cameraRef.current) {
      const c = mountRef.current;
      if (c.clientWidth > 0 && c.clientHeight > 0) {
        cameraRef.current.aspect = c.clientWidth / c.clientHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(c.clientWidth, c.clientHeight);
      }
    }
  }, [isActive]);

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

  // Highlight CO2 / O2 Legend in HUD
  const [showBubbleDetails, setShowBubbleDetails] = useState<boolean>(false);

  // Direct Interactive Lamp Control Modal / Popover
  const [isLampControlOpen, setIsLampControlOpen] = useState(false);

  // Camera View Mode
  const [cameraView, setCameraView] = useState<'overview' | 'closeup'>('overview');

  const switchCameraView = (view: 'overview' | 'closeup') => {
    setCameraView(view);
    if (!controlsRef.current || !cameraRef.current) return;
    if (view === 'closeup') {
      cameraRef.current.position.set(0, 1.05, 2.3);
      controlsRef.current.target.set(0, 0.65, 0);
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

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.02;
    controls.minDistance = 1.8;
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

    // Borosilicate Glass Material (crisp specular glass without costly transmission double-pass)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      opacity: 0.22,
      transparent: true,
      roughness: 0.03,
      metalness: 0.08,
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      depthWrite: false,
    });

    // Apparatus Glass Material for interior funnel & test tube (trong suốt không che khuất bọt khí)
    const apparatusGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.35,
      roughness: 0.04,
      metalness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 0.85,
      depthWrite: false,
    });

    // Glass Beaker Cylindrical Body (Bình thủy tinh trụ chia vạch)
    const beakerRadius = 1.25;
    const beakerHeight = 2.85;
    const beakerGeo = new THREE.CylinderGeometry(beakerRadius, beakerRadius * 0.97, beakerHeight, 48, 1, true);
    const beaker = new THREE.Mesh(beakerGeo, glassMat);
    beaker.position.y = beakerHeight / 2 + 0.04;
    beaker.renderOrder = 15;
    beaker.castShadow = true;
    beakerGroup.add(beaker);

    // Thick Beaker Bottom Rim
    const beakerBottomGeo = new THREE.CylinderGeometry(beakerRadius * 0.97, beakerRadius * 0.97, 0.08, 48);
    const beakerBottom = new THREE.Mesh(beakerBottomGeo, glassMat);
    beakerBottom.position.y = 0.04;
    beakerBottom.renderOrder = 1;
    beakerBottom.receiveShadow = true;
    beakerGroup.add(beakerBottom);

    // Top Rolled Glass Rim Lip
    const beakerRimGeo = new THREE.TorusGeometry(beakerRadius, 0.035, 16, 48);
    beakerRimGeo.rotateX(Math.PI / 2);
    const beakerRim = new THREE.Mesh(beakerRimGeo, glassMat);
    beakerRim.position.y = beakerHeight + 0.04;
    beakerRim.renderOrder = 15;
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
      opacity: 0.25,
      transparent: true,
      roughness: 0.03,
      clearcoat: 0.85,
      reflectivity: 0.85,
      depthWrite: false,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = waterHeight / 2 + 0.08;
    water.renderOrder = 2;
    beakerGroup.add(water);

    // Upper Water Meniscus Ring
    const meniscusGeo = new THREE.TorusGeometry(waterRadius, 0.025, 12, 48);
    meniscusGeo.rotateX(Math.PI / 2);
    const meniscusMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.55 });
    const meniscus = new THREE.Mesh(meniscusGeo, meniscusMat);
    meniscus.position.y = waterHeight + 0.08;
    meniscus.renderOrder = 2;
    beakerGroup.add(meniscus);

    // NaHCO3 Effervescent Salt Tablet / Reagent Source on Beaker Floor (Viên NaHCO3 sủi bọt tạo CO2)
    const tabletGroup = new THREE.Group();
    tabletGroup.position.set(0.65, 0.08, 0.45);
    beakerGroup.add(tabletGroup);

    const tabletGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.08, 24);
    const tabletMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.85,
      metalness: 0.08,
    });
    const tabletMesh = new THREE.Mesh(tabletGeo, tabletMat);
    tabletMesh.castShadow = true;
    tabletGroup.add(tabletMesh);

    // Effervescent micro-bubble halo crust around the NaHCO3 tablet
    const tabletRingGeo = new THREE.RingGeometry(0.08, 0.26, 24);
    tabletRingGeo.rotateX(-Math.PI / 2);
    const tabletRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const tabletRing = new THREE.Mesh(tabletRingGeo, tabletRingMat);
    tabletRing.position.y = 0.045;
    tabletGroup.add(tabletRing);

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
    const funnelCone = new THREE.Mesh(funnelConeGeo, apparatusGlassMat);
    funnelCone.position.y = 0.65;
    funnelCone.renderOrder = 3;
    funnelGroup.add(funnelCone);

    // Funnel Stem (Cuống phễu thủy tinh thẳng đứng)
    const funnelStemGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.85, 32, 1, true);
    const funnelStem = new THREE.Mesh(funnelStemGeo, apparatusGlassMat);
    funnelStem.position.y = 1.48;
    funnelStem.renderOrder = 3;
    funnelGroup.add(funnelStem);

    // Inverted Graduated Test Tube (Ống nghiệm chia vạch lộn ngược chụp trên cuống phễu)
    const testTubeGeo = new THREE.CylinderGeometry(0.25, 0.25, 1.85, 36, 1, false);
    const testTube = new THREE.Mesh(testTubeGeo, apparatusGlassMat);
    testTube.position.y = 2.45;
    testTube.renderOrder = 4;
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

    // 6. Lush Botanical Elodea Plant Sprig Bouquet (Cành rong đuôi chó sum sê, chân thực)
    const elodeaGroup = new THREE.Group();
    elodeaGroup.position.set(0, 0.15, 0);
    beakerGroup.add(elodeaGroup);

    const stalkMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.42,
      metalness: 0.05,
    });

    // Main Center Aquatic Stalk: gentle S-curve ending directly below the funnel neck with 45° bio-cut port
    const mainStalkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.12, 0.06, 0.06),
      new THREE.Vector3(0.14, 0.32, -0.06),
      new THREE.Vector3(-0.06, 0.65, 0.04),
      new THREE.Vector3(0.0, 0.96, 0.0), // Ascending directly into funnel neck!
    ]);
    const mainStalkGeo = new THREE.TubeGeometry(mainStalkCurve, 42, 0.048, 14, false);
    const mainStalk = new THREE.Mesh(mainStalkGeo, stalkMat);
    mainStalk.castShadow = true;
    elodeaGroup.add(mainStalk);

    // Left-Forward Stalk sprig
    const leftStalkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.08, 0.22, 0.02),
      new THREE.Vector3(-0.35, 0.45, 0.18),
      new THREE.Vector3(-0.25, 0.72, 0.12),
    ]);
    const leftStalkGeo = new THREE.TubeGeometry(leftStalkCurve, 26, 0.036, 12, false);
    const leftStalk = new THREE.Mesh(leftStalkGeo, stalkMat);
    leftStalk.castShadow = true;
    elodeaGroup.add(leftStalk);

    // Right-Back Stalk sprig
    const rightStalkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.06, 0.24, -0.02),
      new THREE.Vector3(0.38, 0.52, -0.16),
      new THREE.Vector3(0.26, 0.78, -0.08),
    ]);
    const rightStalkGeo = new THREE.TubeGeometry(rightStalkCurve, 26, 0.036, 12, false);
    const rightStalk = new THREE.Mesh(rightStalkGeo, stalkMat);
    rightStalk.castShadow = true;
    elodeaGroup.add(rightStalk);

    // Distinct 45-degree Angled Cut Stem Port (Vết cắt xéo 45° giải phóng khí O₂)
    const cutTipGeo = new THREE.CylinderGeometry(0.058, 0.058, 0.035, 18);
    cutTipGeo.rotateZ(Math.PI / 4);
    const cutTipMat = new THREE.MeshStandardMaterial({
      color: 0x86efac,
      emissive: 0x22c55e,
      emissiveIntensity: 0.9,
      roughness: 0.28,
    });
    const cutTip = new THREE.Mesh(cutTipGeo, cutTipMat);
    cutTip.position.set(0, 0.97, 0);
    elodeaGroup.add(cutTip);

    // Aerenchyma internal pore hole in cut tip (Lỗ khoang khí mô)
    const poreGeo = new THREE.CircleGeometry(0.024, 16);
    poreGeo.rotateX(-Math.PI / 4);
    const poreMat = new THREE.MeshBasicMaterial({ color: 0x052e16 });
    const poreMesh = new THREE.Mesh(poreGeo, poreMat);
    poreMesh.position.set(0, 0.975, 0);
    elodeaGroup.add(poreMesh);

    // Botanical Lanceolate Leaf Geometry Generator (Phiến lá rong mềm lượn sóng trong nước)
    function createElodeaLeafGeo(length: number, maxWidth: number) {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.bezierCurveTo(maxWidth * 0.45, length * 0.25, maxWidth, length * 0.55, 0, length);
      shape.bezierCurveTo(-maxWidth, length * 0.55, -maxWidth * 0.45, length * 0.25, 0, 0);

      const geo = new THREE.ShapeGeometry(shape, 8);
      geo.rotateX(-Math.PI / 2);

      // Transverse slight cupping
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        pos.setY(i, y + (x * x) * 0.2);
      }
      geo.computeVertexNormals();
      return geo;
    }

    const leafGeoStandard = createElodeaLeafGeo(0.48, 0.055);
    const leafGeoSide = createElodeaLeafGeo(0.38, 0.045);

    const elodeaLeafMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.28,
      metalness: 0.04,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
    });

    const leafMeshes: THREE.Mesh[] = [];
    const leafInfos: { mesh: THREE.Mesh; length: number; maxWidth: number }[] = [];

    // Dense whorls of 4-5 leaves at each node along main stalk
    for (let t = 0.1; t <= 0.90; t += 0.068) {
      const pt = mainStalkCurve.getPoint(t);
      const leafCount = 4;
      for (let r = 0; r < leafCount; r++) {
        const leaf = new THREE.Mesh(leafGeoStandard, elodeaLeafMat);
        leaf.position.copy(pt);
        leaf.rotation.y = (r * Math.PI * 2) / leafCount + t * 4.5;
        leaf.rotation.x = 0.42 + Math.sin(t * 12) * 0.12;
        leaf.scale.setScalar(0.85 + Math.sin(t * Math.PI) * 0.35);
        leaf.castShadow = true;
        elodeaGroup.add(leaf);
        leafMeshes.push(leaf);
        leafInfos.push({ mesh: leaf, length: 0.48, maxWidth: 0.055 });
      }
    }

    // Leaves on the left sprig
    for (let t = 0.18; t <= 0.88; t += 0.09) {
      const pt = leftStalkCurve.getPoint(t);
      for (let r = 0; r < 3; r++) {
        const leaf = new THREE.Mesh(leafGeoSide, elodeaLeafMat);
        leaf.position.copy(pt);
        leaf.rotation.y = (r * Math.PI * 2) / 3 + t * 5.2;
        leaf.rotation.x = 0.38;
        leaf.scale.setScalar(0.75);
        leaf.castShadow = true;
        elodeaGroup.add(leaf);
        leafMeshes.push(leaf);
        leafInfos.push({ mesh: leaf, length: 0.38, maxWidth: 0.045 });
      }
    }

    // Leaves on the right sprig
    for (let t = 0.18; t <= 0.88; t += 0.09) {
      const pt = rightStalkCurve.getPoint(t);
      for (let r = 0; r < 3; r++) {
        const leaf = new THREE.Mesh(leafGeoSide, elodeaLeafMat);
        leaf.position.copy(pt);
        leaf.rotation.y = (r * Math.PI * 2) / 3 + t * 4.8;
        leaf.rotation.x = 0.38;
        leaf.scale.setScalar(0.75);
        leaf.castShadow = true;
        elodeaGroup.add(leaf);
        leafMeshes.push(leaf);
        leafInfos.push({ mesh: leaf, length: 0.38, maxWidth: 0.045 });
      }
    }

    // White specular highlight spot for authentic 3D spherical bubble sheen (dùng chung cho mọi bọt khí)
    const o2GlintMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });

    // 6b. Bọt khí Oxy li ti bám trên bề mặt lá rong (Clinging Leaf Micro-Bubbles)
    interface LeafClingingBubble {
      group: THREE.Group;
      mesh: THREE.Mesh;
      leaf: THREE.Mesh;
      baseRadius: number;
      currentRadius: number;
      maxRadius: number;
      growthRate: number;
      pulsePhase: number;
      pulseSpeed: number;
    }

    const clingingBubbles: LeafClingingBubble[] = [];
    const clingingBubbleGeo = new THREE.SphereGeometry(1, 14, 12);
    const clingingGlintGeo = new THREE.SphereGeometry(0.28, 8, 8);

    const clingingBubbleMat = new THREE.MeshPhysicalMaterial({
      color: 0xecfeff,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.95,
      roughness: 0.03,
      metalness: 0.1,
      transparent: true,
      opacity: 0.88,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      reflectivity: 0.98,
      depthWrite: false,
    });

    // Tạo bọt khí bám trên 85% số lá (mỗi lá có 1-2 bọt li ti)
    leafInfos.forEach((info, leafIdx) => {
      if (leafIdx % 7 === 0) return; // một số lá để tự nhiên

      const numBubbles = leafIdx % 3 === 0 ? 2 : 1;
      for (let b = 0; b < numBubbles; b++) {
        const bGroup = new THREE.Group();
        const bMesh = new THREE.Mesh(clingingBubbleGeo, clingingBubbleMat);
        bGroup.add(bMesh);

        const glint = new THREE.Mesh(clingingGlintGeo, o2GlintMat);
        glint.position.set(0.38, 0.45, 0.38);
        bGroup.add(glint);

        // Vị trí dọc phiến lá (lá vươn theo trục -Z từ 0 đến -length)
        const u = 0.22 + b * 0.38 + Math.random() * 0.22;
        const localZ = -info.length * u;
        const widthAtU = info.maxWidth * Math.sin(Math.min(1, u) * Math.PI);
        const localX = (Math.random() - 0.5) * widthAtU * 0.75;
        // Bám trên bề mặt trên của phiến lá (có độ cong hình máng lượn sóng)
        const localY = (localX * localX) * 0.2 + 0.018;

        bGroup.position.set(localX, localY, localZ);
        info.mesh.add(bGroup);

        const baseR = 0.012 + Math.random() * 0.006;
        const initR = 0.014 + Math.random() * 0.016;
        const maxR = 0.030 + Math.random() * 0.016;

        bGroup.scale.setScalar(initR);

        clingingBubbles.push({
          group: bGroup,
          mesh: bMesh,
          leaf: info.mesh,
          baseRadius: baseR,
          currentRadius: initR,
          maxRadius: maxR,
          growthRate: 0.007 + Math.random() * 0.009,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 3.0 + Math.random() * 2.5,
        });
      }
    });

    // 6c. Bọt khí Oxy tách và thoát ra từ các phiến lá (Escaping Leaf Bubbles)
    const maxLeafEscapingBubbles = 40;
    const leafEscapingGroup = new THREE.Group();
    leafEscapingGroup.renderOrder = 13;
    scene.add(leafEscapingGroup);

    interface LeafEscapingItem {
      group: THREE.Group;
      mesh: THREE.Mesh;
      active: boolean;
      speed: number;
      baseX: number;
      baseZ: number;
      currX: number;
      currY: number;
      currZ: number;
      wobbleSpeed: number;
      wobbleOffset: number;
      wobbleAmp: number;
    }

    const leafEscapingBubbles: LeafEscapingItem[] = [];
    const leafEscapingGeo = new THREE.SphereGeometry(0.046, 14, 14);

    const leafEscapingMat = new THREE.MeshPhysicalMaterial({
      color: 0xcffafe,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.85,
      roughness: 0.04,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      reflectivity: 0.95,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });

    for (let i = 0; i < maxLeafEscapingBubbles; i++) {
      const bGroup = new THREE.Group();
      bGroup.visible = false;
      leafEscapingGroup.add(bGroup);

      const bMesh = new THREE.Mesh(leafEscapingGeo, leafEscapingMat);
      bGroup.add(bMesh);

      const glint = new THREE.Mesh(new THREE.SphereGeometry(0.046 * 0.28, 8, 8), o2GlintMat);
      glint.position.set(0.046 * 0.38, 0.046 * 0.45, 0.046 * 0.38);
      bGroup.add(glint);

      leafEscapingBubbles.push({
        group: bGroup,
        mesh: bMesh,
        active: false,
        speed: 0.46 + Math.random() * 0.26,
        baseX: 0,
        baseZ: 0,
        currX: 0,
        currY: 0,
        currZ: 0,
        wobbleSpeed: 4.5 + Math.random() * 3.5,
        wobbleOffset: Math.random() * Math.PI * 2,
        wobbleAmp: 0.014 + Math.random() * 0.008,
      });
    }

    const tempLeafWorldPos = new THREE.Vector3();
    function spawnLeafEscapingBubble(cb: LeafClingingBubble) {
      const inactive = leafEscapingBubbles.find((b) => !b.active);
      if (!inactive) return;

      cb.group.getWorldPosition(tempLeafWorldPos);
      inactive.active = true;
      inactive.group.visible = true;
      inactive.baseX = tempLeafWorldPos.x;
      inactive.baseZ = tempLeafWorldPos.z;
      inactive.currX = tempLeafWorldPos.x;
      inactive.currY = tempLeafWorldPos.y + 0.02;
      inactive.currZ = tempLeafWorldPos.z;
      inactive.group.position.set(inactive.currX, inactive.currY, inactive.currZ);
      const randomScale = 0.75 + Math.random() * 0.5;
      inactive.group.scale.setScalar(randomScale);
    }

    // 7. Glistening O2 Product Bubbles (Bọt khí Oxy sinh ra từ quang hợp - Đi qua phễu vào ống nghiệm)
    const maxO2Bubbles = 50;
    const o2BubblesGroup = new THREE.Group();
    o2BubblesGroup.renderOrder = 12;
    scene.add(o2BubblesGroup);

    interface O2BubbleItem {
      group: THREE.Group;
      mesh: THREE.Mesh;
      active: boolean;
      speed: number;
      baseX: number;
      baseZ: number;
      offset: number;
      wobbleSpeed: number;
    }
    const o2Bubbles: O2BubbleItem[] = [];

    // Conspicuous sizes for O2 bubbles (viên ngọc khí tròn căng, nhìn cực rõ)
    const o2GeoSmall = new THREE.SphereGeometry(0.068, 18, 18);
    const o2GeoMed = new THREE.SphereGeometry(0.086, 18, 18);
    const o2GeoLarge = new THREE.SphereGeometry(0.104, 18, 18);

    // Glowing translucent cyan-tinted physical bubble material (vỏ bóng kính khúc xạ ánh sáng)
    const o2BubbleMat = new THREE.MeshPhysicalMaterial({
      color: 0xcffafe,
      emissive: 0x0284c7,
      emissiveIntensity: 0.75,
      roughness: 0.04,
      metalness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      reflectivity: 0.95,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
    });

    for (let i = 0; i < maxO2Bubbles; i++) {
      const bGroup = new THREE.Group();
      bGroup.visible = false;
      o2BubblesGroup.add(bGroup);

      const r = i % 3 === 0 ? 0.104 : i % 3 === 1 ? 0.086 : 0.068;
      const geo = i % 3 === 0 ? o2GeoLarge : i % 3 === 1 ? o2GeoMed : o2GeoSmall;
      const bMesh = new THREE.Mesh(geo, o2BubbleMat);
      bGroup.add(bMesh);

      // Specular highlight spot at top-left-front of bubble
      const glintGeo = new THREE.SphereGeometry(r * 0.28, 8, 8);
      const glint = new THREE.Mesh(glintGeo, o2GlintMat);
      glint.position.set(r * 0.38, r * 0.45, r * 0.38);
      bGroup.add(glint);

      o2Bubbles.push({
        group: bGroup,
        mesh: bMesh,
        active: false,
        speed: 0.52 + Math.random() * 0.25,
        baseX: (Math.random() - 0.5) * 0.025,
        baseZ: (Math.random() - 0.5) * 0.025,
        offset: Math.random() * Math.PI * 2,
        wobbleSpeed: 5 + Math.random() * 4,
      });
    }

    // 8. Effervescent Dissolved CO2 Micro-Bubbles (Bọt khí CO2 sủi tăm li ti từ NaHCO3 lan tỏa trong nước)
    const maxCo2Bubbles = 60;
    const co2BubblesGroup = new THREE.Group();
    co2BubblesGroup.renderOrder = 8;
    scene.add(co2BubblesGroup);

    interface Co2BubbleItem {
      mesh: THREE.Mesh;
      active: boolean;
      speed: number;
      baseX: number;
      baseZ: number;
      swirlPhase: number;
      swirlRadius: number;
    }
    const co2Bubbles: Co2BubbleItem[] = [];

    const co2Geo1 = new THREE.SphereGeometry(0.034, 12, 12);
    const co2Geo2 = new THREE.SphereGeometry(0.046, 12, 12);
    const co2Geo3 = new THREE.SphereGeometry(0.058, 12, 12);

    const co2BubbleMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.48,
      roughness: 0.06,
      metalness: 0.08,
      clearcoat: 0.9,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });

    for (let i = 0; i < maxCo2Bubbles; i++) {
      const geo = i % 3 === 0 ? co2Geo3 : i % 3 === 1 ? co2Geo2 : co2Geo1;
      const cbMesh = new THREE.Mesh(geo, co2BubbleMat);
      cbMesh.visible = false;
      co2BubblesGroup.add(cbMesh);

      co2Bubbles.push({
        mesh: cbMesh,
        active: false,
        speed: 0.42 + Math.random() * 0.32,
        baseX: 0,
        baseZ: 0,
        swirlPhase: Math.random() * Math.PI * 2,
        swirlRadius: 0.02 + Math.random() * 0.045,
      });
    }

    // 9. Optical Bench Rail Track with Metric Graduations (Ray quang học chia vạch cm)
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

    // 10. Moveable Bench Lamp with Volumetric Light Beam & Floating Photons
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
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
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
      transparent: true,
      opacity: 0.42,
      roughness: 0.05,
      clearcoat: 0.9,
      depthWrite: false,
    });
    const filterMesh = new THREE.Mesh(filterGeo, filterMat);
    filterMesh.position.set(0.72, 1.85, 0);
    lampRig.add(filterMesh);

    // 11. Glowing Wooden Splint & Combustion Flame (Que đóm thử khí Oxy bùng cháy)
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

    // 12. 3D Anatomical Pin Callouts
    const anatomyGroup = new THREE.Group();
    scene.add(anatomyGroup);

    function createPin(x: number, y: number, z: number, label: string, colorHex = 0x06b6d4) {
      const pin = new THREE.Group();
      pin.position.set(x, y, z);

      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 16, 16),
        new THREE.MeshStandardMaterial({ color: colorHex, emissive: colorHex, emissiveIntensity: 0.8 })
      );
      pin.add(sphere);

      const stalkLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.45, 0)]),
        new THREE.LineBasicMaterial({ color: colorHex })
      );
      pin.add(stalkLine);

      // Canvas badge
      const canvas = document.createElement('canvas');
      canvas.width = 280;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.roundRect(0, 0, 280, 64, 16);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 140, 32);

      const tex = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(0, 0.65, 0);
      sprite.scale.set(1.5, 0.38, 1);
      pin.add(sprite);

      return pin;
    }

    const pin1 = createPin(0, 3.4, 0, '1. Ống nghiệm thu O₂', 0x38bdf8);
    const pin2 = createPin(0, 1.15, 0, '2. Vết cắt xéo giải phóng O₂', 0x22c55e);
    const pin3 = createPin(-0.35, 0.65, 0.2, '3. Bọt khí O₂ bám & thoát từ lá', 0x10b981);
    const pin4 = createPin(0.65, 0.35, 0.45, '4. Viên NaHCO₃ sủi bọt CO₂', 0xf59e0b);
    anatomyGroup.add(pin1, pin2, pin3, pin4);
    anatomyGroup.visible = false;

    // Animation & Calculation Loop
    let animationFrameId: number;
    const timer = new THREE.Timer();
    timer.connect(document);
    let o2SpawnCounter = 0;
    let co2SpawnCounter = 0;
    let leafEscapeTimer = 0;
    let lastReportedBpm = -1;
    let lastReportedVol = -1;
    let lastReportTime = 0;

    const animate = (timestamp?: number) => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isActiveRef.current) return;

      timer.update(timestamp);
      const delta = Math.min(timer.getDelta(), 0.1);
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
      clingingBubbleMat.emissive.setHex(filterHex === 0xffffff ? 0x38bdf8 : filterHex);
      leafEscapingMat.emissive.setHex(filterHex === 0xffffff ? 0x0ea5e9 : filterHex);

      const intensityScale = (100 - (s.lampDistance - 10) * 0.7) / 100;
      spotLight.intensity = Math.max(1.5, intensityScale * 9.5);
      beamMat.opacity = Math.max(0.06, intensityScale * 0.22);

      // Gentle natural underwater leaf swaying animation
      const time = timer.getElapsed();
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

      const o2GasTopLimit = Math.max(1.5, tubeMeniscus.position.y);
      const waterTopLimit = 2.45;
      const visualSpeedMultiplier = playing ? Math.min(2.0, 0.85 + s.timeMultiplier * 0.2) : 0.1;

      // 1a. Bọt khí Oxy li ti bám trên lá: lớn dần theo cường độ quang hợp, lấp lánh và tách ra khi đủ lớn
      for (const cb of clingingBubbles) {
        if (playing && bubblesPerMinute > 0.5) {
          // Bọt khí lớn dần theo tốc độ quang hợp và hệ số tua nhanh thời gian
          cb.currentRadius += cb.growthRate * rateNormalized * s.timeMultiplier * delta;

          // Hiệu ứng phập phồng sinh học & khúc xạ lấp lánh
          const pulse = 1 + Math.sin(time * cb.pulseSpeed + cb.pulsePhase) * 0.09;
          const displayRadius = Math.max(0.006, cb.currentRadius * pulse);
          cb.group.scale.setScalar(displayRadius);
          cb.group.visible = true;

          // Khi bọt khí tích tụ đủ lớn -> thắng lực căng bề mặt và tách ra khỏi phiến lá!
          if (cb.currentRadius >= cb.maxRadius) {
            spawnLeafEscapingBubble(cb);
            // Bọt mới li ti bắt đầu hình thành lại tại vị trí đó
            cb.currentRadius = 0.007 + Math.random() * 0.006;
            cb.maxRadius = 0.026 + Math.random() * 0.016;
          }
        } else {
          // Khi tắt đèn hoặc dừng: bọt khí co nhỏ lại trạng thái li ti ban đầu
          cb.currentRadius = Math.max(0.010, cb.currentRadius - delta * 0.005);
          cb.group.scale.setScalar(cb.currentRadius);
        }
      }

      // 1b. Dòng khí thoát ra liên tục từ các phiến lá khi quang hợp diễn ra
      if (playing && bubblesPerMinute > 0.5) {
        leafEscapeTimer += delta;
        const streamFreq = (bubblesPerMinute / 60) * 1.6 * Math.min(3.0, 0.9 + s.timeMultiplier * 0.3);
        const streamInterval = Math.max(0.10, 1.2 / Math.max(0.1, streamFreq));

        if (leafEscapeTimer >= streamInterval) {
          leafEscapeTimer = 0;
          const randomSite = clingingBubbles[Math.floor(Math.random() * clingingBubbles.length)];
          if (randomSite) {
            spawnLeafEscapingBubble(randomSite);
            randomSite.currentRadius = 0.008 + Math.random() * 0.005;
          }
        }
      }

      // 1c. Bọt khí thoát từ phiến lá uốn lượn bay lên qua phễu thu vào ống nghiệm
      for (const lb of leafEscapingBubbles) {
        if (!lb.active) continue;

        lb.currY += lb.speed * delta * visualSpeedMultiplier;
        const wobbleX = Math.sin(time * lb.wobbleSpeed + lb.wobbleOffset) * lb.wobbleAmp;
        const wobbleZ = Math.cos(time * lb.wobbleSpeed + lb.wobbleOffset) * lb.wobbleAmp;

        // Bề mặt phễu thủy tinh dốc thu gom bọt khí hướng về phía cổ phễu (y ~ 1.125)
        if (lb.currY < 1.15) {
          const funnelPull = delta * (2.2 + Math.max(0, lb.currY - 0.3) * 2.5);
          lb.baseX = THREE.MathUtils.lerp(lb.baseX, 0, funnelPull);
          lb.baseZ = THREE.MathUtils.lerp(lb.baseZ, 0, funnelPull);
        } else {
          // Đã lọt vào cuống phễu và ống nghiệm (y >= 1.15): giữ gọn trong lòng ống nghiệm
          lb.baseX = THREE.MathUtils.lerp(lb.baseX, 0, delta * 3.8);
          lb.baseZ = THREE.MathUtils.lerp(lb.baseZ, 0, delta * 3.8);
        }

        lb.group.position.set(lb.baseX + wobbleX, lb.currY, lb.baseZ + wobbleZ);

        // Chạm vào lớp khí Oxy thu được trên đỉnh ống nghiệm
        if (lb.currY >= o2GasTopLimit) {
          lb.active = false;
          lb.group.visible = false;
          if (playing) {
            collectedVolRef.current = Math.min(100, collectedVolRef.current + 0.04 * s.timeMultiplier * delta);
          }
        } else if (lb.currY >= waterTopLimit) {
          lb.active = false;
          lb.group.visible = false;
        }
      }

      // 1d. Emit O2 bubbles from cut stem port (bọt khí từ vết cắt cuống)
      if (playing && bubblesPerMinute > 0.5) {
        // Effective spawn frequency scales with photosynthesis rate and time multiplier
        const spawnFrequency = (bubblesPerMinute / 60) * Math.min(2.5, 0.8 + s.timeMultiplier * 0.25);
        const spawnInterval = Math.max(0.08, 1.0 / Math.max(0.1, spawnFrequency));
        o2SpawnCounter += delta;

        if (o2SpawnCounter >= spawnInterval) {
          o2SpawnCounter = 0;
          const inactive = o2Bubbles.find((b) => !b.active);
          if (inactive) {
            inactive.active = true;
            inactive.group.visible = true;
            inactive.baseX = (Math.random() - 0.5) * 0.025;
            inactive.baseZ = (Math.random() - 0.5) * 0.025;
            inactive.group.position.set(inactive.baseX, 1.13, inactive.baseZ);
            inactive.group.scale.setScalar(0.75 + Math.random() * 0.45);
          }
        }
      }

      for (const b of o2Bubbles) {
        if (!b.active) continue;
        b.group.position.y += b.speed * delta * visualSpeedMultiplier;
        b.group.position.x = b.baseX + Math.sin(time * b.wobbleSpeed + b.offset) * 0.016;
        b.group.position.z = b.baseZ + Math.cos(time * b.wobbleSpeed + b.offset) * 0.016;

        if (b.group.position.y >= o2GasTopLimit) {
          b.active = false;
          b.group.visible = false;
        }
      }

      // 2. Emit Effervescent Dissolved CO2 micro-bubbles from NaHCO3 tablet & beaker floor
      if (playing && s.co2Concentration > 0.05) {
        const co2Interval = Math.max(0.035, 0.45 / (s.co2Concentration * Math.min(3.0, 0.8 + s.timeMultiplier * 0.2)));
        co2SpawnCounter += delta;

        if (co2SpawnCounter >= co2Interval) {
          co2SpawnCounter = 0;
          const inactiveCo2 = co2Bubbles.find((cb) => !cb.active);
          if (inactiveCo2) {
            inactiveCo2.active = true;
            inactiveCo2.mesh.visible = true;
            // 80% spawn from NaHCO3 tablet, 20% disperse from beaker base
            if (Math.random() < 0.8) {
              inactiveCo2.baseX = tabletGroup.position.x + (Math.random() - 0.5) * 0.28;
              inactiveCo2.baseZ = tabletGroup.position.z + (Math.random() - 0.5) * 0.28;
              inactiveCo2.mesh.position.set(inactiveCo2.baseX, 0.14, inactiveCo2.baseZ);
            } else {
              const r = 0.35 + Math.random() * 0.7;
              const th = Math.random() * Math.PI * 2;
              inactiveCo2.baseX = Math.sin(th) * r;
              inactiveCo2.baseZ = Math.cos(th) * r;
              inactiveCo2.mesh.position.set(inactiveCo2.baseX, 0.12, inactiveCo2.baseZ);
            }
            inactiveCo2.mesh.scale.setScalar(0.75 + Math.random() * 0.5);
          }
        }
      }

      for (const cb of co2Bubbles) {
        if (!cb.active) continue;
        cb.mesh.position.y += cb.speed * delta * visualSpeedMultiplier;
        cb.mesh.position.x = cb.baseX + Math.sin(time * 5 + cb.swirlPhase) * cb.swirlRadius;
        cb.mesh.position.z = cb.baseZ + Math.cos(time * 5 + cb.swirlPhase) * cb.swirlRadius;

        if (cb.mesh.position.y >= waterTopLimit) {
          cb.active = false;
          cb.mesh.visible = false;
        }
      }

      // NaHCO3 effervescence ring pulse
      tabletRing.scale.setScalar(1 + Math.sin(time * 4) * 0.1);

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
        const roundedVol = Math.round(collectedVolRef.current * 10) / 10;
        const now = performance.now();
        if (
          (bubblesPerMinute !== lastReportedBpm || roundedVol !== lastReportedVol) &&
          (now - lastReportTime >= 200 || bubblesPerMinute !== lastReportedBpm)
        ) {
          lastReportedBpm = bubblesPerMinute;
          lastReportedVol = roundedVol;
          lastReportTime = now;
          onUpdateBubbleRate(bubblesPerMinute, roundedVol);
        }
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
      timer.dispose();
      controls.dispose();
      disposeSceneResources(scene);
      renderer.dispose();
      renderer.forceContextLoss();
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

        {/* Toggle Bubble Details Legend */}
        <button
          onClick={() => setShowBubbleDetails((prev) => !prev)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md border transition cursor-pointer flex items-center gap-1.5 shadow-sm ${
            showBubbleDetails
              ? 'bg-cyan-500 text-white border-cyan-400 ring-2 ring-cyan-500/20'
              : isDarkroom
              ? 'bg-slate-900/80 border-slate-700 text-cyan-300 hover:bg-cyan-500/20'
              : 'bg-white/90 border-slate-200 text-cyan-700 hover:bg-cyan-50'
          }`}
        >
          <span>🫧</span> Phân biệt Bọt Khí
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
              ? 'bg-emerald-500 text-white border-emerald-400 ring-2 ring-emerald-500/20'
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
          <span>💡</span> Chỉnh Đèn & Hóa Chất
        </button>
      </div>

      {/* DIRECT INTERACTIVE LAMP & CHEMICAL CONTROL POPUP OVERLAY */}
      {isLampControlOpen && onUpdateState && (
        <div className={`absolute top-16 right-4 z-30 w-84 backdrop-blur-xl border rounded-3xl p-4 shadow-2xl space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200 ${
          isDarkroom ? 'bg-slate-900/95 border-slate-700 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-700/40 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold">
                💡
              </span>
              <div>
                <h4 className="text-xs font-bold leading-tight">Điều Khiển Đèn & Hóa Chất NaHCO₃</h4>
                <p className="text-[10px] text-slate-400">Chỉnh khoảng cách đèn, nồng độ CO₂ & kính lọc</p>
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

          {/* 2. CO2 Concentration Slider & Quick Dissolve */}
          <div className={`space-y-1.5 p-3 rounded-2xl border ${
            isDarkroom ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Nồng độ CO₂ hòa tan (NaHCO₃)
              </span>
              <span className="font-mono text-cyan-400 font-extrabold bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30 text-xs">
                {state.co2Concentration.toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="4.0"
              step="0.5"
              value={state.co2Concentration}
              onChange={(e) => {
                const val = Number(e.target.value);
                onUpdateState((prev) => ({ ...prev, co2Concentration: val }));
              }}
              className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
            />
            <div className="flex justify-between gap-1 pt-1">
              {[0, 1.0, 2.0, 3.5].map((preset) => (
                <button
                  key={preset}
                  onClick={() => onUpdateState((prev) => ({ ...prev, co2Concentration: preset }))}
                  className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition cursor-pointer ${
                    state.co2Concentration === preset
                      ? 'bg-cyan-500 text-white border-cyan-600 shadow-xs'
                      : isDarkroom
                      ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>

          {/* 3. Color Filter */}
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

          {/* 4. Quick Tweak Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
            <button
              onClick={() => onUpdateState((prev) => ({ ...prev, co2Concentration: prev.co2Concentration >= 3.5 ? 0.5 : prev.co2Concentration + 1.0 }))}
              className="py-1.5 px-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-xl font-bold hover:bg-cyan-500/30 transition cursor-pointer text-center"
            >
              + Hòa tan NaHCO₃ (CO₂)
            </button>
            <button
              onClick={() => onUpdateState((prev) => ({ ...prev, waterTemperature: 30 }))}
              className="py-1.5 px-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold hover:bg-emerald-500/30 transition cursor-pointer text-center"
            >
              Nước tối ưu 30°C
            </button>
          </div>
        </div>
      )}

      {/* Sleek Compact Live Gas Bubble Stream Indicator (Nhỏ gọn & Con số siêu rõ nét) */}
      <div className={`absolute bottom-4 left-4 border backdrop-blur-xl p-2.5 rounded-2xl shadow-xl space-y-1.5 w-auto min-w-[200px] max-w-[240px] z-20 transition-all ${
        isDarkroom
          ? 'bg-slate-950/92 border-cyan-500/40 text-slate-100 shadow-cyan-950/40'
          : 'bg-white/95 border-sky-300 text-slate-800 shadow-sky-900/10'
      }`}>
        {/* O2 stream indicator */}
        <div>
          <div className="flex items-center justify-between pb-1">
            <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
              isDarkroom ? 'text-cyan-400' : 'text-sky-800'
            }`}>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Bọt khí Oxy (O₂)
              <span className="text-[9px] font-normal opacity-75">(từ lá & cuống)</span>
            </span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
              state.bubblesPerMinute > 30
                ? isDarkroom ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : state.bubblesPerMinute > 10
                ? isDarkroom ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30' : 'bg-sky-100 text-sky-800 border border-sky-300'
                : isDarkroom ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-100 text-slate-600 border border-slate-300'
            }`}>
              {state.bubblesPerMinute > 30 ? 'Rất mạnh' : state.bubblesPerMinute > 10 ? 'Ổn định' : 'Yếu/Ngừng'}
            </span>
          </div>

          <div className={`flex items-baseline justify-between px-2.5 py-1.5 rounded-xl border ${
            isDarkroom
              ? 'bg-slate-900/90 border-cyan-500/30 text-cyan-300'
              : 'bg-sky-50 border-sky-200 text-sky-950'
          }`}>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-black font-mono tracking-tight ${
                isDarkroom ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'text-sky-950 font-black'
              }`}>
                {state.bubblesPerMinute}
              </span>
              <span className={`text-xs font-bold ${
                isDarkroom ? 'text-cyan-400' : 'text-sky-700'
              }`}>
                bọt / phút
              </span>
            </div>
            <span className="text-base animate-bounce">🫧</span>
          </div>
        </div>

        {/* CO2 stream indicator & quick add button */}
        <div className={`border-t pt-1.5 flex items-center justify-between gap-1 text-[10px] ${
          isDarkroom ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center gap-1 font-medium">
            <span>⚪ CO₂:</span>
            <strong className={`font-mono font-bold ${isDarkroom ? 'text-cyan-300' : 'text-cyan-800'}`}>
              {state.co2Concentration}%
            </strong>
          </div>
          {onUpdateState && (
            <button
              onClick={() =>
                onUpdateState((prev) => ({
                  ...prev,
                  co2Concentration:
                    prev.co2Concentration >= 3.5
                      ? 0.5
                      : Math.round((prev.co2Concentration + 0.5) * 10) / 10,
                }))
              }
              className={`px-2 py-0.5 rounded-lg border font-bold transition cursor-pointer text-[10px] ${
                isDarkroom
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                  : 'bg-sky-100 hover:bg-sky-200 text-sky-800 border-sky-300'
              }`}
              title="Tăng nồng độ CO2 hòa tan từ NaHCO3"
            >
              + Bơm CO₂
            </button>
          )}
        </div>

        {/* Educational note on gas origin (collapsible) */}
        {showBubbleDetails && (
          <div className={`p-2 rounded-xl text-[10px] leading-relaxed border animate-in fade-in duration-200 ${
            isDarkroom
              ? 'bg-slate-900/95 border-cyan-500/30 text-slate-300'
              : 'bg-slate-50 border-sky-200 text-slate-600'
          }`}>
            💡 <strong>Phân biệt:</strong> Bọt khí <strong>CO₂ li ti</strong> sủi từ viên NaHCO₃; lá rong hấp thụ CO₂ quang hợp giải phóng <strong>bọt khí O₂ li ti bám trên lá</strong>, lớn dần rồi <strong>tách và thoát ra từ lá</strong> & cuống rong nổi lên ống nghiệm!
          </div>
        )}
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
        <div className={`absolute top-16 left-4 border backdrop-blur-xl p-3.5 rounded-2xl text-xs shadow-2xl max-w-[360px] space-y-2 animate-in fade-in duration-200 z-30 ${
          isDarkroom ? 'bg-slate-950/95 border-cyan-500/50 text-slate-200' : 'bg-white/95 border-cyan-400 text-slate-800'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-1.5">
            <span className="font-bold text-cyan-400 flex items-center gap-1.5">
              <span>🌿</span> Cấu Tạo Thí Nghiệm & Dòng Khí Quang Hợp
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
              <span className="text-cyan-400 font-bold shrink-0">1. Khí O₂:</span>
              <span className="text-slate-300">Sản phẩm quang hợp thoát ra từ bề mặt phiến lá (bọt khí li ti bám và tách bay lên) và từ vết cắt cuống rong, qua cuống phễu thu vào đỉnh ống nghiệm.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-amber-400 font-bold shrink-0">2. Khí CO₂:</span>
              <span className="text-slate-300">Muối NaHCO₃ phân ly sủi vi bọt khí CO₂ trong nước, khuếch tán qua lớp biểu bì phiến lá rong để cung cấp nguyên liệu cho pha tối (chu trình Calvin).</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold shrink-0">3. Vết cắt xéo 45°:</span>
              <span className="text-slate-300">Cắt chéo cuống rong để mở các ống khí mô (aerenchyma), giúp bọt khí O₂ thoát ra đều đặn, liên tục để học sinh dễ đếm.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold shrink-0">4. Rong đuôi chó:</span>
              <span className="text-slate-300">Thực vật thủy sinh có phiến lá mỏng ngập nước, nhiều lục lạp, có khả năng quang hợp mạnh trong điều kiện ngập nước.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-pink-400 font-bold shrink-0">5. Kính lọc màu & Đèn:</span>
              <span className="text-slate-300">Thay đổi khoảng cách và bước sóng ánh sáng để khảo sát tốc độ thoát bọt khí O₂ của cành rong.</span>
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
        <span>💡 <strong>Quan sát:</strong> Bọt khí O₂ li ti bám & thoát ra từ bề mặt phiến lá rong và cuống nổi lên ống nghiệm • Bọt khí CO₂ sủi từ viên NaHCO₃</span>
        <span>•</span>
        <span>🖱️ Xoay 3D 360°</span>
      </div>
    </div>
  );
}
