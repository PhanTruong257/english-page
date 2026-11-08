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
  onOpenInquiry?: () => void;
  isPlaying: boolean;
}

export default function RootTropismScene({
  state,
  onUpdateState,
  onUpdateRootAngle,
  onOpenInquiry,
  isPlaying,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentAngleRef = useRef(0);

  // Darkroom Mode state (Default TRUE for high-contrast directional spotlight observation)
  const [isDarkroom, setIsDarkroom] = useState<boolean>(true);
  const darkroomRef = useRef<boolean>(true);
  darkroomRef.current = isDarkroom;

  // Environment Controller Ref
  const envControllerRef = useRef<{ setDarkroom: (dark: boolean) => void } | null>(null);

  // Anatomical Callout Pins Toggle
  const [showAnatomy, setShowAnatomy] = useState<boolean>(false);
  const showAnatomyRef = useRef<boolean>(false);
  showAnatomyRef.current = showAnatomy;

  // Direct Interactive Water & Chamber Popover
  const [isWaterControlOpen, setIsWaterControlOpen] = useState(false);

  const toggleDarkroom = () => {
    const nextVal = !isDarkroom;
    setIsDarkroom(nextVal);
    darkroomRef.current = nextVal;
    if (envControllerRef.current) {
      envControllerRef.current.setDarkroom(nextVal);
    }
  };

  const toggleXray = () => {
    if (!onUpdateState) return;
    onUpdateState((prev) => ({ ...prev, xrayStatoliths: !prev.xrayStatoliths }));
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
    camera.position.set(0, 3.4, 7.8);

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
    controls.minDistance = 2.4;
    controls.maxDistance = 16;
    controls.target.set(0, 1.65, 0);

    // 2. Setup Realistic Biology Laboratory Environment (Darkroom mode default)
    const env = setupLabEnvironment(scene, { isDarkroom: darkroomRef.current });
    envControllerRef.current = env;

    // 3. Articulated Inspection Spotlight Lamp on Workbench (Đèn bàn phòng lab chiếu rọi hộp rễ)
    const lampGroup = new THREE.Group();
    lampGroup.position.set(-2.8, 0, -0.6);
    scene.add(lampGroup);

    // Heavy Circular Base
    const lampBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.6, 0.1, 32),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.3 })
    );
    lampBase.position.y = 0.05;
    lampBase.castShadow = true;
    lampGroup.add(lampBase);

    // Articulated Lower Arm
    const lowerArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.038, 1.7, 16),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 })
    );
    lowerArm.position.set(0.2, 0.9, 0.2);
    lowerArm.rotation.z = -Math.PI / 8;
    lowerArm.rotation.x = Math.PI / 12;
    lowerArm.castShadow = true;
    lampGroup.add(lowerArm);

    // Articulated Upper Arm
    const upperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.032, 1.6, 16),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 })
    );
    upperArm.position.set(0.65, 2.3, 0.35);
    upperArm.rotation.z = -Math.PI / 4;
    upperArm.rotation.x = Math.PI / 10;
    upperArm.castShadow = true;
    lampGroup.add(upperArm);

    // Lamp Shade pointing directly at Rhizotron box
    const lampShade = new THREE.Mesh(
      new THREE.ConeGeometry(0.48, 0.82, 32, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.75, roughness: 0.25, side: THREE.DoubleSide })
    );
    lampShade.position.set(1.4, 2.75, 0.55);
    lampShade.rotation.z = -Math.PI / 3;
    lampShade.rotation.x = Math.PI / 7;
    lampShade.castShadow = true;
    lampGroup.add(lampShade);

    // Inner metallic reflector
    const reflector = new THREE.Mesh(
      new THREE.ConeGeometry(0.46, 0.78, 32, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.95, roughness: 0.08, side: THREE.DoubleSide })
    );
    reflector.position.copy(lampShade.position);
    reflector.rotation.copy(lampShade.rotation);
    lampGroup.add(reflector);

    // LED Bulb with emissive glow
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 20, 20),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 3.2 })
    );
    bulb.position.copy(lampShade.position);
    lampGroup.add(bulb);

    // High-Contrast Focused SpotLight illuminating the root chamber
    const spotLight = new THREE.SpotLight(0xfffbeb, 6.5, 14, Math.PI / 3.2, 0.3, 1);
    spotLight.position.copy(lampShade.position);
    spotLight.target.position.set(2.8, 1.65, 0.6);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.bias = -0.0004;
    lampGroup.add(spotLight);
    lampGroup.add(spotLight.target);

    // Atmospheric Volumetric Light Cone shining on the chamber
    const beamGeo = new THREE.ConeGeometry(1.6, 3.8, 32, 1, true);
    beamGeo.translate(0, -1.9, 0);
    beamGeo.rotateZ(Math.PI / 2.8);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.position.copy(lampShade.position);
    lampGroup.add(beamMesh);

    // Floating Photon Motes / Dust inside spotlight beam
    const dustCount = 50;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3 + 0] = lampShade.position.x + 0.3 + Math.random() * 2.2;
      dustPos[i * 3 + 1] = lampShade.position.y - 0.2 - Math.random() * 1.5;
      dustPos[i * 3 + 2] = lampShade.position.z + (Math.random() - 0.5) * 1.2;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.045,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    lampGroup.add(dustPoints);

    // 4. Heavy Desktop Swivel Turntable Base (Đế xoay hợp kim có thước đo độ)
    const standBaseGroup = new THREE.Group();
    scene.add(standBaseGroup);

    // Solid Anodized Aluminum Turntable Foot
    const standBase = new THREE.Mesh(
      new THREE.CylinderGeometry(1.25, 1.35, 0.14, 48),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.3 })
    );
    standBase.position.y = 0.07;
    standBase.castShadow = true;
    standBase.receiveShadow = true;
    standBaseGroup.add(standBase);

    // Center Heavy Swivel Column
    const centerColumn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.18, 1.65, 24),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 })
    );
    centerColumn.position.set(0, 0.9, -0.42);
    centerColumn.castShadow = true;
    standBaseGroup.add(centerColumn);

    // Brass Rotary Locking Thumbscrew Knob
    const lockKnob = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.25, 16),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95, roughness: 0.2 })
    );
    lockKnob.rotation.x = Math.PI / 2;
    lockKnob.position.set(0.18, 1.2, -0.42);
    standBaseGroup.add(lockKnob);

    // Calibrated Protractor Angle Dial Plate on rear swivel
    const dialPlate = new THREE.Mesh(
      new THREE.CircleGeometry(0.52, 48),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.75, roughness: 0.25 })
    );
    dialPlate.position.set(0, 1.65, -0.34);
    standBaseGroup.add(dialPlate);

    // Protractor Tick Mark lines (0° to 180°)
    const dialMarkMat = new THREE.LineBasicMaterial({ color: 0xffffff });
    for (let deg = 0; deg <= 180; deg += 30) {
      const rad = (deg * Math.PI) / 180;
      const tickGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(Math.cos(rad) * 0.42, 1.65 + Math.sin(rad) * 0.42, -0.33),
        new THREE.Vector3(Math.cos(rad) * 0.50, 1.65 + Math.sin(rad) * 0.50, -0.33),
      ]);
      const tick = new THREE.Line(tickGeo, dialMarkMat);
      standBaseGroup.add(tick);
    }

    // 5. Scientific Rhizotron Chamber Rig (Hộp quan sát rễ phẳng 2 mặt kính)
    const chamberRig = new THREE.Group();
    chamberRig.position.set(0, 1.65, 0);
    scene.add(chamberRig);

    // Aerospace-Grade Titanium Alloy Frame
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.88,
      roughness: 0.22,
    });

    const frameThickness = 0.14;
    const boxW = 3.65;
    const boxH = 3.45;
    const boxD = 0.44;

    // Top Bar with Seed Planting Notch Slot
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(boxW, frameThickness, boxD), frameMat);
    topBar.position.y = boxH / 2;
    topBar.castShadow = true;
    chamberRig.add(topBar);

    // Bottom Bar
    const btmBar = new THREE.Mesh(new THREE.BoxGeometry(boxW, frameThickness, boxD), frameMat);
    btmBar.position.y = -boxH / 2;
    btmBar.castShadow = true;
    chamberRig.add(btmBar);

    // Left Bar
    const leftBar = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, boxH, boxD), frameMat);
    leftBar.position.x = -boxW / 2;
    leftBar.castShadow = true;
    chamberRig.add(leftBar);

    // Right Bar
    const rightBar = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, boxH, boxD), frameMat);
    rightBar.position.x = boxW / 2;
    rightBar.castShadow = true;
    chamberRig.add(rightBar);

    // Knurled Corner Clamping Screws (Ốc siết 4 góc bằng đồng thau)
    const screwMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95, roughness: 0.2 });
    const screwGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.48, 16);
    screwGeo.rotateX(Math.PI / 2);

    const screwOffsets = [
      [-boxW / 2 + 0.2, boxH / 2 - 0.2],
      [boxW / 2 - 0.2, boxH / 2 - 0.2],
      [-boxW / 2 + 0.2, -boxH / 2 + 0.2],
      [boxW / 2 - 0.2, -boxH / 2 + 0.2],
    ];
    screwOffsets.forEach(([sx, sy]) => {
      const screw = new THREE.Mesh(screwGeo, screwMat);
      screw.position.set(sx, sy, 0);
      chamberRig.add(screw);
    });

    // Dark Peat / Moist Nutrient Agar Substrate inside chamber
    const backplateGeo = new THREE.BoxGeometry(3.4, 3.2, 0.06);
    const backplateMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.94,
      metalness: 0.04,
    });
    const backplate = new THREE.Mesh(backplateGeo, backplateMat);
    backplate.position.set(0, 0, -0.08);
    chamberRig.add(backplate);

    // Front Ultra-Clear Borosilicate Viewing Pane (Kính chịu lực siêu trong suốt)
    const glassPaneGeo = new THREE.BoxGeometry(3.4, 3.2, 0.035);
    const glassPaneMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.96,
      opacity: 1,
      transparent: true,
      roughness: 0.03,
      ior: 1.52,
      thickness: 0.25,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
    });
    const glassPane = new THREE.Mesh(glassPaneGeo, glassPaneMat);
    glassPane.position.set(0, 0, 0.18);
    chamberRig.add(glassPane);

    // Precision Metric Tracking Grid Lines (1cm laser etched squares for root measurement)
    const gridLineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.24,
    });
    for (let gy = -1.4; gy <= 1.4; gy += 0.35) {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-1.6, gy, 0.17),
        new THREE.Vector3(1.6, gy, 0.17),
      ]);
      const line = new THREE.Line(lineGeo, gridLineMat);
      chamberRig.add(line);
    }
    for (let gx = -1.4; gx <= 1.4; gx += 0.35) {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(gx, -1.45, 0.17),
        new THREE.Vector3(gx, 1.45, 0.17),
      ]);
      const line = new THREE.Line(lineGeo, gridLineMat);
      chamberRig.add(line);
    }

    // 6. Germinated Bean Seedling (Hạt đậu nảy mầm với cấu trúc thực vật chân thực)
    const seedGroup = new THREE.Group();
    seedGroup.position.set(0, 1.28, 0.08);

    // Two Plump Cotyledon Halves (Hai lá mầm nứt vỏ)
    const cotyledonGeo = new THREE.SphereGeometry(0.24, 24, 24);
    cotyledonGeo.scale(1.25, 0.88, 0.58);
    const cotyledonMat = new THREE.MeshStandardMaterial({
      color: 0x9a3412,
      roughness: 0.55,
      metalness: 0.05,
    });

    const cotyledonL = new THREE.Mesh(cotyledonGeo, cotyledonMat);
    cotyledonL.position.set(-0.08, 0, 0);
    cotyledonL.rotation.z = 0.18;
    cotyledonL.castShadow = true;
    seedGroup.add(cotyledonL);

    const cotyledonR = new THREE.Mesh(cotyledonGeo, cotyledonMat);
    cotyledonR.position.set(0.08, 0, 0);
    cotyledonR.rotation.z = -0.18;
    cotyledonR.castShadow = true;
    seedGroup.add(cotyledonR);

    // Pale Ivory Nutrient Embryo Core revealed between cotyledons
    const embryoGeo = new THREE.SphereGeometry(0.14, 16, 16);
    embryoGeo.scale(0.85, 1.25, 0.85);
    const embryoMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.45 });
    const embryo = new THREE.Mesh(embryoGeo, embryoMat);
    embryo.position.set(0, -0.04, 0.04);
    seedGroup.add(embryo);

    // Emergent Tender Green Epicotyl Shoot (Thân mầm non vươn lên trên)
    const shootGeo = new THREE.CylinderGeometry(0.045, 0.068, 0.58, 16);
    shootGeo.translate(0, 0.32, 0);
    const shootMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.38 });
    const shoot = new THREE.Mesh(shootGeo, shootMat);
    shoot.castShadow = true;
    seedGroup.add(shoot);

    // Botanical Dicot True Leaf Geometry Generator (Phiến lá thật 3D có độ khum & gân lá)
    function createTrueLeafGeo(): THREE.BufferGeometry {
      const leafShape = new THREE.Shape();
      leafShape.moveTo(0, 0);
      leafShape.bezierCurveTo(0.08, 0.15, 0.18, 0.38, 0.16, 0.58);
      leafShape.bezierCurveTo(0.14, 0.72, 0.06, 0.88, 0, 1.0);
      leafShape.bezierCurveTo(-0.06, 0.88, -0.14, 0.72, -0.16, 0.58);
      leafShape.bezierCurveTo(-0.18, 0.38, -0.08, 0.15, 0, 0);

      const geo = new THREE.ShapeGeometry(leafShape, 12);
      geo.scale(0.48, 0.48, 0.48);

      // Add gentle transverse spoon cupping
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = -Math.sin(y * 3.5) * 0.06 - (x * x) * 0.15;
        pos.setZ(i, z);
      }
      geo.computeVertexNormals();
      return geo;
    }

    const trueLeafGeo = createTrueLeafGeo();
    const trueLeafMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.35,
      metalness: 0.04,
      side: THREE.DoubleSide,
    });

    const leafL = new THREE.Mesh(trueLeafGeo, trueLeafMat);
    leafL.position.set(-0.06, 0.56, 0);
    leafL.rotation.z = Math.PI / 4.5;
    leafL.rotation.y = -Math.PI / 8;
    leafL.castShadow = true;
    seedGroup.add(leafL);

    const leafR = new THREE.Mesh(trueLeafGeo, trueLeafMat);
    leafR.position.set(0.06, 0.56, 0);
    leafR.rotation.z = -Math.PI / 4.5;
    leafR.rotation.y = Math.PI / 8;
    leafR.castShadow = true;
    seedGroup.add(leafR);

    chamberRig.add(seedGroup);

    // 7. Cellulose Moisture Sponge with Radiant Moisture Gradient Halo
    const spongeGroup = new THREE.Group();
    spongeGroup.position.set(-1.18, -0.4, 0.08);

    // Porous Cellulose Sponge Block
    const spongeGeo = new THREE.BoxGeometry(0.8, 0.8, 0.18);
    const spongeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.8,
      metalness: 0.1,
    });
    const sponge = new THREE.Mesh(spongeGeo, spongeMat);
    sponge.castShadow = true;
    spongeGroup.add(sponge);

    // Moisture Diffusion Halo 1 (Quầng ẩm khuếch tán trong thạch)
    const halo1Geo = new THREE.RingGeometry(0.44, 0.62, 36);
    const halo1Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });
    const halo1 = new THREE.Mesh(halo1Geo, halo1Mat);
    halo1.position.z = 0.095;
    spongeGroup.add(halo1);

    // Moisture Diffusion Halo 2 (Outer faint moisture perimeter)
    const halo2Geo = new THREE.RingGeometry(0.64, 0.88, 36);
    const halo2Mat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.32,
    });
    const halo2 = new THREE.Mesh(halo2Geo, halo2Mat);
    halo2.position.z = 0.092;
    spongeGroup.add(halo2);

    chamberRig.add(spongeGroup);

    // 8. Dynamic Organic Taproot Geometry with Root Cap & Root Hairs
    let rootMesh: THREE.Mesh | null = null;
    let rootCapMesh: THREE.Mesh | null = null;
    let rootHairsGroup: THREE.Group | null = null;
    let statolithPoints: THREE.Points | null = null;
    let auxinParticles: THREE.Points | null = null;

    // Statolith particles in Root Cap Columella Cells
    const statolithCount = 65;
    const statolithGeo = new THREE.BufferGeometry();
    const statolithPositions = new Float32Array(statolithCount * 3);
    for (let i = 0; i < statolithCount; i++) {
      statolithPositions[i * 3 + 0] = (Math.random() - 0.5) * 0.12;
      statolithPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.12;
      statolithPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
    }
    statolithGeo.setAttribute('position', new THREE.BufferAttribute(statolithPositions, 3));
    const statolithMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.085,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    statolithPoints = new THREE.Points(statolithGeo, statolithMat);
    statolithPoints.visible = false;
    chamberRig.add(statolithPoints);

    // Auxin transport stream particles
    const auxinCount = 80;
    const auxinGeo = new THREE.BufferGeometry();
    const auxinPositions = new Float32Array(auxinCount * 3);
    const auxinTValues = new Float32Array(auxinCount);
    for (let i = 0; i < auxinCount; i++) {
      auxinTValues[i] = Math.random();
      auxinPositions[i * 3 + 0] = 0;
      auxinPositions[i * 3 + 1] = 0;
      auxinPositions[i * 3 + 2] = 0.08;
    }
    auxinGeo.setAttribute('position', new THREE.BufferAttribute(auxinPositions, 3));
    const auxinMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.07,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    auxinParticles = new THREE.Points(auxinGeo, auxinMat);
    auxinParticles.visible = false;
    chamberRig.add(auxinParticles);

    // Botanical Tapered Taproot Geometry (Rễ cọc mọng nước với các vùng giải phẫu)
    function updateRootGeometry(angleRad: number, s: HydrotropismState) {
      if (rootMesh) chamberRig.remove(rootMesh);
      if (rootCapMesh) chamberRig.remove(rootCapMesh);
      if (rootHairsGroup) chamberRig.remove(rootHairsGroup);

      const length = 2.25;
      const tipX = Math.sin(angleRad) * (length * 0.85);
      const tipY = 1.18 - Math.cos(angleRad) * length;

      const p0 = new THREE.Vector3(0, 1.18, 0.08); // Root collar in seed
      const p1 = new THREE.Vector3(0, 0.52, 0.08); // Zone of cell division
      const p2 = new THREE.Vector3(tipX * 0.65, 1.18 - length * 0.65, 0.08); // Elongation zone bending
      const p3 = new THREE.Vector3(tipX, tipY, 0.08); // Apex tip

      const rootCurve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);

      const segments = 42;
      const radialSegments = 16;
      const frames = rootCurve.computeFrenetFrames(segments, false);
      const vertices: number[] = [];
      const indices: number[] = [];
      const normals: number[] = [];

      for (let i = 0; i <= segments; i++) {
        const u = i / segments;
        const pt = rootCurve.getPointAt(u);
        const N = frames.normals[i];
        const B = frames.binormals[i];

        // Botanical Taper: Base collar (r = 0.092) down to elongation tip (r = 0.040)
        const radius = 0.092 - (u * 0.052);

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

      // Translucent succulent jade-ivory root material
      const rootMat = new THREE.MeshStandardMaterial({
        color: s.xrayStatoliths ? 0x06b6d4 : 0xfef9c3,
        roughness: 0.35,
        metalness: 0.04,
        transparent: s.xrayStatoliths,
        opacity: s.xrayStatoliths ? 0.45 : 1.0,
      });

      rootMesh = new THREE.Mesh(rootGeo, rootMat);
      rootMesh.castShadow = true;
      chamberRig.add(rootMesh);

      // Amber Meristematic Root Cap (Calyptra - Chóp rễ bao bọc mô phân sinh đỉnh)
      const capGeo = new THREE.ConeGeometry(0.048, 0.24, 18);
      capGeo.translate(0, -0.11, 0);
      const capMat = new THREE.MeshStandardMaterial({
        color: s.xrayStatoliths ? 0x38bdf8 : 0xf59e0b,
        roughness: 0.3,
      });
      rootCapMesh = new THREE.Mesh(capGeo, capMat);
      rootCapMesh.position.copy(p3);

      const tangent = rootCurve.getTangent(1);
      const axis = new THREE.Vector3(0, -1, 0);
      rootCapMesh.quaternion.setFromUnitVectors(axis, tangent);
      chamberRig.add(rootCapMesh);

      // Delicate Root Hairs in Maturation Zone (Vùng lông hút rễ li ti)
      rootHairsGroup = new THREE.Group();
      const hairMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.7,
      });

      for (let h = 0.22; h <= 0.68; h += 0.035) {
        const hPt = rootCurve.getPoint(h);
        for (let side of [-1, 1]) {
          const hairGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(hPt.x, hPt.y, 0.08),
            new THREE.Vector3(
              hPt.x + side * (0.09 + Math.random() * 0.06),
              hPt.y + (Math.random() - 0.5) * 0.04,
              0.08
            ),
          ]);
          const hairLine = new THREE.Line(hairGeo, hairMat);
          rootHairsGroup.add(hairLine);
        }
      }
      chamberRig.add(rootHairsGroup);

      // Statolith particles in Root Cap
      if (statolithPoints && s.xrayStatoliths) {
        statolithPoints.visible = true;
        statolithPoints.position.copy(p3);
      } else if (statolithPoints) {
        statolithPoints.visible = false;
      }

      // Update Auxin transport flow along the curve
      if (auxinParticles && s.xrayStatoliths) {
        auxinParticles.visible = true;
        const posAttr = auxinParticles.geometry.attributes.position as THREE.BufferAttribute;
        for (let k = 0; k < auxinCount; k++) {
          const uVal = auxinTValues[k];
          const curvePt = rootCurve.getPoint(uVal);
          // Asymmetric accumulation on the dry/lower side
          const sideOffset = Math.sin(angleRad) > 0 ? -0.045 : 0.045;
          posAttr.setXYZ(k, curvePt.x + sideOffset, curvePt.y, 0.09);
        }
        posAttr.needsUpdate = true;
      } else if (auxinParticles) {
        auxinParticles.visible = false;
      }
    }

    // 9. Anatomical Callout Markers
    const anatomyGroup = new THREE.Group();
    scene.add(anatomyGroup);

    function createPin(x: number, y: number, z: number, label: string) {
      const pin = new THREE.Group();
      pin.position.set(x, y, z);

      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.8 })
      );
      pin.add(sphere);

      const stalkLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.42, 0)]),
        new THREE.LineBasicMaterial({ color: 0x34d399 })
      );
      pin.add(stalkLine);

      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.roundRect(0, 0, 256, 64, 16);
      ctx.fill();
      ctx.strokeStyle = '#10b981';
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
      sprite.position.set(0, 0.62, 0);
      sprite.scale.set(1.4, 0.35, 1);
      pin.add(sprite);

      return pin;
    }

    const pin1 = createPin(0, 2.9, 0.2, 'Lá mầm & Chồi mầm');
    const pin2 = createPin(0, 2.1, 0.2, 'Vùng lông hút rễ');
    const pin3 = createPin(0, 0.6, 0.2, 'Chóp rễ & Thạch lạp');
    const pin4 = createPin(-1.2, 1.2, 0.2, 'Bọt biển cấp ẩm');
    anatomyGroup.add(pin1, pin2, pin3, pin4);
    anatomyGroup.visible = false;

    // Animation & Calculation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const s = stateRef.current;
      const playing = isPlayingRef.current;

      const targetChamberRot = (s.boxRotation * Math.PI) / 180;
      chamberRig.rotation.z = THREE.MathUtils.lerp(chamberRig.rotation.z, targetChamberRot, delta * 3.5);

      // Sponge position
      let spongeX = 0;
      let spongeY = -0.9;
      if (s.waterSourcePos === 'left') {
        spongeX = -1.18;
        spongeY = -0.4;
      } else if (s.waterSourcePos === 'right') {
        spongeX = 1.18;
        spongeY = -0.4;
      } else if (s.waterSourcePos === 'bottom') {
        spongeX = 0;
        spongeY = -1.1;
      } else if (s.waterSourcePos === 'center') {
        spongeX = 0;
        spongeY = -0.5;
      }
      spongeGroup.position.set(spongeX, spongeY, 0.08);

      // Target Root Angle: Bending toward water source + gravity response
      let targetDeg = 0;
      if (s.waterSourcePos === 'left') targetDeg = -38;
      else if (s.waterSourcePos === 'right') targetDeg = 38;
      else if (s.waterSourcePos === 'bottom') targetDeg = 0;

      if (s.boxRotation > 45) {
        targetDeg += 25; // Positive gravitropism bends root downward relative to box tilt
      }

      const targetRad = (targetDeg * Math.PI) / 180;
      const growthRate = playing ? 1.6 * s.timeMultiplier * delta : 0.4 * delta;
      currentAngleRef.current += (targetRad - currentAngleRef.current) * Math.min(growthRate, 0.2);

      if (onUpdateRootAngle) {
        onUpdateRootAngle(Math.round(((currentAngleRef.current * 180) / Math.PI) * 10) / 10);
      }

      updateRootGeometry(currentAngleRef.current, s);

      // Ripple moisture animation
      const time = clock.getElapsedTime();
      halo1.scale.setScalar(1 + Math.sin(time * 3.2) * 0.12);
      halo2.scale.setScalar(1 + Math.cos(time * 2.8) * 0.08);

      // Auxin particle flow speed
      if (auxinParticles && s.xrayStatoliths) {
        for (let k = 0; k < auxinCount; k++) {
          auxinTValues[k] += delta * 0.45;
          if (auxinTValues[k] > 1.0) auxinTValues[k] = 0.0;
        }
      }

      anatomyGroup.visible = showAnatomyRef.current;

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
            ? 'bg-slate-900/85 border-slate-700/80 text-emerald-400'
            : 'bg-white/90 border-slate-200 text-emerald-700'
        }`}>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          Phòng Thí Nghiệm Sinh Học • Mô Hình Hướng Nước & Rễ
        </div>
        <div className={`px-3 py-1.5 rounded-xl border text-[11px] backdrop-blur-md shadow-sm transition-colors ${
          isDarkroom
            ? 'bg-slate-900/80 border-slate-800 text-slate-300'
            : 'bg-white/85 border-slate-200 text-slate-700'
        }`}>
          Nguồn nước ẩm: <strong className="text-sky-400 uppercase">{state.waterSourcePos}</strong> | Góc xoay hộp: <strong className="text-amber-400">{state.boxRotation}°</strong> | Góc uốn rễ: <strong className="text-emerald-400">{Math.round(((currentAngleRef.current * 180) / Math.PI) * 10) / 10}°</strong>
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

        {/* X-Ray Statoliths & Auxin Button */}
        <button
          onClick={toggleXray}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md border transition cursor-pointer flex items-center gap-1.5 shadow-sm ${
            state.xrayStatoliths
              ? 'bg-sky-500 text-white border-sky-400 ring-2 ring-sky-500/30'
              : isDarkroom
              ? 'bg-slate-900/80 border-slate-700 text-sky-400 hover:bg-sky-500/20'
              : 'bg-white/90 border-slate-200 text-sky-700 hover:bg-sky-50'
          }`}
        >
          <span>🧬</span> X-Ray Thạch Lạp
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
          <span>🏷️</span> Chú Thích Rễ
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

        {/* Direct Water & Chamber Toggle Button */}
        <button
          onClick={() => setIsWaterControlOpen((prev) => !prev)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md border transition cursor-pointer flex items-center gap-1.5 shadow-sm ${
            isWaterControlOpen
              ? 'bg-sky-500 text-white border-sky-600 ring-2 ring-sky-500/30'
              : isDarkroom
              ? 'bg-slate-900/80 border-slate-700 text-sky-300 hover:bg-sky-500/20'
              : 'bg-white/90 border-slate-200 text-slate-700 hover:bg-sky-50'
          }`}
        >
          <span>💧</span> Thao tác Nguồn Nước & Hộp
        </button>
      </div>

      {/* DIRECT WATER & CHAMBER INTERACTIVE CONTROL POPUP OVERLAY */}
      {isWaterControlOpen && onUpdateState && (
        <div className={`absolute top-16 right-4 z-30 w-80 backdrop-blur-xl border rounded-3xl p-4 shadow-2xl space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200 ${
          isDarkroom ? 'bg-slate-900/95 border-slate-700 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-700/40 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center text-sm font-bold">
                💧
              </span>
              <div>
                <h4 className="text-xs font-bold leading-tight">Điều Khiển Nguồn Ẩm & Hộp Rễ</h4>
                <p className="text-[10px] text-slate-400">Chuyển nguồn nước & xoay trọng lực</p>
              </div>
            </div>
            <button
              onClick={() => setIsWaterControlOpen(false)}
              className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* 1. Water Source Position */}
          <div className={`space-y-1.5 p-3 rounded-2xl border ${
            isDarkroom ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <label className="text-xs font-bold">Vị trí đặt nguồn cấp ẩm (Miếng bọt biển)</label>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {[
                { id: 'left', label: 'Bên trái 💧' },
                { id: 'bottom', label: 'Ở đáy hộp' },
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
                      : isDarkroom
                      ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Rotate Chamber 90 Degrees */}
          <div className={`space-y-1.5 p-3 rounded-2xl border ${
            isDarkroom ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold">Xoay hộp Rhizotron (Trọng lực)</span>
              <span className="font-mono text-amber-400 font-extrabold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 text-xs">
                {state.boxRotation}°
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onUpdateState((prev) => ({ ...prev, boxRotation: 0 }))}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  state.boxRotation === 0
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : isDarkroom
                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
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
                    : isDarkroom
                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Xoay ngang (90°)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* X-RAY MOLECULAR STATOLITH CARD */}
      {state.xrayStatoliths && (
        <div className={`absolute top-16 left-4 border backdrop-blur-md px-3.5 py-2.5 rounded-2xl text-xs shadow-lg max-w-[280px] z-10 transition-colors animate-in fade-in duration-200 ${
          isDarkroom
            ? 'bg-slate-900/90 border-amber-500/40 text-amber-200'
            : 'bg-amber-50/95 border-amber-300 text-amber-900'
        }`}>
          <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-400">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            X-Ray: Thạch Lạp & Dòng Auxin Chóp Rễ
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            Hạt tinh bột nặng (thạch lạp) chìm xuống đáy tế bào cảm thụ trọng lực, kích hoạt bơm Auxin bất đối xứng làm tế bào phía ẩm/phía trên kéo dài đưa rễ uốn cong.
          </p>
        </div>
      )}

      {/* BOTANICAL & RHIZOTRON ANATOMY CALLOUTS (Khi bật Chú Thích) */}
      {showAnatomy && (
        <div className={`absolute bottom-16 left-4 border backdrop-blur-xl p-3.5 rounded-2xl text-xs shadow-2xl max-w-[360px] space-y-2 animate-in fade-in duration-200 z-20 ${
          isDarkroom ? 'bg-slate-950/95 border-emerald-500/50 text-slate-200' : 'bg-white/95 border-emerald-400 text-slate-800'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-1.5">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span>🌱</span> Cấu Tạo Giải Phẫu Rễ & Hộp Rhizotron
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
              <span className="text-emerald-400 font-bold">1. Chồi mầm & Đôi lá thật:</span>
              <span className="text-slate-300">Vươn ra khỏi vỏ hạt hướng lên trên (hướng trọng lực âm), đón photon ánh sáng.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-sky-400 font-bold">2. Vùng lông hút (Maturation Zone):</span>
              <span className="text-slate-300">Các tế bào biểu bì kéo dài thành lông hút mỏng manh len lỏi hút nước và khoáng hòa tan.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-amber-400 font-bold">3. Chóp rễ (Calyptra):</span>
              <span className="text-slate-300">Bảo vệ mô phân sinh đỉnh rễ khi đâm sâu, chứa các tế bào trụ nhạy cảm với trọng lực và độ ẩm.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-cyan-400 font-bold">4. Quầng ẩm khuếch tán:</span>
              <span className="text-slate-300">Nước từ miếng bọt biển tạo gradient thế nước (&Psi;w), kích hoạt tính hướng nước dương mạnh hơn trọng lực.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-slate-400 font-bold">5. Hộp kính chia lưới 1cm:</span>
              <span className="text-slate-300">Cho phép đo chính xác tốc độ sinh trưởng hàng ngày và góc lệch uốn cong của rễ.</span>
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
        <span>💧 <strong>Mẹo:</strong> Nhấn "Thao tác Nguồn Nước & Hộp" để đổi vị trí miếng bọt biển ẩm</span>
        <span>•</span>
        <span>🖱️ Xoay 3D 360° tự do</span>
      </div>
    </div>
  );
}
