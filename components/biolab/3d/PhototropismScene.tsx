'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PhototropismState } from '../types';
import { setupLabEnvironment } from './LabEnvironment';

interface Props {
  state: PhototropismState;
  onUpdateState?: (updater: (prev: PhototropismState) => PhototropismState) => void;
  onAngleUpdate?: (angle: number) => void;
  onOpenInquiry?: () => void;
  isPlaying: boolean;
}

export default function PhototropismScene({
  state,
  onUpdateState,
  onAngleUpdate,
  onOpenInquiry,
  isPlaying,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Track smoothly interpolated bent angle
  const currentBentAngleRef = useRef(0);

  // Darkroom Mode state (Default TRUE for high-contrast directional light observation)
  const [isDarkroom, setIsDarkroom] = useState<boolean>(true);
  const darkroomRef = useRef<boolean>(true);
  darkroomRef.current = isDarkroom;

  // Direct Interactive Lamp Control Modal / Popover
  const [isLampControlOpen, setIsLampControlOpen] = useState(false);
  const [isHoveringLamp, setIsHoveringLamp] = useState(false);

  // Reference to environment controller
  const envControllerRef = useRef<{ setDarkroom: (dark: boolean) => void } | null>(null);

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
    controls.minDistance = 2.8;
    controls.maxDistance = 16;
    controls.target.set(0, 1.8, 0);

    // 2. Setup Realistic Laboratory Environment (Initial Darkroom mode for phototropism)
    const env = setupLabEnvironment(scene, { isDarkroom: darkroomRef.current });
    envControllerRef.current = env;

    // 3. Plant Pot (High Quality Terracotta Ceramic Pot with Drain Saucer)
    const potGroup = new THREE.Group();
    potGroup.position.set(0, 0, 0);
    scene.add(potGroup);

    // Drain Saucer Plate underneath pot
    const saucerGeo = new THREE.CylinderGeometry(1.08, 0.95, 0.12, 36);
    const saucerMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.6,
      metalness: 0.05,
    });
    const saucer = new THREE.Mesh(saucerGeo, saucerMat);
    saucer.position.y = 0.06;
    saucer.castShadow = true;
    saucer.receiveShadow = true;
    potGroup.add(saucer);

    // Realistic Pot Wall (Hollow, open-ended)
    const potGeo = new THREE.CylinderGeometry(0.95, 0.72, 1.35, 36, 1, true);
    const potMat = new THREE.MeshStandardMaterial({
      color: 0xc25e24,
      roughness: 0.55,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.y = 0.75;
    pot.castShadow = true;
    pot.receiveShadow = true;
    potGroup.add(pot);

    // Pot Bottom disk inside
    const potBottomGeo = new THREE.CircleGeometry(0.72, 36);
    potBottomGeo.rotateX(Math.PI / 2);
    const potBottom = new THREE.Mesh(potBottomGeo, potMat);
    potBottom.position.y = 0.1;
    potGroup.add(potBottom);

    // Smooth Molded Rim
    const rimGeo = new THREE.TorusGeometry(0.96, 0.075, 16, 36);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xad521c, roughness: 0.5 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 1.42;
    rim.castShadow = true;
    potGroup.add(rim);

    // Rich Loam Soil (dark textured earth recessed cleanly below the rim)
    const soilGeo = new THREE.CylinderGeometry(0.9, 0.78, 0.45, 36);
    const soilMat = new THREE.MeshStandardMaterial({
      color: 0x1f1610,
      roughness: 0.96,
      metalness: 0.02,
    });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.y = 1.15; // Surface at y = 1.37
    soil.receiveShadow = true;
    potGroup.add(soil);

    // Organic Soil Mound around stem collar
    const soilMoundGeo = new THREE.ConeGeometry(0.38, 0.09, 24);
    const soilMoundMat = new THREE.MeshStandardMaterial({ color: 0x1a120d, roughness: 0.98 });
    const soilMound = new THREE.Mesh(soilMoundGeo, soilMoundMat);
    soilMound.position.y = 1.38;
    soilMound.receiveShadow = true;
    potGroup.add(soilMound);

    // Realistic scattered Perlite grains (hạt đá trân châu perlite xốp trắng giữ ẩm tự nhiên)
    const perliteMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.8 });
    for (let i = 0; i < 40; i++) {
      const radius = 0.12 + Math.random() * 0.72;
      const angle = Math.random() * Math.PI * 2;
      const px = Math.cos(angle) * radius;
      const pz = Math.sin(angle) * radius;
      const pScale = 0.02 + Math.random() * 0.025;

      const perlite = new THREE.Mesh(new THREE.DodecahedronGeometry(pScale, 0), perliteMat);
      perlite.position.set(px, 1.375 + Math.random() * 0.012, pz);
      perlite.rotation.set(Math.random(), Math.random(), Math.random());
      perlite.receiveShadow = true;
      potGroup.add(perlite);
    }

    // Plant Stem Group
    const plantGroup = new THREE.Group();
    plantGroup.position.set(0, 1.36, 0);
    scene.add(plantGroup);

    let stemMesh: THREE.Mesh | null = null;
    let leavesMesh: THREE.Group | null = null;
    let treatmentItem: THREE.Mesh | null = null;
    let auxinParticles: THREE.Points | null = null;

    // Auxin particle geometry setup
    const particleCount = 220;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleTValues = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      particleTValues[i] = 0.12 + Math.random() * 0.82;
      particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 0.1;
      particlePositions[i * 3 + 1] = particleTValues[i] * 2.8;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfacc15,
      size: 0.1,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    auxinParticles = new THREE.Points(particleGeo, particleMat);
    auxinParticles.visible = false;
    plantGroup.add(auxinParticles);

    // 4. Articulated Laboratory Bench Lamp (Interactive Clickable Lamp)
    const lampGroup = new THREE.Group();
    scene.add(lampGroup);

    const lampClickables: THREE.Object3D[] = [];

    // Heavy Circular Steel Base
    const lampBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.72, 0.78, 0.12, 36),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 })
    );
    lampBase.castShadow = true;
    lampBase.receiveShadow = true;
    lampBase.userData = { isLamp: true };
    lampGroup.add(lampBase);
    lampClickables.push(lampBase);

    // Base joint knob
    const baseJoint = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 })
    );
    baseJoint.position.y = 0.14;
    lampGroup.add(baseJoint);

    // Lower Arm
    const lowerArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 1.8, 16),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 })
    );
    lowerArm.position.set(-0.25, 0.98, 0);
    lowerArm.rotation.z = Math.PI / 10;
    lowerArm.castShadow = true;
    lowerArm.userData = { isLamp: true };
    lampGroup.add(lowerArm);
    lampClickables.push(lowerArm);

    // Middle Elbow Joint
    const elbowJoint = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 })
    );
    elbowJoint.position.set(-0.52, 1.85, 0);
    lampGroup.add(elbowJoint);

    // Upper Arm
    const upperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.6, 16),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 })
    );
    upperArm.position.set(-0.2, 2.55, 0);
    upperArm.rotation.z = -Math.PI / 8;
    upperArm.castShadow = true;
    upperArm.userData = { isLamp: true };
    lampGroup.add(upperArm);
    lampClickables.push(upperArm);

    // Lamp Shade
    const shadeGeo = new THREE.ConeGeometry(0.64, 0.95, 36, 1, true);
    const shadeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.7,
      roughness: 0.2,
      side: THREE.DoubleSide,
    });
    const lampShade = new THREE.Mesh(shadeGeo, shadeMat);
    lampShade.position.set(0.1, 3.25, 0);
    lampShade.castShadow = true;
    lampShade.userData = { isLamp: true };
    lampGroup.add(lampShade);
    lampClickables.push(lampShade);

    // Inner Reflector of shade
    const reflectorGeo = new THREE.ConeGeometry(0.62, 0.9, 36, 1, true);
    const reflectorMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.95,
      roughness: 0.08,
      side: THREE.DoubleSide,
    });
    const reflector = new THREE.Mesh(reflectorGeo, reflectorMat);
    reflector.position.copy(lampShade.position);
    lampGroup.add(reflector);

    // LED Bulb inside
    const bulbGeo = new THREE.SphereGeometry(0.18, 24, 24);
    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 2.8,
    });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.copy(lampShade.position);
    bulb.userData = { isLamp: true };
    lampGroup.add(bulb);
    lampClickables.push(bulb);

    // High-Contrast Directional SpotLight emitting from bulb
    const spotLight = new THREE.SpotLight(0xfffbeb, 8, 16, Math.PI / 3.6, 0.35, 1);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.camera.near = 0.5;
    spotLight.shadow.camera.far = 16;
    spotLight.shadow.bias = -0.0004;
    spotLight.position.copy(lampShade.position);
    scene.add(spotLight);

    // Visual soft light cone mesh with strong atmospheric presence
    const beamGeo = new THREE.ConeGeometry(2.6, 4.6, 36, 1, true);
    beamGeo.translate(0, -2.3, 0);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.userData = { isLamp: true };
    lampGroup.add(beamMesh);
    lampClickables.push(beamMesh);

    // Floating Dust Motes / Photons inside the beam
    const dustCount = 60;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3 + 0] = (Math.random() - 0.5) * 1.5;
      dustPos[i * 3 + 1] = 0.5 + Math.random() * 2.8;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.055,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    lampGroup.add(dustPoints);

    // 5. Scientific Protractor Arc Gauge in 3D
    const protractorGroup = new THREE.Group();
    protractorGroup.position.set(0, 1.4, 0);
    const arcCurve = new THREE.EllipseCurve(0, 0, 1.85, 1.85, -Math.PI / 2.2, Math.PI / 2.2, false, 0);
    const arcPoints = arcCurve.getPoints(50);
    const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const arcMat = new THREE.LineDashedMaterial({
      color: 0x38bdf8,
      dashSize: 0.1,
      gapSize: 0.05,
      opacity: 0.65,
      transparent: true,
    });
    const arcLine = new THREE.Line(arcGeo, arcMat);
    arcLine.computeLineDistances();
    protractorGroup.add(arcLine);
    scene.add(protractorGroup);

    // Rebuild Plant Stem & Leaf Geometry with authentic botanical features
    function updatePlantGeometry(angleRad: number, s: PhototropismState) {
      if (stemMesh) plantGroup.remove(stemMesh);
      if (leavesMesh) plantGroup.remove(leavesMesh);
      if (treatmentItem) plantGroup.remove(treatmentItem);

      const height = 2.65;
      const isDecapitated = s.plantTreatment === 'decapitated';
      const actualHeight = isDecapitated ? height * 0.72 : height;

      // Organic Spline Curve for realistic biological bending
      const tipOffsetX = Math.sin(angleRad) * (actualHeight * 0.58);
      const tipOffsetY = Math.cos(angleRad) * actualHeight;

      // Adding subtle biological micro-inflection (soft natural curvature)
      const p0 = new THREE.Vector3(0, 0, 0);
      const p1 = new THREE.Vector3(0, actualHeight * 0.28, 0.015);
      const p2 = new THREE.Vector3(tipOffsetX * 0.65, actualHeight * 0.68, -0.01);
      const p3 = new THREE.Vector3(tipOffsetX, tipOffsetY, 0);

      const curve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);

      // Realistic Tapered Anatomical Stem
      const segments = 40;
      const radialSegments = 16;
      const frames = curve.computeFrenetFrames(segments, false);
      const stemVertices: number[] = [];
      const stemIndices: number[] = [];
      const stemNormals: number[] = [];
      const stemColors: number[] = [];

      for (let i = 0; i <= segments; i++) {
        const u = i / segments;
        const pt = curve.getPointAt(u);
        const N = frames.normals[i];
        const B = frames.binormals[i];
        // Botanical taper: wider base at root collar (r=0.108), slender at top (r=0.052)
        const radius = 0.108 - (u * 0.056);

        // Biological Color Gradient per vertex:
        // Base (u near 0): Pale jade ivory with subtle pink blush
        // Mid (u 0.2 - 0.7): Rich chlorophyll green
        // Top (u > 0.7): Bright tender chartreuse lime
        let rVal = 0.09;
        let gVal = 0.65;
        let bVal = 0.25;

        if (u < 0.2) {
          const tBase = u / 0.2;
          rVal = THREE.MathUtils.lerp(0.85, 0.12, tBase);
          gVal = THREE.MathUtils.lerp(0.88, 0.65, tBase);
          bVal = THREE.MathUtils.lerp(0.75, 0.25, tBase);
        } else if (u > 0.7) {
          const tTop = (u - 0.7) / 0.3;
          rVal = THREE.MathUtils.lerp(0.12, 0.65, tTop);
          gVal = THREE.MathUtils.lerp(0.65, 0.92, tTop);
          bVal = THREE.MathUtils.lerp(0.25, 0.20, tTop);
        }

        if (s.xrayMode) {
          rVal = 0.04;
          gVal = 0.72;
          bVal = 0.85;
        }

        for (let j = 0; j <= radialSegments; j++) {
          const v = j / radialSegments;
          const theta = v * Math.PI * 2;
          const sinTheta = Math.sin(theta);
          const cosTheta = Math.cos(theta);

          const normal = new THREE.Vector3()
            .copy(N).multiplyScalar(cosTheta)
            .addScaledVector(B, sinTheta)
            .normalize();

          const vertex = new THREE.Vector3().copy(pt).addScaledVector(normal, radius);

          stemVertices.push(vertex.x, vertex.y, vertex.z);
          stemNormals.push(normal.x, normal.y, normal.z);
          stemColors.push(rVal, gVal, bVal);
        }
      }

      for (let i = 0; i < segments; i++) {
        for (let j = 0; j < radialSegments; j++) {
          const a = i * (radialSegments + 1) + j;
          const b = (i + 1) * (radialSegments + 1) + j;
          const c = (i + 1) * (radialSegments + 1) + (j + 1);
          const d = i * (radialSegments + 1) + (j + 1);

          stemIndices.push(a, b, d);
          stemIndices.push(b, c, d);
        }
      }

      const stemGeo = new THREE.BufferGeometry();
      stemGeo.setAttribute('position', new THREE.Float32BufferAttribute(stemVertices, 3));
      stemGeo.setAttribute('normal', new THREE.Float32BufferAttribute(stemNormals, 3));
      stemGeo.setAttribute('color', new THREE.Float32BufferAttribute(stemColors, 3));
      stemGeo.setIndex(stemIndices);

      const stemMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: s.xrayMode ? 0.2 : 0.35,
        metalness: 0.04,
        transparent: s.xrayMode,
        opacity: s.xrayMode ? 0.38 : 1.0,
      });

      stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.castShadow = true;
      stemMesh.receiveShadow = true;
      plantGroup.add(stemMesh);

      // Leaves and Terminal Bud
      if (!isDecapitated) {
        leavesMesh = new THREE.Group();
        leavesMesh.position.copy(p3);
        leavesMesh.rotation.z = -angleRad;

        // Realistic Cotyledon Leaf (Thick fleshy spoon-shape with distinct midrib vein)
        const cotyledonShape = new THREE.Shape();
        cotyledonShape.moveTo(0, 0);
        cotyledonShape.bezierCurveTo(0.18, 0.16, 0.45, 0.32, 0.72, 0.08);
        cotyledonShape.bezierCurveTo(0.48, -0.26, 0.16, -0.18, 0, 0);

        const cotyledonExtrude = {
          depth: 0.024,
          bevelEnabled: true,
          bevelSegments: 4,
          steps: 1,
          bevelSize: 0.02,
          bevelThickness: 0.02,
        };
        const cotyledonGeo = new THREE.ExtrudeGeometry(cotyledonShape, cotyledonExtrude);

        const leafMat = new THREE.MeshStandardMaterial({
          color: s.xrayMode ? 0x0891b2 : 0x15803d,
          roughness: 0.3,
          metalness: 0.04,
          transparent: s.xrayMode,
          opacity: s.xrayMode ? 0.45 : 1.0,
        });

        // Left Cotyledon with curved petiole (cuống lá mầm)
        const petioleGeo = new THREE.CylinderGeometry(0.028, 0.038, 0.18, 12);
        petioleGeo.rotateZ(Math.PI / 4);
        const petioleL = new THREE.Mesh(petioleGeo, stemMat);
        petioleL.position.set(-0.06, -0.04, 0);
        leavesMesh.add(petioleL);

        const leafLeft = new THREE.Mesh(cotyledonGeo, leafMat);
        leafLeft.position.set(-0.08, 0.02, 0);
        leafLeft.rotation.z = Math.PI / 5;
        leafLeft.rotation.x = 0.22; // Natural cupping droop
        leafLeft.scale.set(1.15, 1.15, 1.15);
        leafLeft.castShadow = true;
        leavesMesh.add(leafLeft);

        // Right Cotyledon
        const petioleR = new THREE.Mesh(petioleGeo, stemMat);
        petioleR.position.set(0.06, -0.04, 0);
        petioleR.rotation.z = -Math.PI / 2;
        leavesMesh.add(petioleR);

        const leafRight = new THREE.Mesh(cotyledonGeo, leafMat);
        leafRight.position.set(0.08, 0.02, 0);
        leafRight.rotation.z = Math.PI - Math.PI / 5;
        leafRight.rotation.x = Math.PI - 0.22;
        leafRight.scale.set(1.15, 1.15, 1.15);
        leafRight.castShadow = true;
        leavesMesh.add(leafRight);

        // Midrib Veins on both leaves (gân chính nổi rõ)
        const veinMat = new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.4 });
        const veinGeo = new THREE.CylinderGeometry(0.008, 0.016, 0.55, 8);
        veinGeo.rotateZ(Math.PI / 2);

        const veinL = new THREE.Mesh(veinGeo, veinMat);
        veinL.position.set(0.32, 0.02, 0.028);
        leafLeft.add(veinL);

        const veinR = new THREE.Mesh(veinGeo, veinMat);
        veinR.position.set(0.32, 0.02, 0.028);
        leafRight.add(veinR);

        // Emerging Pair of First True Leaves (Hai lá thật non mơn mởn ở đỉnh sinh trưởng)
        const trueLeafGeo = new THREE.SphereGeometry(0.12, 12, 12);
        trueLeafGeo.scale(1.8, 0.18, 0.7);
        const trueLeafMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.35 });

        const trueLeafL = new THREE.Mesh(trueLeafGeo, trueLeafMat);
        trueLeafL.position.set(-0.06, 0.12, 0.04);
        trueLeafL.rotation.y = Math.PI / 4;
        trueLeafL.rotation.z = Math.PI / 6;
        leavesMesh.add(trueLeafL);

        const trueLeafR = new THREE.Mesh(trueLeafGeo, trueLeafMat);
        trueLeafR.position.set(0.06, 0.12, -0.04);
        trueLeafR.rotation.y = -Math.PI / 4;
        trueLeafR.rotation.z = -Math.PI / 6;
        leavesMesh.add(trueLeafR);

        // Tender Terminal Bud apex
        const budGeo = new THREE.ConeGeometry(0.045, 0.16, 12);
        budGeo.translate(0, 0.1, 0);
        const budMat = new THREE.MeshStandardMaterial({ color: 0xa3e635, roughness: 0.4 });
        const bud = new THREE.Mesh(budGeo, budMat);
        leavesMesh.add(bud);

        // Darwin Treatment accessories
        if (s.plantTreatment === 'opaque_cap') {
          const capGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.45, 24);
          const capMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.4 });
          treatmentItem = new THREE.Mesh(capGeo, capMat);
          treatmentItem.position.copy(p3);
          treatmentItem.rotation.z = -angleRad;
          treatmentItem.position.y += 0.2;
          treatmentItem.castShadow = true;
          plantGroup.add(treatmentItem);
        } else if (s.plantTreatment === 'transparent_cap') {
          const capGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.45, 24);
          const capMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transmission: 0.94,
            opacity: 1,
            transparent: true,
            roughness: 0.05,
            ior: 1.5,
          });
          treatmentItem = new THREE.Mesh(capGeo, capMat);
          treatmentItem.position.copy(p3);
          treatmentItem.rotation.z = -angleRad;
          treatmentItem.position.y += 0.2;
          plantGroup.add(treatmentItem);
        } else if (s.plantTreatment === 'agar_block') {
          const agarGeo = new THREE.BoxGeometry(0.24, 0.14, 0.24);
          const agarMat = new THREE.MeshPhysicalMaterial({
            color: 0xfef08a,
            transmission: 0.82,
            opacity: 0.9,
            transparent: true,
            roughness: 0.1,
          });
          treatmentItem = new THREE.Mesh(agarGeo, agarMat);
          treatmentItem.position.copy(p3);
          treatmentItem.position.y -= 0.08;
          plantGroup.add(treatmentItem);
        } else if (s.plantTreatment === 'mica_insert') {
          const micaGeo = new THREE.BoxGeometry(0.26, 0.035, 0.14);
          const micaMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.1 });
          treatmentItem = new THREE.Mesh(micaGeo, micaMat);
          treatmentItem.position.copy(p3);
          treatmentItem.position.y -= 0.12;
          treatmentItem.position.x += angleRad > 0 ? -0.09 : 0.09;
          plantGroup.add(treatmentItem);
        }

        plantGroup.add(leavesMesh);
      } else {
        // Decapitated Cut Surface
        const cutGeo = new THREE.CircleGeometry(0.075, 16);
        cutGeo.rotateX(-Math.PI / 2);
        const cutMat = new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.6 });
        treatmentItem = new THREE.Mesh(cutGeo, cutMat);
        treatmentItem.position.copy(p3);
        plantGroup.add(treatmentItem);
      }

      // Update Auxin particle positions along stem
      if (auxinParticles && s.xrayMode) {
        auxinParticles.visible = true;
        const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
        const darkSideDir = angleRad > 0 ? -1 : 1;
        const isBendingPossible =
          s.plantTreatment === 'normal' ||
          s.plantTreatment === 'transparent_cap' ||
          s.plantTreatment === 'agar_block';

        for (let i = 0; i < particleCount; i++) {
          const t = particleTValues[i];
          const pointOnCurve = curve.getPoint(t);
          const auxinShift = isBendingPossible
            ? darkSideDir * (0.05 + Math.abs(angleRad) * 0.06)
            : 0;
          const jitterX = (Math.random() - 0.5) * 0.04;
          const jitterZ = (Math.random() - 0.5) * 0.05;

          posAttr.setXYZ(i, pointOnCurve.x + auxinShift + jitterX, pointOnCurve.y, pointOnCurve.z + jitterZ);
        }
        posAttr.needsUpdate = true;
      } else if (auxinParticles) {
        auxinParticles.visible = false;
      }
    }

    // Direct Interaction on Lamp via Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(lampClickables, true);
      if (intersects.length > 0) {
        renderer.domElement.style.cursor = 'pointer';
        setIsHoveringLamp(true);
      } else {
        renderer.domElement.style.cursor = 'default';
        setIsHoveringLamp(false);
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(lampClickables, true);
      if (intersects.length > 0) {
        setIsLampControlOpen((prev) => !prev);
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
      const dark = darkroomRef.current;

      let targetAngleDeg = 0;
      if (s.lightColor !== 'off' && s.lightIntensity > 5) {
        const lightEffectiveness =
          s.lightColor === 'blue' ? 1.25 : s.lightColor === 'white' ? 1.0 : 0.25;
        const maxBend = (s.lightAngle * (s.lightIntensity / 100)) * lightEffectiveness;

        if (s.plantTreatment === 'normal') {
          targetAngleDeg = maxBend;
        } else if (s.plantTreatment === 'transparent_cap') {
          targetAngleDeg = maxBend * 0.95;
        } else if (s.plantTreatment === 'agar_block') {
          targetAngleDeg = maxBend * 0.7;
        } else if (s.plantTreatment === 'opaque_cap' || s.plantTreatment === 'decapitated') {
          targetAngleDeg = 0;
        } else if (s.plantTreatment === 'mica_insert') {
          targetAngleDeg = maxBend * 0.2;
        }
      }

      const targetAngleRad = (targetAngleDeg * Math.PI) / 180;
      const growthSpeed = playing ? 1.8 * s.timeMultiplier * delta : 0.5 * delta;
      currentBentAngleRef.current += (targetAngleRad - currentBentAngleRef.current) * Math.min(growthSpeed, 0.2);

      if (onAngleUpdate) {
        const curDeg = (currentBentAngleRef.current * 180) / Math.PI;
        onAngleUpdate(Math.round(curDeg * 10) / 10);
      }

      // Update Lamp 3D Position
      const lampDist = 4.1;
      const lampAngleRad = (s.lightAngle * Math.PI) / 180;
      const lampX = Math.sin(lampAngleRad) * lampDist;
      const lampY = 3.3 - Math.abs(Math.sin(lampAngleRad)) * 0.45;
      const lampZ = Math.cos(lampAngleRad) * 0.7;

      lampGroup.position.set(lampX, 0, lampZ);
      lampGroup.rotation.y = -lampAngleRad;

      const plantTipPos = new THREE.Vector3(0, 2.4, 0);
      spotLight.position.set(lampX, lampY, lampZ);
      spotLight.target.position.copy(plantTipPos);
      spotLight.target.updateMatrixWorld();

      beamMesh.position.set(0, lampY - 0.2, 0);
      beamMesh.lookAt(plantTipPos);
      beamMesh.rotateX(-Math.PI / 2);

      // Light Color & Intensity
      let colorHex = 0xfffbeb;
      let bulbIntensity = s.lightIntensity / 22;
      if (s.lightColor === 'off') {
        colorHex = 0x222222;
        bulbIntensity = 0;
      } else if (s.lightColor === 'blue') {
        colorHex = 0x38bdf8;
      } else if (s.lightColor === 'red') {
        colorHex = 0xef4444;
      }

      spotLight.color.setHex(colorHex);
      const intensityMult = dark ? 11 : 7.5;
      spotLight.intensity = (s.lightIntensity / 100) * intensityMult * (s.lightColor === 'off' ? 0 : 1);
      (bulb.material as THREE.MeshStandardMaterial).emissive.setHex(colorHex);
      (bulb.material as THREE.MeshStandardMaterial).emissiveIntensity = bulbIntensity;
      beamMat.color.setHex(colorHex);
      beamMat.opacity = (s.lightIntensity / 100) * (dark ? 0.22 : 0.08) * (s.lightColor === 'off' ? 0 : 1);

      // Floating dust particles animation
      const time = clock.getElapsedTime();
      const posAttr = dustGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < dustCount; i++) {
        let py = posAttr.getY(i) - delta * 0.12;
        if (py < 0.2) py = 3.2;
        posAttr.setY(i, py);
        posAttr.setX(i, posAttr.getX(i) + Math.sin(time + i) * 0.001);
      }
      posAttr.needsUpdate = true;
      dustPoints.visible = s.lightColor !== 'off' && s.lightIntensity > 10;

      updatePlantGeometry(currentBentAngleRef.current, s);

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

  // Handle Darkroom Mode switch
  const handleToggleDarkroom = () => {
    const nextVal = !isDarkroom;
    setIsDarkroom(nextVal);
    darkroomRef.current = nextVal;
    if (envControllerRef.current) {
      envControllerRef.current.setDarkroom(nextVal);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shadow-2xl">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D HUD Badges */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/80 text-xs font-semibold text-emerald-400 shadow-md">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          Phòng Thí Nghiệm Sinh Học • Mô Hình Hướng Sáng
        </div>
        <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-[11px] text-slate-200 shadow-md">
          Góc đèn: <strong className="text-amber-400">{state.lightAngle}°</strong> | Cường độ: <strong className="text-sky-400">{state.lightIntensity}%</strong>
        </div>
      </div>

      {/* Action Buttons Top Right: Darkroom Mode + Inquiry + Direct Lamp Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        {/* Darkroom Mode Toggle Button */}
        <button
          onClick={handleToggleDarkroom}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-md backdrop-blur-md transition-all cursor-pointer ${
            isDarkroom
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-white/90 text-slate-800 border border-slate-300 hover:bg-white'
          }`}
          title="Bật/Tắt chế độ buồng tối để quan sát rõ chùm tia sáng và hướng tác động"
        >
          <span>{isDarkroom ? '🌙' : '☀️'}</span>
          <span>{isDarkroom ? 'Buồng tối (Bật)' : 'Phòng sáng'}</span>
        </button>

        {/* Guided Inquiry Prompt Button */}
        {onOpenInquiry && (
          <button
            onClick={onOpenInquiry}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-md backdrop-blur-md transition-all cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400/30"
          >
            <span>🔬</span>
            <span>Nghiên cứu & Giả thuyết</span>
          </button>
        )}

        {/* Direct Interactive Lamp Click Button */}
        <button
          onClick={() => setIsLampControlOpen((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-md backdrop-blur-md transition-all cursor-pointer ${
            isLampControlOpen
              ? 'bg-amber-500 text-slate-950 font-extrabold ring-2 ring-amber-400'
              : isHoveringLamp
              ? 'bg-amber-400 text-slate-950 scale-105'
              : 'bg-slate-900/90 text-amber-300 border border-slate-700 hover:bg-slate-800'
          }`}
        >
          <span className="animate-pulse">💡</span>
          <span>{isLampControlOpen ? 'Đang chỉnh Đèn' : 'Chỉnh Đèn'}</span>
        </button>
      </div>

      {/* DIRECT LAMP INTERACTIVE CONTROL POPUP OVERLAY */}
      {isLampControlOpen && onUpdateState && (
        <div className="absolute top-16 right-4 z-30 w-80 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl p-4 shadow-2xl text-slate-800 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold">
                💡
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">Điều Khiển Trực Tiếp Đèn</h4>
                <p className="text-[10px] text-slate-500">Chỉnh thông số nguồn sáng thời gian thực</p>
              </div>
            </div>
            <button
              onClick={() => setIsLampControlOpen(false)}
              className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center text-xs transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* 1. Light Intensity Slider (Độ sáng) */}
          <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Độ sáng đèn (Cường độ)</span>
              <span className="font-mono text-sky-700 font-extrabold bg-sky-50 px-2 py-0.5 rounded border border-sky-200 text-xs">
                {state.lightIntensity}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={state.lightIntensity}
              onChange={(e) => {
                const val = Number(e.target.value);
                onUpdateState((prev) => ({ ...prev, lightIntensity: val }));
              }}
              className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between gap-1 pt-1">
              {[25, 50, 75, 100].map((preset) => (
                <button
                  key={preset}
                  onClick={() => onUpdateState((prev) => ({ ...prev, lightIntensity: preset }))}
                  className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition cursor-pointer ${
                    state.lightIntensity === preset
                      ? 'bg-sky-500 text-white border-sky-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>

          {/* 2. Light Angle Slider (Góc xoay đèn) */}
          <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Góc xoay nguồn sáng</span>
              <span className="font-mono text-amber-700 font-extrabold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs">
                {state.lightAngle}°
              </span>
            </div>
            <input
              type="range"
              min="-60"
              max="60"
              step="5"
              value={state.lightAngle}
              onChange={(e) => {
                const val = Number(e.target.value);
                onUpdateState((prev) => ({ ...prev, lightAngle: val }));
              }}
              className="w-full accent-amber-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between gap-1 pt-1">
              {[
                { label: 'Trái (-45°)', val: -45 },
                { label: 'Đỉnh (0°)', val: 0 },
                { label: 'Phải (+45°)', val: 45 },
              ].map((btn) => (
                <button
                  key={btn.val}
                  onClick={() => onUpdateState((prev) => ({ ...prev, lightAngle: btn.val }))}
                  className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition cursor-pointer ${
                    state.lightAngle === btn.val
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Spectrum Color Switcher */}
          <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <label className="text-xs font-bold text-slate-700">Màu đèn quang phổ</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'white', label: 'Trắng', activeClass: 'bg-white text-slate-900 border-slate-400 font-bold shadow-xs' },
                { id: 'blue', label: 'Xanh lam', activeClass: 'bg-sky-100 text-sky-800 border-sky-400 font-bold shadow-xs' },
                { id: 'red', label: 'Đỏ', activeClass: 'bg-rose-100 text-rose-800 border-rose-400 font-bold shadow-xs' },
                { id: 'off', label: 'Tắt đèn', activeClass: 'bg-slate-200 text-slate-700 border-slate-400 font-bold shadow-xs' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() =>
                    onUpdateState((prev) => ({
                      ...prev,
                      lightColor: c.id as PhototropismState['lightColor'],
                    }))
                  }
                  className={`py-1 px-1 rounded-lg text-[11px] border transition cursor-pointer ${
                    state.lightColor === c.id
                      ? `${c.activeClass} ring-2 ring-emerald-500/30`
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* X-Ray Auxin Toast */}
      {state.xrayMode && (
        <div className="absolute top-16 left-4 bg-amber-950/90 border border-amber-500/50 backdrop-blur-md px-3.5 py-2.5 rounded-2xl text-xs text-amber-200 shadow-xl max-w-[280px]">
          <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-400">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            Chế độ X-Ray: Phân bố Auxin
          </div>
          <p className="text-[11px] leading-relaxed text-amber-200/90">
            Hạt màu vàng thể hiện hormone Auxin dồn về phía khuất sáng, kích hoạt kéo dài tế bào phía tối khiến thân cây cong về phía nguồn sáng.
          </p>
        </div>
      )}

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/85 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-700 text-[11px] text-slate-300 pointer-events-none shadow-md flex items-center gap-2">
        <span>💡 <strong>Buồng tối thí nghiệm:</strong> Ánh sáng đèn là kích thích đơn hướng duy nhất</span>
        <span>•</span>
        <span>🖱️ Xoay 360° quan sát phía sáng & phía tối</span>
      </div>
    </div>
  );
}
