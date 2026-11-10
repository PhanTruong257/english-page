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
  isActive?: boolean;
}

export default function PhototropismScene({
  state,
  onUpdateState,
  onAngleUpdate,
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

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

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

  // Track smoothly interpolated bent angle
  const currentBentAngleRef = useRef(0);

  // Darkroom Mode state (Default TRUE for high-contrast directional light observation)
  const [isDarkroom, setIsDarkroom] = useState<boolean>(true);
  const darkroomRef = useRef<boolean>(true);
  darkroomRef.current = isDarkroom;

  // Botanical Anatomy Pins Toggle
  const [showAnatomy, setShowAnatomy] = useState(false);

  // Direct Interactive Lamp Control Modal / Popover
  const [isLampControlOpen, setIsLampControlOpen] = useState(false);

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
    const saucerGeo = new THREE.CylinderGeometry(1.15, 1.02, 0.14, 48);
    const saucerMat = new THREE.MeshStandardMaterial({
      color: 0x9a3412,
      roughness: 0.70,
      metalness: 0.04,
    });
    const saucer = new THREE.Mesh(saucerGeo, saucerMat);
    saucer.position.y = 0.07;
    saucer.castShadow = true;
    saucer.receiveShadow = true;
    potGroup.add(saucer);

    // Realistic Terracotta Pot Wall
    const potGeo = new THREE.CylinderGeometry(0.98, 0.74, 1.38, 48, 1, true);
    const potMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.65,
      metalness: 0.04,
      side: THREE.DoubleSide,
    });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.y = 0.76;
    pot.castShadow = true;
    pot.receiveShadow = true;
    potGroup.add(pot);

    // Pot Bottom inside
    const potBottomGeo = new THREE.CircleGeometry(0.74, 48);
    potBottomGeo.rotateX(Math.PI / 2);
    const potBottom = new THREE.Mesh(potBottomGeo, potMat);
    potBottom.position.y = 0.08;
    potGroup.add(potBottom);

    // Smooth Molded Rim
    const rimGeo = new THREE.TorusGeometry(0.99, 0.08, 20, 48);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.62 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 1.45;
    rim.castShadow = true;
    potGroup.add(rim);

    // Realistic Organic Humus Potting Soil with procedural micro-relief
    const soilGeo = new THREE.CylinderGeometry(0.93, 0.78, 0.42, 64, 12);
    const soilPos = soilGeo.attributes.position as THREE.BufferAttribute;
    const topRadius = 0.93;
    for (let i = 0; i < soilPos.count; i++) {
      const vy = soilPos.getY(i);
      if (vy > 0.16) {
        const vx = soilPos.getX(i);
        const vz = soilPos.getZ(i);
        const dist = Math.sqrt(vx * vx + vz * vz);
        if (dist < topRadius - 0.02) {
          // Organic soil mound towards center + crumbly earth texture
          const mound = Math.cos((dist / topRadius) * (Math.PI / 2)) * 0.055;
          const crumbNoise =
            (Math.sin(vx * 26) * Math.cos(vz * 26) +
              Math.sin(vx * 42 + vz * 35) * 0.5 +
              Math.cos(vx * 65 - vz * 58) * 0.25) * 0.016;
          soilPos.setY(i, vy + mound + crumbNoise);
        }
      }
    }
    soilGeo.computeVertexNormals();

    const soilMat = new THREE.MeshStandardMaterial({
      color: 0x1c130c, // Rich dark organic loam
      roughness: 0.95,
      metalness: 0.02,
    });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.y = 1.20; // Surface sits naturally recessed below rim
    soil.receiveShadow = true;
    potGroup.add(soil);

    // Banked earth mound around seedling collar (cổ rễ tự nhiên)
    const collarMoundGeo = new THREE.ConeGeometry(0.36, 0.08, 32);
    const collarMoundMat = new THREE.MeshStandardMaterial({ color: 0x160e08, roughness: 0.98 });
    const collarMound = new THREE.Mesh(collarMoundGeo, collarMoundMat);
    collarMound.position.y = 1.42;
    collarMound.receiveShadow = true;
    potGroup.add(collarMound);

    // Natural Soil Particulates: Dark humus clumps & fine mineral flecks (earth tones, not stark white!)
    const crumbMat1 = new THREE.MeshStandardMaterial({ color: 0x2e1c10, roughness: 0.95 });
    const crumbMat2 = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 }); // fine mineral
    const crumbMat3 = new THREE.MeshStandardMaterial({ color: 0xa8a29e, roughness: 0.8 }); // perlite flake

    for (let i = 0; i < 45; i++) {
      const radius = 0.10 + Math.random() * 0.76;
      const angle = Math.random() * Math.PI * 2;
      const px = Math.cos(angle) * radius;
      const pz = Math.sin(angle) * radius;
      const pScale = 0.010 + Math.random() * 0.015;
      const mat = i % 6 === 0 ? crumbMat3 : i % 3 === 0 ? crumbMat2 : crumbMat1;

      const crumb = new THREE.Mesh(new THREE.DodecahedronGeometry(pScale, 0), mat);
      crumb.position.set(px, 1.41 + Math.random() * 0.012, pz);
      crumb.rotation.set(Math.random(), Math.random(), Math.random());
      crumb.receiveShadow = true;
      potGroup.add(crumb);
    }

    // Plant Stem Group
    const plantGroup = new THREE.Group();
    plantGroup.position.set(0, 1.36, 0);
    scene.add(plantGroup);

    let stemMesh: THREE.Mesh | null = null;
    let leavesMesh: THREE.Group | null = null;
    let treatmentItem: THREE.Mesh | null = null;
    let auxinParticles: THREE.Points | null = null;
    let cellsGroup: THREE.Group | null = null;

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
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
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

    // Generator for Authentic 3D Botanical Dicot Leaf Geometry (Phiến lá thật 3D có độ uốn cong, khum lòng máng & lượn sóng tự nhiên)
    function createBotanicalLeafGeometry(
      length: number,
      maxWidth: number,
      cupDepth: number,
      droopFactor: number,
      waveAmount: number
    ): THREE.BufferGeometry {
      const segmentsU = 28;
      const segmentsV = 18;
      const vertices: number[] = [];
      const normals: number[] = [];
      const colors: number[] = [];
      const uvs: number[] = [];
      const indices: number[] = [];

      for (let i = 0; i <= segmentsU; i++) {
        const u = i / segmentsU;
        // Cordate/ovate dicot leaf profile: narrow at petiole joint (u=0), swells gracefully to max width at u ~ 0.35, then gently tapers to a slender tip
        const widthFactor = Math.pow(Math.sin(u * Math.PI), 0.65) * (1 - 0.28 * u);
        const halfWidth = maxWidth * 0.5 * widthFactor;

        // Arch outward from petiole then droop under gravity towards tip
        const y = u * length;
        const archY = Math.sin(u * Math.PI) * 0.045;
        const droopZ = -Math.pow(u, 1.7) * droopFactor + archY;

        for (let j = 0; j <= segmentsV; j++) {
          const vNorm = (j / segmentsV) * 2 - 1; // -1 (left edge) to 0 (midrib) to +1 (right edge)
          const x = vNorm * halfWidth;

          // Transverse cupping (spoon / concave surface collecting sunlight)
          const cupZ = (vNorm * vNorm) * cupDepth * Math.sin(u * Math.PI);

          // Subtle organic undulating margin (mép lá lượn sóng)
          const marginWave =
            Math.abs(vNorm) > 0.5
              ? Math.sin(u * 14 + vNorm * 4) * waveAmount * Math.sin(u * Math.PI)
              : 0;

          // Midrib indentation groove on upper surface
          const midribGroove =
            Math.abs(vNorm) < 0.15 ? -0.008 * (1 - Math.abs(vNorm) / 0.15) : 0;

          const z = droopZ + cupZ + marginWave + midribGroove;

          vertices.push(x, y, z);
          uvs.push(j / segmentsV, u);

          // Biological vertex color gradient:
          // Midrib: tender pale chartreuse green
          // Lamina: deep rich chlorophyll green (#16a34a) to tender fresh green (#22c55e) near margin
          const distFromCenter = Math.abs(vNorm);
          let r = 0.09;
          let g = 0.55;
          let b = 0.22;

          if (distFromCenter < 0.14) {
            const t = 1 - distFromCenter / 0.14;
            r = THREE.MathUtils.lerp(0.09, 0.48, t);
            g = THREE.MathUtils.lerp(0.55, 0.92, t);
            b = THREE.MathUtils.lerp(0.22, 0.52, t);
          } else {
            const t = (distFromCenter - 0.14) / 0.86;
            r = THREE.MathUtils.lerp(0.09, 0.16, t);
            g = THREE.MathUtils.lerp(0.55, 0.75, t);
            b = THREE.MathUtils.lerp(0.22, 0.30, t);
          }

          colors.push(r, g, b);
        }
      }

      for (let i = 0; i < segmentsU; i++) {
        for (let j = 0; j < segmentsV; j++) {
          const a = i * (segmentsV + 1) + j;
          const b = (i + 1) * (segmentsV + 1) + j;
          const c = (i + 1) * (segmentsV + 1) + (j + 1);
          const d = i * (segmentsV + 1) + (j + 1);

          indices.push(a, b, d);
          indices.push(b, c, d);
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geo.setIndex(indices);
      geo.computeVertexNormals();

      return geo;
    }

    // Rebuild Plant Stem & Leaf Geometry with authentic botanical features
    function updatePlantGeometry(angleRad: number, s: PhototropismState) {
      if (stemMesh) plantGroup.remove(stemMesh);
      if (leavesMesh) plantGroup.remove(leavesMesh);
      if (treatmentItem) plantGroup.remove(treatmentItem);
      if (cellsGroup) plantGroup.remove(cellsGroup);

      const height = 2.75;
      const isDecapitated = s.plantTreatment === 'decapitated';
      const actualHeight = isDecapitated ? height * 0.72 : height;

      // Realistic biological bending curve using 5 progressive control points
      const tipOffsetX = Math.sin(angleRad) * (actualHeight * 0.62);
      const tipOffsetY = Math.cos(angleRad) * (actualHeight * 0.90) + actualHeight * 0.10;

      const p0 = new THREE.Vector3(0, 0, 0); // Root collar in soil
      const p1 = new THREE.Vector3(0, actualHeight * 0.28, 0); // Anchored basal stem
      const p2 = new THREE.Vector3(tipOffsetX * 0.28, actualHeight * 0.60, 0); // Mid-stem inflection
      const p3 = new THREE.Vector3(tipOffsetX * 0.75, actualHeight * 0.86, 0); // Elongation zone
      const p4 = new THREE.Vector3(tipOffsetX, tipOffsetY, 0); // Shoot apical apex

      const curve = new THREE.CatmullRomCurve3([p0, p1, p2, p3, p4], false, 'centripetal', 0.5);

      // Anatomical Stem with Botanical Taper & Micro-fluting
      const segments = 48;
      const radialSegments = 24;
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

        // Botanical taper: Root collar (r=0.118), mid stem (r=0.088), apex (r=0.046)
        const radiusBase = 0.118 - (u * 0.072);

        // Biological Color Gradient per vertex:
        // Base (u < 0.16): Ivory-pink succulent root collar (anthocyanin protection)
        // Mid (u 0.16 - 0.75): Rich translucent jade chlorophyll green
        // Top (u > 0.75): Bright tender chartreuse lime
        let rVal = 0.10;
        let gVal = 0.62;
        let bVal = 0.24;

        if (u < 0.16) {
          const tBase = u / 0.16;
          rVal = THREE.MathUtils.lerp(0.86, 0.10, tBase);
          gVal = THREE.MathUtils.lerp(0.84, 0.62, tBase);
          bVal = THREE.MathUtils.lerp(0.72, 0.24, tBase);
        } else if (u > 0.75) {
          const tTop = (u - 0.75) / 0.25;
          rVal = THREE.MathUtils.lerp(0.10, 0.68, tTop);
          gVal = THREE.MathUtils.lerp(0.62, 0.94, tTop);
          bVal = THREE.MathUtils.lerp(0.24, 0.20, tTop);
        }

        if (s.xrayMode) {
          rVal = 0.06;
          gVal = 0.72;
          bVal = 0.85;
        }

        for (let j = 0; j <= radialSegments; j++) {
          const v = j / radialSegments;
          const theta = v * Math.PI * 2;
          const sinTheta = Math.sin(theta);
          const cosTheta = Math.cos(theta);

          // Subtle organic longitudinal ridges/striations (succulent hypocotyl texture)
          const flute = Math.sin(theta * 6) * 0.0035;
          const currentR = radiusBase + flute;

          const normal = new THREE.Vector3()
            .copy(N).multiplyScalar(cosTheta)
            .addScaledVector(B, sinTheta)
            .normalize();

          const vertex = new THREE.Vector3().copy(pt).addScaledVector(normal, currentR);

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
        roughness: s.xrayMode ? 0.2 : 0.36,
        metalness: 0.02,
        transparent: s.xrayMode,
        opacity: s.xrayMode ? 0.35 : 1.0,
      });

      stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.castShadow = true;
      stemMesh.receiveShadow = true;
      plantGroup.add(stemMesh);

      // Leaves and Terminal Bud
      if (!isDecapitated) {
        leavesMesh = new THREE.Group();
        leavesMesh.position.copy(p4);

        // Continuous mathematical alignment: Align crown's local Y with curve tangent at apex
        const apexTangent = curve.getTangentAt(1.0).normalize();
        const crownQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), apexTangent);
        leavesMesh.quaternion.copy(crownQuat);

        // 1. Two Fleshy Cotyledons (Hai lá mầm đậu mọng thịt) at Cotyledonary Node
        const cotyledonMat = new THREE.MeshStandardMaterial({
          color: s.xrayMode ? 0x06b6d4 : 0x84cc16,
          roughness: 0.32,
          metalness: 0.02,
          transparent: s.xrayMode,
          opacity: s.xrayMode ? 0.45 : 1.0,
        });

        // Left Cotyledon
        const cotyledonGeoL = new THREE.SphereGeometry(0.11, 16, 16);
        cotyledonGeoL.scale(0.85, 0.65, 1.25);
        const cotyledonL = new THREE.Mesh(cotyledonGeoL, cotyledonMat);
        cotyledonL.position.set(-0.09, -0.06, 0);
        cotyledonL.rotation.set(0.15, 0, 0.4);
        cotyledonL.castShadow = true;
        leavesMesh.add(cotyledonL);

        // Right Cotyledon
        const cotyledonGeoR = new THREE.SphereGeometry(0.11, 16, 16);
        cotyledonGeoR.scale(0.85, 0.65, 1.25);
        const cotyledonR = new THREE.Mesh(cotyledonGeoR, cotyledonMat);
        cotyledonR.position.set(0.09, -0.06, 0);
        cotyledonR.rotation.set(0.15, 0, -0.4);
        cotyledonR.castShadow = true;
        leavesMesh.add(cotyledonR);

        // 2. Petioles & True Leaves (Đôi lá thật đầu tiên với cuống lá vươn mềm mại)
        const petioleMat = new THREE.MeshStandardMaterial({
          color: s.xrayMode ? 0x0891b2 : 0x22c55e,
          roughness: 0.38,
          metalness: 0.02,
        });

        // Botanical Leaf Blade Material (Double-sided organic look)
        const leafBladeMat = new THREE.MeshStandardMaterial({
          vertexColors: true,
          side: THREE.DoubleSide,
          roughness: s.xrayMode ? 0.2 : 0.34,
          metalness: 0.02,
          transparent: s.xrayMode,
          opacity: s.xrayMode ? 0.42 : 1.0,
        });

        const leafBladeGeo = createBotanicalLeafGeometry(0.88, 0.52, 0.09, 0.22, 0.014);

        // Left Petiole: Gentle 3D arching curve
        const petioleCurveL = new THREE.CubicBezierCurve3(
          new THREE.Vector3(0, 0.01, 0),
          new THREE.Vector3(-0.10, 0.06, 0.03),
          new THREE.Vector3(-0.22, 0.12, 0.05),
          new THREE.Vector3(-0.32, 0.15, 0.06)
        );
        const petioleGeoL = new THREE.TubeGeometry(petioleCurveL, 16, 0.022, 10, false);
        const petioleMeshL = new THREE.Mesh(petioleGeoL, petioleMat);
        petioleMeshL.castShadow = true;
        leavesMesh.add(petioleMeshL);

        // Left True Leaf Blade
        const leafBladeL = new THREE.Mesh(leafBladeGeo, leafBladeMat);
        leafBladeL.position.set(-0.32, 0.15, 0.06);
        leafBladeL.rotation.set(-0.32, -0.42, 0.82);
        // Heliotropic angle adjustment: slight tilt towards light
        if (s.lightAngle < -10) leafBladeL.rotation.y -= 0.15;
        leafBladeL.castShadow = true;
        leavesMesh.add(leafBladeL);

        // Raised 3D Midrib Vein on Left Leaf
        const midribCurveL = new THREE.CubicBezierCurve3(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0.35, -0.05),
          new THREE.Vector3(0, 0.65, -0.12),
          new THREE.Vector3(0, 0.88, -0.19)
        );
        const midribGeoL = new THREE.TubeGeometry(midribCurveL, 16, 0.014, 8, false);
        const midribMat = new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.4 });
        const midribMeshL = new THREE.Mesh(midribGeoL, midribMat);
        leafBladeL.add(midribMeshL);

        // Right Petiole
        const petioleCurveR = new THREE.CubicBezierCurve3(
          new THREE.Vector3(0, 0.01, 0),
          new THREE.Vector3(0.10, 0.06, 0.03),
          new THREE.Vector3(0.22, 0.12, 0.05),
          new THREE.Vector3(0.32, 0.15, 0.06)
        );
        const petioleGeoR = new THREE.TubeGeometry(petioleCurveR, 16, 0.022, 10, false);
        const petioleMeshR = new THREE.Mesh(petioleGeoR, petioleMat);
        petioleMeshR.castShadow = true;
        leavesMesh.add(petioleMeshR);

        // Right True Leaf Blade
        const leafBladeR = new THREE.Mesh(leafBladeGeo, leafBladeMat);
        leafBladeR.position.set(0.32, 0.15, 0.06);
        leafBladeR.rotation.set(-0.32, 0.42, -0.82);
        if (s.lightAngle > 10) leafBladeR.rotation.y += 0.15;
        leafBladeR.castShadow = true;
        leavesMesh.add(leafBladeR);

        // Raised 3D Midrib Vein on Right Leaf
        const midribMeshR = new THREE.Mesh(midribGeoL, midribMat);
        leafBladeR.add(midribMeshR);

        // 3. Shoot Apical Meristem & Nascent Leaflets (Chồi đỉnh sinh trưởng & búp non chúm chím)
        const apicalGroup = new THREE.Group();
        apicalGroup.position.set(0, 0.03, 0);

        // Miniature emerging leaflet pair in bud
        const budLeafMat = new THREE.MeshStandardMaterial({ color: 0xbef264, roughness: 0.3 });
        const budLeafGeo = new THREE.SphereGeometry(0.06, 12, 12);
        budLeafGeo.scale(0.8, 1.8, 0.35);

        const budL = new THREE.Mesh(budLeafGeo, budLeafMat);
        budL.position.set(-0.025, 0.07, 0.01);
        budL.rotation.set(0.1, 0.2, 0.18);
        apicalGroup.add(budL);

        const budR = new THREE.Mesh(budLeafGeo, budLeafMat);
        budR.position.set(0.025, 0.07, -0.01);
        budR.rotation.set(-0.1, -0.2, -0.18);
        apicalGroup.add(budR);

        leavesMesh.add(apicalGroup);

        // Darwin Treatment accessories
        if (s.plantTreatment === 'opaque_cap') {
          const capGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.42, 24);
          const capMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35, metalness: 0.5 });
          treatmentItem = new THREE.Mesh(capGeo, capMat);
          treatmentItem.position.copy(p4);
          treatmentItem.quaternion.copy(crownQuat);
          treatmentItem.position.y += 0.18;
          treatmentItem.castShadow = true;
          plantGroup.add(treatmentItem);
        } else if (s.plantTreatment === 'transparent_cap') {
          const capGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.42, 24);
          const capMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transmission: 0.95,
            opacity: 1,
            transparent: true,
            roughness: 0.04,
            ior: 1.5,
          });
          treatmentItem = new THREE.Mesh(capGeo, capMat);
          treatmentItem.position.copy(p4);
          treatmentItem.quaternion.copy(crownQuat);
          treatmentItem.position.y += 0.18;
          plantGroup.add(treatmentItem);
        } else if (s.plantTreatment === 'agar_block') {
          const agarGeo = new THREE.BoxGeometry(0.24, 0.12, 0.24);
          const agarMat = new THREE.MeshPhysicalMaterial({
            color: 0xfef08a,
            transmission: 0.82,
            opacity: 0.9,
            transparent: true,
            roughness: 0.1,
          });
          treatmentItem = new THREE.Mesh(agarGeo, agarMat);
          treatmentItem.position.copy(p4);
          treatmentItem.position.y -= 0.06;
          plantGroup.add(treatmentItem);
        } else if (s.plantTreatment === 'mica_insert') {
          const micaGeo = new THREE.BoxGeometry(0.25, 0.03, 0.14);
          const micaMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.1 });
          treatmentItem = new THREE.Mesh(micaGeo, micaMat);
          treatmentItem.position.copy(p4);
          treatmentItem.position.y -= 0.10;
          treatmentItem.position.x += angleRad > 0 ? -0.08 : 0.08;
          plantGroup.add(treatmentItem);
        }

        plantGroup.add(leavesMesh);
      } else {
        // Decapitated Cut Stem Surface
        const cutGeo = new THREE.CylinderGeometry(0.068, 0.068, 0.02, 24);
        const cutMat = new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.5 });
        treatmentItem = new THREE.Mesh(cutGeo, cutMat);
        treatmentItem.position.copy(p4);
        plantGroup.add(treatmentItem);
      }

      // 4. Cellular Elongation Zone & Auxin Visualizer (Khi bật X-Ray Mode)
      if (s.xrayMode) {
        cellsGroup = new THREE.Group();
        plantGroup.add(cellsGroup);

        const darkSideDir = angleRad >= 0 ? -1 : 1;
        const cellCount = 9;

        // Sample points along the elongation zone (u = 0.40 to 0.88)
        for (let c = 0; c < cellCount; c++) {
          const uCell = 0.42 + (c / (cellCount - 1)) * 0.44;
          const pt = curve.getPointAt(uCell);
          const tangent = curve.getTangentAt(uCell).normalize();
          const normal = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize();

          // Illuminated Side Cell: Short compact cell (nồng độ Auxin thấp)
          const lightCellGeo = new THREE.BoxGeometry(0.038, 0.068, 0.038);
          const lightCellMat = new THREE.MeshStandardMaterial({
            color: 0x34d399,
            roughness: 0.2,
            transparent: true,
            opacity: 0.85,
          });
          const lightCell = new THREE.Mesh(lightCellGeo, lightCellMat);
          const lightOffset = normal.clone().multiplyScalar(-darkSideDir * 0.065);
          lightCell.position.copy(pt).add(lightOffset);
          cellsGroup.add(lightCell);

          // Shaded Side Cell: Elongated cell (gấp đôi chiều dài do Auxin kích thích dãn dài!)
          const darkCellGeo = new THREE.BoxGeometry(0.038, 0.155, 0.038);
          const darkCellMat = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            emissive: 0xd97706,
            emissiveIntensity: 0.35,
            roughness: 0.2,
            transparent: true,
            opacity: 0.92,
          });
          const darkCell = new THREE.Mesh(darkCellGeo, darkCellMat);
          const darkOffset = normal.clone().multiplyScalar(darkSideDir * 0.065);
          darkCell.position.copy(pt).add(darkOffset);
          cellsGroup.add(darkCell);
        }
      }

      // Update Auxin particle positions along stem
      if (auxinParticles && s.xrayMode) {
        auxinParticles.visible = true;
        const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
        const darkSideDir = angleRad >= 0 ? -1 : 1;
        const isBendingPossible =
          s.plantTreatment === 'normal' ||
          s.plantTreatment === 'transparent_cap' ||
          s.plantTreatment === 'agar_block';

        for (let i = 0; i < particleCount; i++) {
          const t = particleTValues[i];
          const pointOnCurve = curve.getPoint(t);
          const auxinShift = isBendingPossible
            ? darkSideDir * (0.052 + Math.abs(angleRad) * 0.065)
            : 0;
          const jitterX = (Math.random() - 0.5) * 0.035;
          const jitterZ = (Math.random() - 0.5) * 0.045;

          posAttr.setXYZ(i, pointOnCurve.x + auxinShift + jitterX, pointOnCurve.y, pointOnCurve.z + jitterZ);
        }
        posAttr.needsUpdate = true;
      } else if (auxinParticles) {
        auxinParticles.visible = false;
      }
    }

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isActiveRef.current) return;

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
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            (mesh.material as THREE.Material[]).forEach((m) => m.dispose());
          } else {
            (mesh.material as THREE.Material)?.dispose();
          }
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
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

      {/* Action Buttons Top Right: Darkroom + X-Ray + Anatomy + Inquiry + Lamp Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20 flex-wrap justify-end">
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

        {/* X-Ray Cellular & Auxin Toggle */}
        <button
          onClick={() => onUpdateState?.((prev) => ({ ...prev, xrayMode: !prev.xrayMode }))}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-md backdrop-blur-md transition-all cursor-pointer ${
            state.xrayMode
              ? 'bg-amber-500 text-slate-950 font-extrabold ring-2 ring-amber-400'
              : 'bg-slate-900/90 text-amber-300 border border-slate-700 hover:bg-slate-800'
          }`}
          title="Quan sát trực tiếp vi tế bào dãn dài và dòng di chuyển hormone Auxin"
        >
          <span>🧬</span>
          <span>{state.xrayMode ? 'Tế bào & Auxin (Bật)' : 'Soi Tế Bào'}</span>
        </button>

        {/* Botanical Anatomy Callouts Toggle */}
        <button
          onClick={() => setShowAnatomy((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-md backdrop-blur-md transition-all cursor-pointer ${
            showAnatomy
              ? 'bg-emerald-500 text-slate-950 font-extrabold ring-2 ring-emerald-400'
              : 'bg-slate-900/90 text-emerald-300 border border-slate-700 hover:bg-slate-800'
          }`}
          title="Hiển thị nhãn chú thích các bộ phận thực vật học của cây mầm"
        >
          <span>🏷️</span>
          <span>{showAnatomy ? 'Chú thích (Bật)' : 'Chú Thích'}</span>
        </button>

        {/* Guided Inquiry Prompt Button */}
        {onOpenInquiry && (
          <button
            onClick={onOpenInquiry}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-md backdrop-blur-md transition-all cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400/30"
          >
            <span>🔬</span>
            <span>Nghiên cứu</span>
          </button>
        )}

        {/* Direct Interactive Lamp Click Button */}
        <button
          onClick={() => setIsLampControlOpen((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-md backdrop-blur-md transition-all cursor-pointer ${
            isLampControlOpen
              ? 'bg-amber-500 text-slate-950 font-extrabold ring-2 ring-amber-400'
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

      {/* LIVE CELLULAR & AUXIN INSPECTOR (Khi bật X-Ray Mode) */}
      {state.xrayMode && (
        <div className="absolute top-16 left-4 bg-slate-950/92 border border-amber-500/60 backdrop-blur-xl p-3.5 rounded-2xl text-xs text-amber-200 shadow-2xl max-w-[320px] space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
            <div className="font-bold flex items-center gap-2 text-amber-400 text-xs">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              Kính Soi Tế Bào & Nồng Độ Auxin
            </div>
            <span className="text-[10px] font-mono text-amber-300/80 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
              Vùng dãn dài
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {/* Illuminated Side */}
            <div className="bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/30 space-y-1">
              <div className="font-bold text-emerald-400 flex items-center gap-1">
                <span>⚪</span> Phía Sáng
              </div>
              <p className="text-[10px] text-slate-300">Auxin: <strong className="text-emerald-300">~25%</strong></p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-[25%]" />
              </div>
              <p className="text-[10px] text-slate-400">Chiều dài: <strong>26 µm</strong> (1.0x)</p>
            </div>

            {/* Shaded Side */}
            <div className="bg-amber-950/40 p-2 rounded-xl border border-amber-500/40 space-y-1">
              <div className="font-bold text-amber-400 flex items-center gap-1">
                <span>🟡</span> Phía Tối (Khuất)
              </div>
              <p className="text-[10px] text-slate-300">Auxin: <strong className="text-amber-300">~75%</strong></p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full w-[75%]" />
              </div>
              <p className="text-[10px] text-amber-200 font-semibold">Chiều dài: <strong>58 µm</strong> (2.2x)</p>
            </div>
          </div>

          <div className="pt-1 text-[10px] leading-tight text-amber-100/80 bg-amber-900/20 p-2 rounded-lg border border-amber-700/30">
            💡 <strong>Cơ chế sinh học:</strong> Auxin kích hoạt bơm proton và enzym expansin làm giãn lỏng sợi xenlulozo ở thành tế bào phía tối, khiến tế bào dãn dài gấp đôi và đẩy thân cây uốn cong về phía nguồn sáng.
          </div>
        </div>
      )}

      {/* BOTANICAL ANATOMY CALLOUTS (Khi bật Chú Thích) */}
      {showAnatomy && (
        <div className="absolute bottom-12 left-4 bg-slate-950/90 border border-emerald-500/50 backdrop-blur-xl p-3.5 rounded-2xl text-xs text-slate-200 shadow-2xl max-w-[340px] space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span>🌱</span> Giải Phẫu Cây Mầm Song Tử Diệp
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
              <span className="text-emerald-400 font-bold">1. Chồi đỉnh:</span>
              <span className="text-slate-300">Thụ cảm ánh sáng xanh (Phototropin) & tổng hợp hormone Auxin (IAA).</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold">2. Đôi lá thật:</span>
              <span className="text-slate-300">Phiến lá mỏng xòe rộng với hệ gân lá phân nhánh, tự điều chỉnh góc đón photon.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-amber-400 font-bold">3. Hai lá mầm:</span>
              <span className="text-slate-300">Lá mầm mọng thịt ở đốt lá, dự trữ tinh bột & protein nuôi phôi mầm.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-sky-400 font-bold">4. Vùng dãn dài:</span>
              <span className="text-slate-300">Nơi tế bào dãn dài bất đối xứng để uốn cong thân cây hướng sáng.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-stone-400 font-bold">5. Cổ rễ & Đất mùn:</span>
              <span className="text-slate-300">Gốc thân bám chặt vào đất mùn ẩm, nâng đỡ toàn bộ thân mầm.</span>
            </div>
          </div>
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
