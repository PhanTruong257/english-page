'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PhototropismState } from '../types';

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
    scene.background = new THREE.Color(0x090d16);
    scene.fog = new THREE.FogExp2(0x090d16, 0.035);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 4.5, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 18;
    controls.target.set(0, 2.2, 0);

    // 2. Ambient & Environment Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const labFillLight = new THREE.DirectionalLight(0xa5c5f8, 0.5);
    labFillLight.position.set(5, 10, 5);
    scene.add(labFillLight);

    // 3. Grid & Lab Table Platform
    const tableGeo = new THREE.CylinderGeometry(5.5, 5.8, 0.4, 48);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x1a2233,
      roughness: 0.3,
      metalness: 0.6,
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = -0.2;
    table.receiveShadow = true;
    scene.add(table);

    const grid = new THREE.GridHelper(9, 18, 0x10b981, 0x1e293b);
    grid.position.y = 0.01;
    scene.add(grid);

    // 4. Plant Pot (Hollow realistic pot with no coplanar Z-fighting)
    const potGroup = new THREE.Group();
    // openEnded: true ensures the pot is hollow and has NO solid clay lid
    const potGeo = new THREE.CylinderGeometry(0.92, 0.66, 1.3, 36, 1, true);
    const potMat = new THREE.MeshStandardMaterial({
      color: 0xc27142,
      roughness: 0.7,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.y = 0.65;
    pot.castShadow = true;
    pot.receiveShadow = true;
    potGroup.add(pot);

    // Pot bottom plate
    const potBottomGeo = new THREE.CircleGeometry(0.66, 36);
    potBottomGeo.rotateX(Math.PI / 2);
    const potBottom = new THREE.Mesh(potBottomGeo, potMat);
    potBottom.position.y = 0.01;
    potGroup.add(potBottom);

    // Pot Rim
    const rimGeo = new THREE.TorusGeometry(0.93, 0.06, 16, 36);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xad5d32, roughness: 0.6 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 1.3;
    potGroup.add(rim);

    // Soil inside pot (recessed inside hollow pot, absolutely no Z-fighting)
    const soilGeo = new THREE.CylinderGeometry(0.88, 0.72, 0.4, 36);
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x1f140e, roughness: 0.95 });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.y = 1.05; // Top surface at y = 1.25, cleanly below rim at 1.30
    soil.receiveShadow = true;
    potGroup.add(soil);

    scene.add(potGroup);

    // 5. Dynamic Plant Stem Group
    const plantGroup = new THREE.Group();
    plantGroup.position.set(0, 1.25, 0);
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
      particleTValues[i] = 0.2 + Math.random() * 0.75;
      particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 0.1;
      particlePositions[i * 3 + 1] = particleTValues[i] * 2.8;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfacc15,
      size: 0.08,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    auxinParticles = new THREE.Points(particleGeo, particleMat);
    auxinParticles.visible = false;
    plantGroup.add(auxinParticles);

    // 6. Interactive Lamp Group
    const lampGroup = new THREE.Group();
    scene.add(lampGroup);

    // Lamp Stand & Hood
    const lampBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.8, 0.15, 32),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 })
    );
    lampBase.castShadow = true;
    lampGroup.add(lampBase);

    const lampPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 3.2, 16),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 })
    );
    lampPole.position.y = 1.6;
    lampPole.castShadow = true;
    lampGroup.add(lampPole);

    const lampArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 1.2, 16),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 })
    );
    lampArm.rotation.z = Math.PI / 4;
    lampArm.position.set(-0.4, 3.4, 0);
    lampGroup.add(lampArm);

    // Lamp Shade
    const shadeGeo = new THREE.ConeGeometry(0.6, 0.9, 32, 1, true);
    const shadeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.7,
      roughness: 0.3,
      side: THREE.DoubleSide,
    });
    const lampShade = new THREE.Mesh(shadeGeo, shadeMat);
    lampShade.position.set(-0.8, 3.7, 0);
    lampGroup.add(lampShade);

    // Bulb
    const bulbGeo = new THREE.SphereGeometry(0.2, 24, 24);
    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 1.5,
    });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.copy(lampShade.position);
    lampGroup.add(bulb);

    // SpotLight emitting from bulb
    const spotLight = new THREE.SpotLight(0xffffff, 4, 15, Math.PI / 4, 0.35, 1);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 0.5;
    spotLight.shadow.camera.far = 15;
    spotLight.position.copy(lampShade.position);
    scene.add(spotLight);

    // Light beam visual cone
    const beamGeo = new THREE.ConeGeometry(2.2, 4.2, 32, 1, true);
    beamGeo.translate(0, -2.1, 0);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    lampGroup.add(beamMesh);

    // 7. Protractor Angle Gauge
    const protractorGroup = new THREE.Group();
    protractorGroup.position.set(0, 1.3, 0);
    const arcCurve = new THREE.EllipseCurve(0, 0, 1.8, 1.8, -Math.PI / 2, Math.PI / 2, false, 0);
    const arcPoints = arcCurve.getPoints(50);
    const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const arcMat = new THREE.LineDashedMaterial({
      color: 0x38bdf8,
      dashSize: 0.1,
      gapSize: 0.05,
      opacity: 0.5,
      transparent: true,
    });
    const arcLine = new THREE.Line(arcGeo, arcMat);
    arcLine.computeLineDistances();
    protractorGroup.add(arcLine);
    scene.add(protractorGroup);

    // Function to rebuild plant mesh depending on bent angle and treatment
    function updatePlantGeometry(angleRad: number, s: PhototropismState) {
      if (stemMesh) plantGroup.remove(stemMesh);
      if (leavesMesh) plantGroup.remove(leavesMesh);
      if (treatmentItem) plantGroup.remove(treatmentItem);

      const height = 2.8;
      const isDecapitated = s.plantTreatment === 'decapitated';
      const actualHeight = isDecapitated ? height * 0.75 : height;

      // Calculate Bezier curve for stem bending
      // Tip offset according to angle
      const tipOffsetX = Math.sin(angleRad) * (actualHeight * 0.55);
      const tipOffsetY = Math.cos(angleRad) * actualHeight;

      const p0 = new THREE.Vector3(0, 0, 0);
      const p1 = new THREE.Vector3(0, actualHeight * 0.35, 0);
      const p2 = new THREE.Vector3(tipOffsetX * 0.6, actualHeight * 0.7, 0);
      const p3 = new THREE.Vector3(tipOffsetX, tipOffsetY, 0);

      const curve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);

      // Tube geometry
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.1, 16, false);
      const stemColor = s.xrayMode ? 0x22d3ee : 0x22c55e;
      const stemMat = new THREE.MeshStandardMaterial({
        color: stemColor,
        roughness: s.xrayMode ? 0.2 : 0.6,
        metalness: 0.1,
        transparent: s.xrayMode,
        opacity: s.xrayMode ? 0.38 : 1.0,
      });

      stemMesh = new THREE.Mesh(tubeGeo, stemMat);
      stemMesh.castShadow = true;
      stemMesh.receiveShadow = true;
      plantGroup.add(stemMesh);

      // Leaves and Tip (if not decapitated)
      if (!isDecapitated) {
        leavesMesh = new THREE.Group();
        leavesMesh.position.copy(p3);
        leavesMesh.rotation.z = -angleRad;

        // Two cotyledon leaves
        const leafGeo = new THREE.SphereGeometry(0.35, 16, 16);
        leafGeo.scale(1.8, 0.15, 0.8);
        const leafMat = new THREE.MeshStandardMaterial({
          color: s.xrayMode ? 0x06b6d4 : 0x16a34a,
          roughness: 0.5,
          transparent: s.xrayMode,
          opacity: s.xrayMode ? 0.45 : 1.0,
        });

        const leafLeft = new THREE.Mesh(leafGeo, leafMat);
        leafLeft.position.set(-0.4, 0.05, 0);
        leafLeft.rotation.z = Math.PI / 8;
        leavesMesh.add(leafLeft);

        const leafRight = new THREE.Mesh(leafGeo, leafMat);
        leafRight.position.set(0.4, 0.05, 0);
        leafRight.rotation.z = -Math.PI / 8;
        leavesMesh.add(leafRight);

        // Terminal bud
        const budGeo = new THREE.ConeGeometry(0.12, 0.3, 16);
        budGeo.translate(0, 0.15, 0);
        const budMat = new THREE.MeshStandardMaterial({ color: 0x86efac });
        const bud = new THREE.Mesh(budGeo, budMat);
        leavesMesh.add(bud);

        // Treatment items
        if (s.plantTreatment === 'opaque_cap') {
          const capGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.45, 16);
          const capMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
          treatmentItem = new THREE.Mesh(capGeo, capMat);
          treatmentItem.position.copy(p3);
          treatmentItem.rotation.z = -angleRad;
          treatmentItem.position.y += 0.2;
          plantGroup.add(treatmentItem);
        } else if (s.plantTreatment === 'transparent_cap') {
          const capGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.45, 16);
          const capMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transmission: 0.9,
            opacity: 1,
            transparent: true,
            roughness: 0.1,
            ior: 1.5,
          });
          treatmentItem = new THREE.Mesh(capGeo, capMat);
          treatmentItem.position.copy(p3);
          treatmentItem.rotation.z = -angleRad;
          treatmentItem.position.y += 0.2;
          plantGroup.add(treatmentItem);
        } else if (s.plantTreatment === 'agar_block') {
          const agarGeo = new THREE.BoxGeometry(0.25, 0.15, 0.25);
          const agarMat = new THREE.MeshStandardMaterial({
            color: 0xfef08a,
            transparent: true,
            opacity: 0.7,
            roughness: 0.3,
          });
          treatmentItem = new THREE.Mesh(agarGeo, agarMat);
          treatmentItem.position.copy(p3);
          treatmentItem.position.y -= 0.1;
          plantGroup.add(treatmentItem);
        } else if (s.plantTreatment === 'mica_insert') {
          const micaGeo = new THREE.BoxGeometry(0.28, 0.04, 0.15);
          const micaMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
          treatmentItem = new THREE.Mesh(micaGeo, micaMat);
          treatmentItem.position.copy(p3);
          treatmentItem.position.y -= 0.15;
          // inserted on the dark side or light side
          treatmentItem.position.x += angleRad > 0 ? -0.1 : 0.1;
          plantGroup.add(treatmentItem);
        }

        plantGroup.add(leavesMesh);
      }

      // Update Auxin particle positions along stem
      if (auxinParticles && s.xrayMode) {
        auxinParticles.visible = true;
        const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
        // Direction opposite to lamp angle (dark side)
        const darkSideDir = angleRad > 0 ? -1 : 1;
        const isBendingPossible =
          s.plantTreatment === 'normal' ||
          s.plantTreatment === 'transparent_cap' ||
          s.plantTreatment === 'agar_block';

        for (let i = 0; i < particleCount; i++) {
          const t = particleTValues[i];
          const pointOnCurve = curve.getPoint(t);
          // If bending possible, auxin aggregates on shaded side
          const auxinShift = isBendingPossible
            ? darkSideDir * (0.05 + Math.abs(angleRad) * 0.06)
            : 0;
          const jitterX = (Math.random() - 0.5) * 0.04;
          const jitterZ = (Math.random() - 0.5) * 0.06;

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

      // Determine Target Bending Angle based on light angle & treatment
      // Biological reality:
      // - Normal / Transparent cap: Bends towards light
      // - Decapitated: 0 bend
      // - Opaque cap: 0 bend
      // - Agar block: partial bend (auxin diffuses through agar)
      // - Mica insert: if mica on shaded side, blocks auxin -> no bend!
      let targetAngleDeg = 0;

      if (s.lightColor !== 'off' && s.lightIntensity > 5) {
        const lightEffectiveness =
          s.lightColor === 'blue' ? 1.25 : s.lightColor === 'white' ? 1.0 : 0.25; // Phototropin responds maximally to blue light!
        const maxBend = (s.lightAngle * (s.lightIntensity / 100)) * lightEffectiveness;

        if (s.plantTreatment === 'normal') {
          targetAngleDeg = maxBend;
        } else if (s.plantTreatment === 'transparent_cap') {
          targetAngleDeg = maxBend * 0.95;
        } else if (s.plantTreatment === 'agar_block') {
          targetAngleDeg = maxBend * 0.7; // delayed diffusion
        } else if (s.plantTreatment === 'opaque_cap' || s.plantTreatment === 'decapitated') {
          targetAngleDeg = 0;
        } else if (s.plantTreatment === 'mica_insert') {
          // Mica blocks transport on one side
          targetAngleDeg = maxBend * 0.2;
        }
      }

      // Smooth interpolation for biological growth response
      const targetAngleRad = (targetAngleDeg * Math.PI) / 180;
      const growthSpeed = playing ? 1.8 * s.timeMultiplier * delta : 0.5 * delta;
      currentBentAngleRef.current += (targetAngleRad - currentBentAngleRef.current) * Math.min(growthSpeed, 0.2);

      // Notify parent component of current actual angle
      if (onAngleUpdate) {
        const curDeg = (currentBentAngleRef.current * 180) / Math.PI;
        onAngleUpdate(Math.round(curDeg * 10) / 10);
      }

      // Update Lamp 3D Position according to state
      const lampDist = 4.2;
      const lampAngleRad = (s.lightAngle * Math.PI) / 180;
      const lampX = Math.sin(lampAngleRad) * lampDist;
      const lampY = 3.6 - Math.abs(Math.sin(lampAngleRad)) * 0.5;
      const lampZ = Math.cos(lampAngleRad) * 0.8;

      lampGroup.position.set(lampX, 0, lampZ);
      lampGroup.rotation.y = -lampAngleRad;

      // Lamp target pointing directly at plant tip
      const plantTipPos = new THREE.Vector3(0, 2.5, 0);
      spotLight.position.set(lampX, lampY, lampZ);
      spotLight.target.position.copy(plantTipPos);
      spotLight.target.updateMatrixWorld();

      // Beam mesh orientation
      beamMesh.position.set(0, lampY - 0.2, 0);
      beamMesh.lookAt(plantTipPos);
      beamMesh.rotateX(-Math.PI / 2);

      // Light Color & Intensity updates
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
      beamMat.opacity = (s.lightIntensity / 100) * 0.12 * (s.lightColor === 'off' ? 0 : 1);

      // Rebuild plant spline
      updatePlantGeometry(currentBentAngleRef.current, s);

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
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
    <div className="relative w-full h-full min-h-[460px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D HUD Badges */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/80 text-xs font-semibold text-emerald-400 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          Mô hình 3D Sinh lý Cây Mầm
        </div>
        <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300">
          Góc đèn: <strong className="text-amber-400">{state.lightAngle}°</strong> | Cường độ: <strong className="text-sky-400">{state.lightIntensity}%</strong>
        </div>
      </div>

      {state.xrayMode && (
        <div className="absolute top-4 right-4 bg-yellow-950/80 border border-yellow-500/50 backdrop-blur-md px-3 py-2 rounded-xl text-xs text-yellow-300 shadow-xl max-w-[260px]">
          <div className="font-bold flex items-center gap-1.5 mb-1 text-yellow-400">
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
            Chế độ X-Ray: Phân bố Auxin
          </div>
          <p className="text-[11px] leading-relaxed text-yellow-200/90">
            Hạt màu vàng thể hiện hormone Auxin dồn về phía bị che sáng, làm tế bào phía tối dài ra nhanh hơn khiến thân cây cong về phía nguồn sáng.
          </p>
        </div>
      )}

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/75 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-700/50 text-[11px] text-slate-400 pointer-events-none">
        🖱️ Giữ chuột trái để xoay 360° • Lăn chuột để phóng to/thu nhỏ
      </div>
    </div>
  );
}
