'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HydrotropismState } from '../types';
import { setupLabEnvironment, disposeSceneResources } from './LabEnvironment';

interface Props {
  state: HydrotropismState;
  onUpdateState?: (updater: (prev: HydrotropismState) => HydrotropismState) => void;
  onUpdateRootAngle?: (angle: number) => void;
  onOpenInquiry?: () => void;
  isPlaying: boolean;
  isActive?: boolean;
}

export default function RootTropismScene({
  state,
  onUpdateState,
  onUpdateRootAngle,
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

  const currentAngleRef = useRef(0);
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
    controls.minDistance = 2.4;
    controls.maxDistance = 16;
    controls.target.set(0, 1.65, 0);
    controlsRef.current = controls;

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
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
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
      color: 0xe0f2fe,
      opacity: 0.16,
      transparent: true,
      roughness: 0.03,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 0.9,
      depthWrite: false,
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

    // 7. Cellulose Moisture Sponge with Glistening Water Droplets & Volumetric Vapor Gradient
    const spongeGroup = new THREE.Group();
    spongeGroup.position.set(-1.18, -0.4, 0.08);

    // Wet Cellulose Sponge Block (Khối mút xốp đẫm nước 3D bo cạnh ướt át)
    const spongeGeo = new THREE.BoxGeometry(0.85, 0.85, 0.22);
    const spongeMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7, // Vibrant wet ocean cyan-blue
      emissive: 0x0369a1,
      emissiveIntensity: 0.28,
      roughness: 0.18,
      metalness: 0.05,
      clearcoat: 1.0, // Wet glossy sheen
      clearcoatRoughness: 0.08,
      reflectivity: 0.9,
    });
    const sponge = new THREE.Mesh(spongeGeo, spongeMat);
    sponge.castShadow = true;
    spongeGroup.add(sponge);

    // 3D Porous Texture: Darker micro-pores indented on the sponge surface
    const poreMat = new THREE.MeshBasicMaterial({ color: 0x075985, transparent: true, opacity: 0.75 });
    const poreGeo = new THREE.CircleGeometry(0.028, 12);
    for (let px = -0.32; px <= 0.32; px += 0.16) {
      for (let py = -0.32; py <= 0.32; py += 0.16) {
        const pore = new THREE.Mesh(poreGeo, poreMat);
        pore.position.set(px + (Math.sin(px * 10 + py * 5)) * 0.03, py + (Math.cos(px * 5 - py * 10)) * 0.03, 0.112);
        spongeGroup.add(pore);
      }
    }

    // Glistening Liquid Water Droplets (Các giọt nước đọng long lanh trên bề mặt miếng mút)
    const waterDropletMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      opacity: 0.78,
      transparent: true,
      roughness: 0.02,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      reflectivity: 0.95,
      depthWrite: false,
    });

    const dropGlintMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, depthWrite: false });

    // Seeded glistening droplets
    const dropletCoords = [
      { x: -0.24, y: 0.26, r: 0.065 },
      { x: 0.18, y: 0.22, r: 0.055 },
      { x: -0.16, y: -0.18, r: 0.075 },
      { x: 0.25, y: -0.20, r: 0.05 },
      { x: 0.04, y: -0.05, r: 0.082 },
      { x: -0.30, y: -0.02, r: 0.045 },
      { x: 0.30, y: 0.08, r: 0.06 },
      { x: -0.05, y: 0.30, r: 0.052 },
      { x: 0.12, y: -0.32, r: 0.048 },
    ];

    dropletCoords.forEach((d) => {
      const dropGeo = new THREE.SphereGeometry(d.r, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const dropMesh = new THREE.Mesh(dropGeo, waterDropletMat);
      dropMesh.position.set(d.x, d.y, 0.11);
      dropMesh.renderOrder = 8;
      spongeGroup.add(dropMesh);

      // Specular shine glint
      const glint = new THREE.Mesh(new THREE.SphereGeometry(d.r * 0.25, 8, 8), dropGlintMat);
      glint.position.set(d.x + d.r * 0.32, d.y + d.r * 0.32, 0.11 + d.r * 0.65);
      glint.renderOrder = 9;
      spongeGroup.add(glint);
    });

    // Hanging wet water bead at bottom edge of sponge
    const hangingDropGeo = new THREE.ConeGeometry(0.055, 0.12, 16);
    hangingDropGeo.rotateX(Math.PI);
    const hangingDrop = new THREE.Mesh(hangingDropGeo, waterDropletMat);
    hangingDrop.position.set(0.08, -0.48, 0.05);
    hangingDrop.renderOrder = 8;
    spongeGroup.add(hangingDrop);

    // Volumetric Soft Radial Moisture Diffusion Gradient (Quầng ẩm lan tỏa mềm mại vào đất)
    const haloCanvas = document.createElement('canvas');
    haloCanvas.width = 256;
    haloCanvas.height = 256;
    const hctx = haloCanvas.getContext('2d')!;
    const grad = hctx.createRadialGradient(128, 128, 30, 128, 128, 126);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.70)'); // High humidity core
    grad.addColorStop(0.45, 'rgba(14, 165, 233, 0.36)'); // Mid humidity
    grad.addColorStop(0.85, 'rgba(2, 132, 199, 0.10)'); // Diffusion boundary
    grad.addColorStop(1, 'rgba(2, 132, 199, 0)');
    hctx.fillStyle = grad;
    hctx.fillRect(0, 0, 256, 256);

    const haloTex = new THREE.CanvasTexture(haloCanvas);
    const haloGeo = new THREE.PlaneGeometry(2.5, 2.5);
    const haloMat = new THREE.MeshBasicMaterial({
      map: haloTex,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const moistureHalo = new THREE.Mesh(haloGeo, haloMat);
    moistureHalo.position.z = 0.095;
    moistureHalo.renderOrder = 3;
    spongeGroup.add(moistureHalo);

    // Floating Moisture Vapor Mist Particles (Các vi hạt hơi nước khuếch tán trong không khí)
    const vaporCount = 45;
    const vaporGeo = new THREE.BufferGeometry();
    const vaporPositions = new Float32Array(vaporCount * 3);
    const vaporPhases = new Float32Array(vaporCount);
    const vaporRadii = new Float32Array(vaporCount);

    for (let vi = 0; vi < vaporCount; vi++) {
      const angle = (vi / vaporCount) * Math.PI * 2;
      const dist = 0.45 + (vi % 5) * 0.18;
      vaporPositions[vi * 3 + 0] = Math.cos(angle) * dist;
      vaporPositions[vi * 3 + 1] = Math.sin(angle) * dist;
      vaporPositions[vi * 3 + 2] = 0.1 + ((vi % 3) - 1) * 0.02;
      vaporPhases[vi] = angle;
      vaporRadii[vi] = dist;
    }
    vaporGeo.setAttribute('position', new THREE.BufferAttribute(vaporPositions, 3));
    const vaporMat = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 0.065,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const vaporParticles = new THREE.Points(vaporGeo, vaporMat);
    vaporParticles.renderOrder = 7;
    spongeGroup.add(vaporParticles);

    chamberRig.add(spongeGroup);

    // 8. Dynamic Organic Taproot Geometry with Root Cap & 3D Conspicuous Root Hairs (zero-alloc in-place reuse)
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

    // Materials for Root Hairs and Capillary Droplets
    const rootHairMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xbae6fd,
      emissiveIntensity: 0.65,
      roughness: 0.2,
      metalness: 0.05,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const hairBeadGeo = new THREE.SphereGeometry(0.012, 8, 8);
    const hairBeadMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 });

    // Pre-allocated Root, Core, Cap, Hairs & Capillary Beads (zero per-frame allocations)
    function createTubeBuffers(segments: number, radialSegments: number) {
      const vertCount = (segments + 1) * (radialSegments + 1);
      const posArr = new Float32Array(vertCount * 3);
      const normArr = new Float32Array(vertCount * 3);
      const indices: number[] = [];
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
      const geo = new THREE.BufferGeometry();
      const posAttr = new THREE.BufferAttribute(posArr, 3).setUsage(THREE.DynamicDrawUsage);
      const normAttr = new THREE.BufferAttribute(normArr, 3).setUsage(THREE.DynamicDrawUsage);
      geo.setAttribute('position', posAttr);
      geo.setAttribute('normal', normAttr);
      geo.setIndex(indices);
      return { geo, posArr, normArr, posAttr, normAttr };
    }

    const rScratchPt = new THREE.Vector3();
    const rScratchNorm = new THREE.Vector3();
    const rScratchVert = new THREE.Vector3();

    function updateTubeBuffers(
      curve: THREE.CubicBezierCurve3,
      segments: number,
      radialSegments: number,
      radiusAtU: (u: number) => number,
      posArr: Float32Array,
      normArr: Float32Array,
      posAttr: THREE.BufferAttribute,
      normAttr: THREE.BufferAttribute,
      geo: THREE.BufferGeometry
    ) {
      const frames = curve.computeFrenetFrames(segments, false);
      let idx = 0;
      for (let i = 0; i <= segments; i++) {
        const u = i / segments;
        curve.getPointAt(u, rScratchPt);
        const N = frames.normals[i];
        const B = frames.binormals[i];
        const radius = radiusAtU(u);
        for (let j = 0; j <= radialSegments; j++) {
          const theta = (j / radialSegments) * Math.PI * 2;
          rScratchNorm
            .copy(N)
            .multiplyScalar(Math.cos(theta))
            .addScaledVector(B, Math.sin(theta))
            .normalize();
          rScratchVert.copy(rScratchPt).addScaledVector(rScratchNorm, radius);

          posArr[idx] = rScratchVert.x;
          posArr[idx + 1] = rScratchVert.y;
          posArr[idx + 2] = rScratchVert.z;
          normArr[idx] = rScratchNorm.x;
          normArr[idx + 1] = rScratchNorm.y;
          normArr[idx + 2] = rScratchNorm.z;
          idx += 3;
        }
      }
      posAttr.needsUpdate = true;
      normAttr.needsUpdate = true;
      geo.computeBoundingSphere();
    }

    const rootSegments = 42;
    const rootRadialSegments = 16;
    const rootBuf = createTubeBuffers(rootSegments, rootRadialSegments);
    const rootMat = new THREE.MeshPhysicalMaterial({
      color: 0xfef9c3,
      emissive: 0xfef08a,
      emissiveIntensity: 0.22,
      roughness: 0.28,
      metalness: 0.04,
      clearcoat: 0.7,
      clearcoatRoughness: 0.12,
      transparent: false,
      opacity: 1.0,
    });
    const rootMesh = new THREE.Mesh(rootBuf.geo, rootMat);
    rootMesh.castShadow = true;
    chamberRig.add(rootMesh);

    const coreSegments = 28;
    const coreRadialSegments = 10;
    const coreBuf = createTubeBuffers(coreSegments, coreRadialSegments);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x86efac,
      emissive: 0x22c55e,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.5,
    });
    const rootCoreMesh = new THREE.Mesh(coreBuf.geo, coreMat);
    chamberRig.add(rootCoreMesh);

    const capGeo = new THREE.ConeGeometry(0.048, 0.24, 18);
    capGeo.translate(0, -0.11, 0);
    const capMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
    const rootCapMesh = new THREE.Mesh(capGeo, capMat);
    chamberRig.add(rootCapMesh);

    // Pre-allocated 3D Root Hairs & Instanced Capillary Beads
    const numRings = 24;
    const hairsPerRing = 6;
    const totalHairs = numRings * hairsPerRing;
    const hairPosArr = new Float32Array(totalHairs * 8 * 3);
    const hairNormArr = new Float32Array(totalHairs * 8 * 3);
    const hairIndices: number[] = [];
    for (let h = 0; h < totalHairs; h++) {
      const base = h * 8;
      hairIndices.push(
        base + 0, base + 1, base + 2,
        base + 0, base + 2, base + 3,
        base + 4, base + 5, base + 6,
        base + 4, base + 6, base + 7
      );
    }
    const hairsGeo = new THREE.BufferGeometry();
    const hairPosAttr = new THREE.BufferAttribute(hairPosArr, 3).setUsage(THREE.DynamicDrawUsage);
    const hairNormAttr = new THREE.BufferAttribute(hairNormArr, 3).setUsage(THREE.DynamicDrawUsage);
    hairsGeo.setAttribute('position', hairPosAttr);
    hairsGeo.setAttribute('normal', hairNormAttr);
    hairsGeo.setIndex(hairIndices);

    const hairsMesh = new THREE.Mesh(hairsGeo, rootHairMat);
    const beadInstanced = new THREE.InstancedMesh(hairBeadGeo, hairBeadMat, totalHairs);
    beadInstanced.count = 0;

    const rootHairsGroup = new THREE.Group();
    rootHairsGroup.renderOrder = 10;
    rootHairsGroup.add(hairsMesh, beadInstanced);
    chamberRig.add(rootHairsGroup);

    // Scratch math objects for root & hairs (zero GC)
    const rp0 = new THREE.Vector3(0, 1.18, 0.08);
    const rp1 = new THREE.Vector3(0, 0.52, 0.08);
    const rp2 = new THREE.Vector3();
    const rp3 = new THREE.Vector3();
    const rCoreP3 = new THREE.Vector3();
    const rootCurve = new THREE.CubicBezierCurve3(rp0, rp1, rp2, rp3);
    const coreCurve = new THREE.CubicBezierCurve3(rp0, rp1, rp2, rCoreP3);
    const downAxis = new THREE.Vector3(0, -1, 0);
    const upZVec = new THREE.Vector3(0, 0, 1);
    const rTangent = new THREE.Vector3();
    const rNormalVec = new THREE.Vector3();
    const rBinormalVec = new THREE.Vector3();
    const rRadDir = new THREE.Vector3();
    const rBasePt = new THREE.Vector3();
    const rToWater = new THREE.Vector3();
    const rToWaterDir = new THREE.Vector3();
    const rTipDir = new THREE.Vector3();
    const rTipPt = new THREE.Vector3();
    const rCrossA = new THREE.Vector3();
    const rCrossB = new THREE.Vector3();
    const rCurvePt = new THREE.Vector3();
    const beadMatrix = new THREE.Matrix4();

    let lastRootAngle = Number.NaN;
    let lastWaterPos = '';
    let lastRootXray: boolean | null = null;

    function writeQuadVertex(arr: Float32Array, offset: number, vx: number, vy: number, vz: number) {
      arr[offset] = vx;
      arr[offset + 1] = vy;
      arr[offset + 2] = vz;
    }

    // Botanical Tapered Taproot Geometry (updates buffers in-place ONLY when dirty)
    function updateRootGeometry(angleRad: number, s: HydrotropismState) {
      const dirty =
        Number.isNaN(lastRootAngle) ||
        Math.abs(angleRad - lastRootAngle) > 0.0004 ||
        s.waterSourcePos !== lastWaterPos ||
        s.xrayStatoliths !== lastRootXray;

      if (dirty) {
        lastRootAngle = angleRad;
        lastWaterPos = s.waterSourcePos;

        const length = 2.25;
        const tipX = Math.sin(angleRad) * (length * 0.85);
        const tipY = 1.18 - Math.cos(angleRad) * length;

        rp2.set(tipX * 0.65, 1.18 - length * 0.65, 0.08);
        rp3.set(tipX, tipY, 0.08);
        rCoreP3.copy(rp3).sub(rp2).multiplyScalar(0.7).add(rp2);

        if (s.xrayStatoliths !== lastRootXray) {
          lastRootXray = s.xrayStatoliths;
          rootMat.color.setHex(s.xrayStatoliths ? 0x06b6d4 : 0xfef9c3);
          rootMat.emissive.setHex(s.xrayStatoliths ? 0x0891b2 : 0xfef08a);
          rootMat.emissiveIntensity = s.xrayStatoliths ? 0.6 : 0.22;
          rootMat.transparent = s.xrayStatoliths;
          rootMat.opacity = s.xrayStatoliths ? 0.45 : 1.0;
          rootMat.needsUpdate = true;

          capMat.color.setHex(s.xrayStatoliths ? 0x38bdf8 : 0xf59e0b);
        }

        updateTubeBuffers(
          rootCurve,
          rootSegments,
          rootRadialSegments,
          (u) => 0.098 - u * 0.056,
          rootBuf.posArr,
          rootBuf.normArr,
          rootBuf.posAttr,
          rootBuf.normAttr,
          rootBuf.geo
        );

        updateTubeBuffers(
          coreCurve,
          coreSegments,
          coreRadialSegments,
          () => 0.022,
          coreBuf.posArr,
          coreBuf.normArr,
          coreBuf.posAttr,
          coreBuf.normAttr,
          coreBuf.geo
        );

        rootCapMesh.position.copy(rp3);
        rootCurve.getTangent(1, rTangent);
        rootCapMesh.quaternion.setFromUnitVectors(downAxis, rTangent);

        // Update 3D Root Hairs & Instanced Beads in-place
        const spongePos = spongeGroup.position;
        let hVertFloatIdx = 0;
        let beadCount = 0;
        const hairWidthBase = 0.009;
        const hairWidthTip = 0.003;

        for (let rIdx = 0; rIdx < numRings; rIdx++) {
          const u = 0.22 + (rIdx / (numRings - 1)) * 0.48;
          rootCurve.getPoint(u, rScratchPt);
          const radius = 0.098 - u * 0.056;
          rootCurve.getTangent(u, rTangent);
          rNormalVec.crossVectors(rTangent, upZVec).normalize();
          rBinormalVec.crossVectors(rTangent, rNormalVec).normalize();

          for (let hIdx = 0; hIdx < hairsPerRing; hIdx++) {
            const theta = (hIdx / hairsPerRing) * Math.PI * 2 + rIdx * 0.35;
            rRadDir
              .copy(rNormalVec)
              .multiplyScalar(Math.cos(theta))
              .addScaledVector(rBinormalVec, Math.sin(theta))
              .normalize();

            rBasePt.copy(rScratchPt).addScaledVector(rRadDir, radius * 0.95);
            rToWater.set(spongePos.x - rBasePt.x, spongePos.y - rBasePt.y, 0);
            rToWaterDir.copy(rToWater).normalize();
            const dotToWater = rRadDir.dot(rToWaterDir);

            let hairLength: number;
            if (dotToWater > 0) {
              hairLength = 0.18 + dotToWater * 0.16 + Math.sin(rIdx * 7 + hIdx) * 0.03;
              rTipDir
                .copy(rRadDir)
                .multiplyScalar(0.4)
                .addScaledVector(rToWaterDir, 0.6)
                .normalize();
            } else {
              hairLength = 0.07 + Math.abs(Math.sin(rIdx * 5 + hIdx)) * 0.04;
              rTipDir.copy(rRadDir);
            }

            rTipPt.copy(rBasePt).addScaledVector(rTipDir, hairLength);
            rCrossA.crossVectors(rTipDir, rTangent).normalize();
            rCrossB.crossVectors(rTipDir, rCrossA).normalize();

            // Quad A (4 vertices)
            writeQuadVertex(hairPosArr, hVertFloatIdx + 0, rBasePt.x - rCrossA.x * hairWidthBase, rBasePt.y - rCrossA.y * hairWidthBase, rBasePt.z - rCrossA.z * hairWidthBase);
            writeQuadVertex(hairPosArr, hVertFloatIdx + 3, rBasePt.x + rCrossA.x * hairWidthBase, rBasePt.y + rCrossA.y * hairWidthBase, rBasePt.z + rCrossA.z * hairWidthBase);
            writeQuadVertex(hairPosArr, hVertFloatIdx + 6, rTipPt.x + rCrossA.x * hairWidthTip, rTipPt.y + rCrossA.y * hairWidthTip, rTipPt.z + rCrossA.z * hairWidthTip);
            writeQuadVertex(hairPosArr, hVertFloatIdx + 9, rTipPt.x - rCrossA.x * hairWidthTip, rTipPt.y - rCrossA.y * hairWidthTip, rTipPt.z - rCrossA.z * hairWidthTip);
            // Quad B (4 vertices)
            writeQuadVertex(hairPosArr, hVertFloatIdx + 12, rBasePt.x - rCrossB.x * hairWidthBase, rBasePt.y - rCrossB.y * hairWidthBase, rBasePt.z - rCrossB.z * hairWidthBase);
            writeQuadVertex(hairPosArr, hVertFloatIdx + 15, rBasePt.x + rCrossB.x * hairWidthBase, rBasePt.y + rCrossB.y * hairWidthBase, rBasePt.z + rCrossB.z * hairWidthBase);
            writeQuadVertex(hairPosArr, hVertFloatIdx + 18, rTipPt.x + rCrossB.x * hairWidthTip, rTipPt.y + rCrossB.y * hairWidthTip, rTipPt.z + rCrossB.z * hairWidthTip);
            writeQuadVertex(hairPosArr, hVertFloatIdx + 21, rTipPt.x - rCrossB.x * hairWidthTip, rTipPt.y - rCrossB.y * hairWidthTip, rTipPt.z - rCrossB.z * hairWidthTip);

            for (let v = 0; v < 8; v++) {
              writeQuadVertex(hairNormArr, hVertFloatIdx + v * 3, rRadDir.x, rRadDir.y, rRadDir.z);
            }
            hVertFloatIdx += 24;

            if (dotToWater > 0.45 && (rIdx + hIdx) % 3 === 0) {
              beadMatrix.makeTranslation(rTipPt.x, rTipPt.y, rTipPt.z);
              beadInstanced.setMatrixAt(beadCount++, beadMatrix);
            }
          }
        }

        hairPosAttr.needsUpdate = true;
        hairNormAttr.needsUpdate = true;
        hairsGeo.computeBoundingSphere();

        beadInstanced.count = beadCount;
        beadInstanced.instanceMatrix.needsUpdate = true;

        if (statolithPoints) {
          statolithPoints.visible = s.xrayStatoliths;
          if (s.xrayStatoliths) statolithPoints.position.copy(rp3);
        }
      }

      if (auxinParticles) {
        auxinParticles.visible = s.xrayStatoliths;
        if (s.xrayStatoliths) {
          const posAttr = auxinParticles.geometry.attributes.position as THREE.BufferAttribute;
          const sideOffset = Math.sin(angleRad) > 0 ? -0.045 : 0.045;
          for (let k = 0; k < auxinCount; k++) {
            rootCurve.getPoint(auxinTValues[k], rCurvePt);
            posAttr.setXYZ(k, rCurvePt.x + sideOffset, rCurvePt.y, 0.09);
          }
          posAttr.needsUpdate = true;
        }
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
    const timer = new THREE.Timer();
    timer.connect(document);
    let lastReportedRootAngle = Number.NaN;
    let lastRootReportTime = 0;

    const animate = (timestamp?: number) => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isActiveRef.current) return;

      timer.update(timestamp);
      const delta = Math.min(timer.getDelta(), 0.1);
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
        const curDeg = Math.round(((currentAngleRef.current * 180) / Math.PI) * 10) / 10;
        const now = performance.now();
        const settled = Math.abs(targetRad - currentAngleRef.current) < 0.001;
        if (curDeg !== lastReportedRootAngle && (settled || now - lastRootReportTime >= 100)) {
          lastReportedRootAngle = curDeg;
          lastRootReportTime = now;
          onUpdateRootAngle(curDeg);
        }
      }

      // Auxin particle flow speed (advance before updating stream positions)
      if (auxinParticles && s.xrayStatoliths) {
        for (let k = 0; k < auxinCount; k++) {
          auxinTValues[k] += delta * 0.45;
          if (auxinTValues[k] > 1.0) auxinTValues[k] = 0.0;
        }
      }

      updateRootGeometry(currentAngleRef.current, s);

      // Ripple moisture gradient animation
      const time = timer.getElapsed();
      moistureHalo.scale.setScalar(1 + Math.sin(time * 2.4) * 0.06);

      // Animate floating vapor particles
      const vPos = vaporParticles.geometry.attributes.position as THREE.BufferAttribute;
      for (let vi = 0; vi < vaporCount; vi++) {
        const ph = vaporPhases[vi];
        const rBase = vaporRadii[vi];
        const r = rBase + Math.sin(time * 2.0 + ph) * 0.06;
        const ang = ph + time * 0.22;
        vPos.setXYZ(vi, Math.cos(ang) * r, Math.sin(ang) * r, 0.1 + Math.sin(time * 2.5 + ph) * 0.02);
      }
      vPos.needsUpdate = true;

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
        <div className={`absolute top-16 left-4 border backdrop-blur-xl p-3.5 rounded-2xl text-xs shadow-2xl max-w-[360px] space-y-2 animate-in fade-in duration-200 z-30 ${
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
