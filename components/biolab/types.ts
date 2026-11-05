export type LabId = 'phototropism' | 'photosynthesis' | 'hydrotropism';

export interface PhototropismState {
  lightAngle: number; // -60 to 60 degrees
  lightIntensity: number; // 10 to 100 %
  lightColor: 'white' | 'blue' | 'red' | 'off';
  plantTreatment: 'normal' | 'decapitated' | 'opaque_cap' | 'transparent_cap' | 'agar_block' | 'mica_insert';
  xrayMode: boolean;
  timeMultiplier: number;
  currentAngle: number; // actual bent angle of plant
  growthHeight: number;
}

export interface PhotosynthesisState {
  lampDistance: number; // 10 to 100 cm
  lampPower: number; // 20 to 200 Watts
  co2Concentration: number; // 0 to 4.0 % (NaHCO3)
  waterTemperature: number; // 5 to 50 Celsius
  colorFilter: 'white' | 'blue' | 'green' | 'red';
  collectedO2Volume: number; // 0 to 100% full
  bubblesPerMinute: number;
  glowingSplintActive: boolean;
  splintBurstEffect: boolean;
  timeMultiplier: number;
}

export interface HydrotropismState {
  waterSourcePos: 'left' | 'center' | 'right' | 'bottom';
  soilMoistureLeft: number; // 0 to 100 %
  soilMoistureRight: number; // 0 to 100 %
  boxRotation: number; // 0 deg (upright) or 90 deg (horizontal)
  xrayStatoliths: boolean;
  rootBentAngle: number;
  rootLength: number;
  timeMultiplier: number;
}

export interface LabMission {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  hint: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
