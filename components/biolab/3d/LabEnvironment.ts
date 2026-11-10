import * as THREE from 'three';

/**
 * Creates a realistic biology laboratory environment.
 * Supports both bright daylit lab mode and high-contrast darkroom mode
 * (buồng tối thí nghiệm quang hướng động) where directional light stands out dramatically.
 */
export function setupLabEnvironment(scene: THREE.Scene, options?: { isDarkroom?: boolean }) {
  const isDarkroom = !!options?.isDarkroom;

  // 1. Room Background & Fog
  const dayBg = new THREE.Color(0xf1f5f9);
  const darkBg = new THREE.Color(0x0a0f1d);

  scene.background = (isDarkroom ? darkBg : dayBg).clone();
  scene.fog = new THREE.FogExp2(isDarkroom ? 0x0a0f1d : 0xf1f5f9, isDarkroom ? 0.035 : 0.02);

  // 2. High-Grade Studio & Lab Lighting
  const ambientLight = new THREE.AmbientLight(
    isDarkroom ? 0x38bdf8 : 0xffffff,
    isDarkroom ? 0.22 : 0.9
  );
  scene.add(ambientLight);

  // Soft sky/ground bounce light
  const hemiLight = new THREE.HemisphereLight(
    isDarkroom ? 0x1e293b : 0xe2e8f0,
    isDarkroom ? 0x0f172a : 0xf8fafc,
    isDarkroom ? 0.18 : 0.65
  );
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  // Main daylight window light (drastically dimmed in darkroom)
  const sunLight = new THREE.DirectionalLight(0xfffbeb, isDarkroom ? 0.08 : 1.4);
  sunLight.position.set(6, 12, 8);
  sunLight.castShadow = !isDarkroom;
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 30;
  sunLight.shadow.camera.left = -6;
  sunLight.shadow.camera.right = 6;
  sunLight.shadow.camera.top = 6;
  sunLight.shadow.camera.bottom = -6;
  sunLight.shadow.bias = -0.0005;
  scene.add(sunLight);

  // Fill light
  const fillLight = new THREE.DirectionalLight(0xe0f2fe, isDarkroom ? 0.06 : 0.7);
  fillLight.position.set(-8, 8, 4);
  scene.add(fillLight);

  // Ceiling soft overhead lab tube lights
  const ceilingLight = new THREE.PointLight(0xffffff, isDarkroom ? 0.12 : 0.8, 15);
  ceilingLight.position.set(0, 7, 1);
  scene.add(ceilingLight);

  // Subtle darkroom blue accent rim light to define silhouettes of background equipment
  const rimLight = new THREE.DirectionalLight(0x0284c7, isDarkroom ? 0.35 : 0.0);
  rimLight.position.set(-6, 8, -4);
  scene.add(rimLight);

  // 3. Lab Room Architecture (Walls, Floor, Baseboard)
  const roomGroup = new THREE.Group();
  scene.add(roomGroup);

  // Back Wall with subtle clean lab tile pattern
  const wallCanvas = document.createElement('canvas');
  wallCanvas.width = 512;
  wallCanvas.height = 512;
  const ctx = wallCanvas.getContext('2d')!;
  ctx.fillStyle = isDarkroom ? '#0f172a' : '#f8fafc';
  ctx.fillRect(0, 0, 512, 512);

  // Draw light subtle tile lines
  ctx.strokeStyle = isDarkroom ? '#1e293b' : '#e2e8f0';
  ctx.lineWidth = 2;
  const tileSize = 64;
  for (let x = 0; x <= 512; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  const wallTexture = new THREE.CanvasTexture(wallCanvas);
  wallTexture.wrapS = THREE.RepeatWrapping;
  wallTexture.wrapT = THREE.RepeatWrapping;
  wallTexture.repeat.set(4, 3);

  const backWallGeo = new THREE.PlaneGeometry(24, 14);
  const backWallMat = new THREE.MeshStandardMaterial({
    map: wallTexture,
    roughness: 0.85,
    metalness: 0.05,
  });
  const backWall = new THREE.Mesh(backWallGeo, backWallMat);
  backWall.position.set(0, 5.5, -4.5);
  roomGroup.add(backWall);

  // Floor (Clean lab vinyl / epoxy floor)
  const floorGeo = new THREE.PlaneGeometry(24, 18);
  const floorMat = new THREE.MeshStandardMaterial({
    color: isDarkroom ? 0x1e293b : 0x94a3b8,
    roughness: 0.45,
    metalness: 0.1,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.5;
  floor.receiveShadow = true;
  roomGroup.add(floor);

  // Baseboard trim at bottom of wall
  const baseboardGeo = new THREE.BoxGeometry(24, 0.3, 0.1);
  const baseboardMat = new THREE.MeshStandardMaterial({ color: isDarkroom ? 0x0f172a : 0x475569, roughness: 0.5 });
  const baseboard = new THREE.Mesh(baseboardGeo, baseboardMat);
  baseboard.position.set(0, -1.35, -4.45);
  roomGroup.add(baseboard);

  // Biology Scientific Poster on back wall
  const posterCanvas = document.createElement('canvas');
  posterCanvas.width = 512;
  posterCanvas.height = 340;
  const pCtx = posterCanvas.getContext('2d')!;
  pCtx.fillStyle = isDarkroom ? '#1e293b' : '#ffffff';
  pCtx.fillRect(0, 0, 512, 340);
  pCtx.fillStyle = '#059669';
  pCtx.fillRect(0, 0, 512, 48);
  pCtx.fillStyle = '#ffffff';
  pCtx.font = 'bold 22px sans-serif';
  pCtx.fillText('MOON. BIOLAB 3D • PLANT PHYSIOLOGY', 20, 32);

  // Simple botanical illustration on poster
  pCtx.fillStyle = isDarkroom ? '#0f172a' : '#f0fdf4';
  pCtx.fillRect(16, 64, 480, 260);
  pCtx.fillStyle = '#10b981';
  pCtx.font = 'bold 15px sans-serif';
  pCtx.fillText('PHOTOSYNTHESIS & TROPISM MECHANISMS', 32, 95);
  pCtx.fillStyle = isDarkroom ? '#94a3b8' : '#64748b';
  pCtx.font = '12px sans-serif';
  pCtx.fillText('6CO2 + 12H2O + Light  →  C6H12O6 + 6O2 + 6H2O', 32, 125);
  pCtx.fillText('Auxin Asymmetric Redistribution (PIN Transporters)', 32, 150);
  pCtx.fillText('Positive Hydrotropism • Positive Gravitropism (Statoliths)', 32, 175);

  pCtx.fillStyle = '#10b981';
  pCtx.beginPath();
  pCtx.arc(380, 220, 45, 0, Math.PI * 2);
  pCtx.fill();
  pCtx.fillStyle = '#ffffff';
  pCtx.font = 'bold 36px sans-serif';
  pCtx.fillText('🌿', 360, 233);

  const posterTexture = new THREE.CanvasTexture(posterCanvas);
  const posterGeo = new THREE.PlaneGeometry(4.2, 2.8);
  const posterMat = new THREE.MeshStandardMaterial({
    map: posterTexture,
    roughness: 0.35,
  });
  const poster = new THREE.Mesh(posterGeo, posterMat);
  poster.position.set(-2.8, 4.2, -4.42);
  roomGroup.add(poster);

  const frameGeo = new THREE.BoxGeometry(4.3, 2.9, 0.05);
  const frameMat = new THREE.MeshStandardMaterial({ color: isDarkroom ? 0x0f172a : 0x334155, roughness: 0.4 });
  const posterFrame = new THREE.Mesh(frameGeo, frameMat);
  posterFrame.position.set(-2.8, 4.2, -4.45);
  roomGroup.add(posterFrame);

  // 4. Heavy Duty Laboratory Workbench
  const benchGroup = new THREE.Group();
  scene.add(benchGroup);

  // Table Top: Chemical-resistant resin slab
  const tableTopGeo = new THREE.BoxGeometry(9.0, 0.16, 4.6);
  const tableTopMat = new THREE.MeshStandardMaterial({
    color: isDarkroom ? 0xdfe7ef : 0xffffff,
    roughness: 0.25,
    metalness: 0.08,
  });
  const tableTop = new THREE.Mesh(tableTopGeo, tableTopMat);
  tableTop.position.set(0, -0.08, 0.3);
  tableTop.receiveShadow = true;
  tableTop.castShadow = true;
  benchGroup.add(tableTop);

  // Beveled Edge Trim (Blue/charcoal impact bumper trim)
  const edgeTrimGeo = new THREE.BoxGeometry(9.08, 0.05, 4.68);
  const edgeTrimMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 });
  const edgeTrim = new THREE.Mesh(edgeTrimGeo, edgeTrimMat);
  edgeTrim.position.set(0, -0.14, 0.3);
  benchGroup.add(edgeTrim);

  // Steel Legs & Frame underneath
  const legGeo = new THREE.BoxGeometry(0.12, 1.35, 0.12);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 });

  const legPositions = [
    [-4.3, -0.82, -1.8],
    [4.3, -0.82, -1.8],
    [-4.3, -0.82, 2.4],
    [4.3, -0.82, 2.4],
  ];
  legPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    benchGroup.add(leg);
  });

  // Drawer Cabinet Unit on right side of desk
  const cabinetGeo = new THREE.BoxGeometry(2.0, 1.25, 3.8);
  const cabinetMat = new THREE.MeshStandardMaterial({ color: isDarkroom ? 0x1e293b : 0xf8fafc, roughness: 0.4 });
  const cabinet = new THREE.Mesh(cabinetGeo, cabinetMat);
  cabinet.position.set(3.2, -0.78, 0.3);
  cabinet.castShadow = true;
  benchGroup.add(cabinet);

  // Drawer handles
  for (let i = 0; i < 3; i++) {
    const handleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.35, 8);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.2 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(3.2, -0.4 - i * 0.35, 2.22);
    benchGroup.add(handle);
  }

  // 5. Background Props on Workbench

  // (A) Test Tube Rack with Solutions
  const rackGroup = new THREE.Group();
  rackGroup.position.set(-3.4, 0, -1.2);
  benchGroup.add(rackGroup);

  const rackWoodMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });
  const rackBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.5), rackWoodMat);
  rackBase.position.y = 0.03;
  rackGroup.add(rackBase);

  const rackTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 0.5), rackWoodMat);
  rackTop.position.y = 0.7;
  rackGroup.add(rackTop);

  const rackPostL = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8), rackWoodMat);
  rackPostL.position.set(-0.72, 0.35, 0);
  rackGroup.add(rackPostL);

  const rackPostR = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8), rackWoodMat);
  rackPostR.position.set(0.72, 0.35, 0);
  rackGroup.add(rackPostR);

  const tubeGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.92,
    opacity: 1,
    transparent: true,
    roughness: 0.05,
    ior: 1.48,
  });

  const tubeColors = [0x38bdf8, 0x10b981, 0xf59e0b, 0xec4899, 0xa855f7];
  for (let i = 0; i < 5; i++) {
    const tx = -0.55 + i * 0.28;
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.8, 16), tubeGlassMat);
    tube.position.set(tx, 0.42, 0);
    rackGroup.add(tube);

    const liqMat = new THREE.MeshStandardMaterial({
      color: tubeColors[i],
      transparent: true,
      opacity: 0.85,
      roughness: 0.2,
    });
    const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.45, 16), liqMat);
    liquid.position.set(tx, 0.28, 0);
    rackGroup.add(liquid);
  }

  // (B) Erlenmeyer Flask
  const flaskGroup = new THREE.Group();
  flaskGroup.position.set(-2.2, 0, -1.3);
  benchGroup.add(flaskGroup);

  const flaskGeo = new THREE.ConeGeometry(0.42, 0.65, 24, 1, true);
  const flask = new THREE.Mesh(flaskGeo, tubeGlassMat);
  flask.position.y = 0.32;
  flaskGroup.add(flask);

  const flaskNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.28, 16, 1, true), tubeGlassMat);
  flaskNeck.position.y = 0.72;
  flaskGroup.add(flaskNeck);

  const flaskLiqGeo = new THREE.ConeGeometry(0.38, 0.4, 24);
  const flaskLiqMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    transparent: true,
    opacity: 0.85,
    roughness: 0.2,
  });
  const flaskLiq = new THREE.Mesh(flaskLiqGeo, flaskLiqMat);
  flaskLiq.position.y = 0.2;
  flaskGroup.add(flaskLiq);

  // (C) Microscope
  const scopeGroup = new THREE.Group();
  scopeGroup.position.set(3.5, 0, -1.0);
  scopeGroup.rotation.y = -Math.PI / 4;
  benchGroup.add(scopeGroup);

  const scopeBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.1, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 })
  );
  scopeBase.position.y = 0.05;
  scopeGroup.add(scopeBase);

  const scopeArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.08, 0.9, 12),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 })
  );
  scopeArm.position.set(0, 0.55, -0.25);
  scopeArm.rotation.x = -Math.PI / 12;
  scopeGroup.add(scopeArm);

  const scopeHead = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.14, 0.55, 16),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.4 })
  );
  scopeHead.position.set(0, 1.0, 0.05);
  scopeHead.rotation.x = Math.PI / 6;
  scopeGroup.add(scopeHead);

  const ocular = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.35, 12),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 })
  );
  ocular.position.set(0, 1.28, -0.08);
  ocular.rotation.x = Math.PI / 6;
  scopeGroup.add(ocular);

  const stage = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.04, 0.55),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.6 })
  );
  stage.position.set(0, 0.5, 0.1);
  scopeGroup.add(stage);

  // (D) Lab Notebook & Pen
  const notebookGroup = new THREE.Group();
  notebookGroup.position.set(-2.8, 0.02, 1.2);
  notebookGroup.rotation.y = Math.PI / 8;
  benchGroup.add(notebookGroup);

  const notebook = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.03, 1.1),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 })
  );
  notebookGroup.add(notebook);

  const page = new THREE.Mesh(
    new THREE.BoxGeometry(0.78, 0.015, 1.02),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 })
  );
  page.position.y = 0.02;
  notebookGroup.add(page);

  const pen = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.7, 8),
    new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5 })
  );
  pen.rotation.z = Math.PI / 2;
  pen.position.set(0.2, 0.04, 0.1);
  notebookGroup.add(pen);

  const setDarkroom = (dark: boolean) => {
    scene.background = (dark ? darkBg : dayBg).clone();
    if (scene.fog) {
      scene.fog.color = (dark ? darkBg : dayBg).clone();
      (scene.fog as THREE.FogExp2).density = dark ? 0.035 : 0.02;
    }
    ambientLight.color.setHex(dark ? 0x38bdf8 : 0xffffff);
    ambientLight.intensity = dark ? 0.22 : 0.9;
    hemiLight.intensity = dark ? 0.18 : 0.65;
    sunLight.intensity = dark ? 0.08 : 1.4;
    fillLight.intensity = dark ? 0.06 : 0.7;
    ceilingLight.intensity = dark ? 0.12 : 0.8;
    rimLight.intensity = dark ? 0.35 : 0.0;
  };

  return {
    roomGroup,
    benchGroup,
    setDarkroom,
  };
}
