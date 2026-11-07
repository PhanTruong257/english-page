'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PhototropismState } from '../types';
import { setupLabEnvironment } from './LabEnvironment';

interface Props {
  state: PhototropismState;
  onAngleUpdate?: (angle: number) => void;
  isPlaying: boolean;
}

export default function PhototropismScene({ state, onAngleUpdate, isPlaying }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Track smoothly interpolated bent angle
  const currentBentAngleRef = useRef(0);

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
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.02;
    controls.minDistance = 3;
    controls.maxDistance = 16;
    controls.target.set(0, 1.8, 0);

    // 2. Setup Realistic Bright Laboratory Environment
    setupLabEnvironment(scene);

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
      color: 0x221711,
      roughness: 0.96,
      metalness: 0.02,
    });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.y = 1.15; // Surface at y = 1.37, naturally recessed inside pot
    soil.receiveShadow = true;
    potGroup.add(soil);

    // Plant Stem Group
    const plantGroup = new THREE.Group();
    plantGroup.position.set(0, 1.36, 0);
    scene.add(plantGroup);

    let stemMesh: THREE.Mesh | null = null;
    let leavesMesh: THREE.Group | null = null;
    let treatmentItem: THREE.Mesh | null = null;
    let auxinParticles: THREE.Points | null = null;

    // Auxin particle geometry setup
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleTValues = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      particleTValues[i] = 0.15 + Math.random() * 0.8;
      particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 0.1;
      particlePositions[i * 3 + 1] = particleTValues[i] * 2.8;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfacc15,
      size: 0.09,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    auxinParticles = new THREE.Points(particleGeo, particleMat);
    auxinParticles.visible = false;
    plantGroup.add(auxinParticles);

    // 4. Articulated Laboratory Bench Lamp (Đèn bàn thí nghiệm kim loại sang trọng)
    const lampGroup = new THREE.Group();
    scene.add(lampGroup);

    // Heavy Circular Steel Base
    const lampBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.72, 0.78, 0.12, 36),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 })
    );
    lampBase.castShadow = true;
    lampBase.receiveShadow = true;
    lampGroup.add(lampBase);

    // Base joint knob
    const baseJoint = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 })
    );
    baseJoint.position.y = 0.14;
    lampGroup.add(baseJoint);

    // Lower Arm (Dual chrome rods)
    const lowerArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 1.8, 16),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 })
    );
    lowerArm.position.set(-0.25, 0.98, 0);
    lowerArm.rotation.z = Math.PI / 10;
    lowerArm.castShadow = true;
    lampGroup.add(lowerArm);

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
    lampGroup.add(upperArm);

    // Lamp Shade (Bell hood in sleek glossy turquoise / ocean blue)
    const shadeGeo = new THREE.ConeGeometry(0.62, 0.9, 36, 1, true);
    const shadeMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      metalness: 0.6,
      roughness: 0.25,
      side: THREE.DoubleSide,
    });
    const lampShade = new THREE.Mesh(shadeGeo, shadeMat);
    lampShade.position.set(0.1, 3.25, 0);
    lampShade.castShadow = true;
    lampGroup.add(lampShade);

    // Inner Reflector of shade
    const reflectorGeo = new THREE.ConeGeometry(0.6, 0.86, 36, 1, true);
    const reflectorMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.9,
      roughness: 0.1,
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
      emissiveIntensity: 1.6,
    });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.copy(lampShade.position);
    lampGroup.add(bulb);

    // SpotLight emitting from bulb
    const spotLight = new THREE.SpotLight(0xffffff, 5, 14, Math.PI / 3.8, 0.35, 1);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 0.5;
    spotLight.shadow.camera.far = 14;
    spotLight.position.copy(lampShade.position);
    scene.add(spotLight);

    // Visual soft light cone mesh
    const beamGeo = new THREE.ConeGeometry(2.4, 4.4, 36, 1, true);
    beamGeo.translate(0, -2.2, 0);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    lampGroup.add(beamMesh);

    // 5. Scientific Protractor Arc Gauge in 3D
    const protractorGroup = new THREE.Group();
    protractorGroup.position.set(0, 1.4, 0);
    const arcCurve = new THREE.EllipseCurve(0, 0, 1.85, 1.85, -Math.PI / 2.2, Math.PI / 2.2, false, 0);
    const arcPoints = arcCurve.getPoints(50);
    const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const arcMat = new THREE.LineDashedMaterial({
      color: 0x0284c7,
      dashSize: 0.1,
      gapSize: 0.05,
      opacity: 0.65,
      transparent: true,
    });
    const arcLine = new THREE.Line(arcGeo, arcMat);
    arcLine.computeLineDistances();
    protractorGroup.add(arcLine);
    scene.add(protractorGroup);

    // Rebuild Plant Stem & Leaf Geometry with realistic organic form
    function updatePlantGeometry(angleRad: number, s: PhototropismState) {
      if (stemMesh) plantGroup.remove(stemMesh);
      if (leavesMesh) plantGroup.remove(leavesMesh);
      if (treatmentItem) plantGroup.remove(treatmentItem);

      const height = 2.65;
      const isDecapitated = s.plantTreatment === 'decapitated';
      const actualHeight = isDecapitated ? height * 0.72 : height;

      // Spline curve for stem bending
      const tipOffsetX = Math.sin(angleRad) * (actualHeight * 0.55);
      const tipOffsetY = Math.cos(angleRad) * actualHeight;

      const p0 = new THREE.Vector3(0, 0, 0);
      const p1 = new THREE.Vector3(0, actualHeight * 0.35, 0);
      const p2 = new THREE.Vector3(tipOffsetX * 0.62, actualHeight * 0.7, 0);
      const p3 = new THREE.Vector3(tipOffsetX, tipOffsetY, 0);

      const curve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);

      // Realistic tapered stem geometry
      const tubeGeo = new THREE.TubeGeometry(curve, 36, 0.09, 16, false);
      const stemColor = s.xrayMode ? 0x06b6d4 : 0x22c55e;
      const stemMat = new THREE.MeshStandardMaterial({
        color: stemColor,
        roughness: s.xrayMode ? 0.2 : 0.45,
        metalness: 0.05,
        transparent: s.xrayMode,
        opacity: s.xrayMode ? 0.38 : 1.0,
      });

      stemMesh = new THREE.Mesh(tubeGeo, stemMat);
      stemMesh.castShadow = true;
      stemMesh.receiveShadow = true;
      plantGroup.add(stemMesh);

      // Leaves and Terminal Bud
      if (!isDecapitated) {
        leavesMesh = new THREE.Group();
        leavesMesh.position.copy(p3);
        leavesMesh.rotation.z = -angleRad;

        // Realistic leaf geometry (cotyledon leaves with central vein line)
        const leafShape = new THREE.Shape();
        leafShape.moveTo(0, 0);
        leafShape.bezierCurveTo(0.2, 0.15, 0.4, 0.25, 0.65, 0.05);
        leafShape.bezierCurveTo(0.4, -0.2, 0.15, -0.15, 0, 0);

        const extrudeSettings = { depth: 0.02, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.015, bevelThickness: 0.015 };
        const leafGeo = new THREE.ExtrudeGeometry(leafShape, extrudeSettings);

        const leafMat = new THREE.MeshStandardMaterial({
          color: s.xrayMode ? 0x0891b2 : 0x16a34a,
          roughness: 0.4,
          metalness: 0.05,
          transparent: s.xrayMode,
          opacity: s.xrayMode ? 0.45 : 1.0,
        });

        // Left leaf
        const leafLeft = new THREE.Mesh(leafGeo, leafMat);
        leafLeft.position.set(-0.02, 0, 0);
        leafLeft.rotation.z = Math.PI / 5;
        leafLeft.scale.set(1.1, 1.1, 1.1);
        leafLeft.castShadow = true;
        leavesMesh.add(leafLeft);

        // Right leaf
        const leafRight = new THREE.Mesh(leafGeo, leafMat);
        leafRight.position.set(0.02, 0, 0);
        leafRight.rotation.z = Math.PI - Math.PI / 5;
        leafRight.rotation.x = Math.PI;
        leafRight.scale.set(1.1, 1.1, 1.1);
        leafRight.castShadow = true;
        leavesMesh.add(leafRight);

        // Terminal bud at the apex
        const budGeo = new THREE.ConeGeometry(0.09, 0.25, 16);
        budGeo.translate(0, 0.12, 0);
        const budMat = new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.5 });
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
          const agarMat = new THREE.MeshStandardMaterial({
            color: 0xfef08a,
            transparent: true,
            opacity: 0.75,
            roughness: 0.25,
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

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const s = stateRef.current;
      const playing = isPlayingRef.current;

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
      let colorHex = 0xffffff;
      let bulbIntensity = s.lightIntensity / 25;
      if (s.lightColor === 'off') {
        colorHex = 0x222222;
        bulbIntensity = 0;
      } else if (s.lightColor === 'blue') {
        colorHex = 0x38bdf8;
      } else if (s.lightColor === 'red') {
        colorHex = 0xef4444;
      }

      spotLight.color.setHex(colorHex);
      spotLight.intensity = (s.lightIntensity / 100) * 8 * (s.lightColor === 'off' ? 0 : 1);
      (bulb.material as THREE.MeshStandardMaterial).emissive.setHex(colorHex);
      (bulb.material as THREE.MeshStandardMaterial).emissiveIntensity = bulbIntensity;
      beamMat.color.setHex(colorHex);
      beamMat.opacity = (s.lightIntensity / 100) * 0.08 * (s.lightColor === 'off' ? 0 : 1);

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
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-300 shadow-xl">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D HUD Badges (Clean Modern Lab Aesthetic) */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-emerald-700 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          Phòng Thí Nghiệm Sinh Học • Mô Hình Hướng Sáng
        </div>
        <div className="bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] text-slate-700 shadow-sm">
          Góc đèn: <strong className="text-amber-600">{state.lightAngle}°</strong> | Cường độ: <strong className="text-sky-600">{state.lightIntensity}%</strong>
        </div>
      </div>

      {state.xrayMode && (
        <div className="absolute top-4 right-4 bg-amber-50/95 border border-amber-300 backdrop-blur-md px-3.5 py-2.5 rounded-2xl text-xs text-amber-900 shadow-lg max-w-[270px]">
          <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-700">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            Chế độ X-Ray: Phân bố Auxin
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800">
            Hạt màu vàng thể hiện hormone Auxin dồn về phía bị che sáng, kích hoạt kéo dài tế bào phía tối khiến thân cây cong về phía nguồn sáng.
          </p>
        </div>
      )}

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-300 text-[11px] text-slate-600 pointer-events-none shadow-sm">
        🖱️ Giữ chuột trái để xoay 360° • Lăn chuột để phóng to/thu nhỏ
      </div>
    </div>
  );
}
