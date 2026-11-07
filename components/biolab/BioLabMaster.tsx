'use client';

import React, { useState } from 'react';
import LabHeader from './LabHeader';
import LabSidebar from './LabSidebar';
import PhototropismScene from './3d/PhototropismScene';
import PhotosynthesisScene from './3d/PhotosynthesisScene';
import RootTropismScene from './3d/RootTropismScene';
import LabReportModal from './LabReportModal';
import LabGuideModal from './LabGuideModal';
import { LabId, PhototropismState, PhotosynthesisState, HydrotropismState } from './types';

export default function BioLabMaster() {
  const [activeLab, setActiveLab] = useState<LabId>('phototropism');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [timeMultiplier, setTimeMultiplier] = useState<number>(5);

  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [sidebarTab, setSidebarTab] = useState<'controls' | 'inquiry' | 'analytics' | 'mechanism' | 'missions'>('controls');

  // LAB 1 STATE
  const [photoState, setPhotoState] = useState<PhototropismState>({
    lightAngle: 35,
    lightIntensity: 80,
    lightColor: 'white',
    plantTreatment: 'normal',
    xrayMode: false,
    timeMultiplier: 5,
    currentAngle: 0,
    growthHeight: 2.8,
  });
  const [photoCurrentAngle, setPhotoCurrentAngle] = useState<number>(0);

  // LAB 2 STATE
  const [synthState, setSynthState] = useState<PhotosynthesisState>({
    lampDistance: 25,
    lampPower: 100,
    co2Concentration: 2.0,
    waterTemperature: 28,
    colorFilter: 'white',
    collectedO2Volume: 12,
    bubblesPerMinute: 42,
    glowingSplintActive: false,
    splintBurstEffect: false,
    timeMultiplier: 5,
  });

  // LAB 3 STATE
  const [hydroState, setHydroState] = useState<HydrotropismState>({
    waterSourcePos: 'left',
    soilMoistureLeft: 85,
    soilMoistureRight: 15,
    boxRotation: 0,
    xrayStatoliths: false,
    rootBentAngle: 0,
    rootLength: 2.0,
    timeMultiplier: 5,
  });
  const [hydroCurrentAngle, setHydroCurrentAngle] = useState<number>(0);

  // Change time multiplier across all states
  const handleChangeMultiplier = (multiplier: number) => {
    setTimeMultiplier(multiplier);
    setPhotoState((prev) => ({ ...prev, timeMultiplier: multiplier }));
    setSynthState((prev) => ({ ...prev, timeMultiplier: multiplier }));
    setHydroState((prev) => ({ ...prev, timeMultiplier: multiplier }));
  };

  // Reset current lab
  const handleResetCurrentLab = () => {
    if (activeLab === 'phototropism') {
      setPhotoState({
        lightAngle: 35,
        lightIntensity: 80,
        lightColor: 'white',
        plantTreatment: 'normal',
        xrayMode: false,
        timeMultiplier: timeMultiplier,
        currentAngle: 0,
        growthHeight: 2.8,
      });
      setPhotoCurrentAngle(0);
    } else if (activeLab === 'photosynthesis') {
      setSynthState({
        lampDistance: 25,
        lampPower: 100,
        co2Concentration: 2.0,
        waterTemperature: 28,
        colorFilter: 'white',
        collectedO2Volume: 0,
        bubblesPerMinute: 42,
        glowingSplintActive: false,
        splintBurstEffect: false,
        timeMultiplier: timeMultiplier,
      });
    } else if (activeLab === 'hydrotropism') {
      setHydroState({
        waterSourcePos: 'left',
        soilMoistureLeft: 85,
        soilMoistureRight: 15,
        boxRotation: 0,
        xrayStatoliths: false,
        rootBentAngle: 0,
        rootLength: 2.0,
        timeMultiplier: timeMultiplier,
      });
      setHydroCurrentAngle(0);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-100 via-sky-50/50 to-emerald-50/40 text-slate-800 selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation Bar */}
      <LabHeader
        activeLab={activeLab}
        onSelectLab={(lab) => setActiveLab(lab)}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        timeMultiplier={timeMultiplier}
        onChangeTimeMultiplier={handleChangeMultiplier}
        onReset={handleResetCurrentLab}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-3 sm:p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column: 3D Scene Viewport (7 cols on lg, 8 on xl) */}
        <section className="lg:col-span-7 xl:col-span-8 flex flex-col min-h-[500px] lg:min-h-[720px] relative">
          {activeLab === 'phototropism' && (
            <PhototropismScene
              state={photoState}
              onUpdateState={setPhotoState}
              onAngleUpdate={(ang) => setPhotoCurrentAngle(ang)}
              onOpenInquiry={() => setSidebarTab('inquiry')}
              isPlaying={isPlaying}
            />
          )}

          {activeLab === 'photosynthesis' && (
            <PhotosynthesisScene
              state={synthState}
              onUpdateState={setSynthState}
              onUpdateBubbleRate={(bpm, vol) => {
                setSynthState((prev) => ({
                  ...prev,
                  bubblesPerMinute: bpm,
                  collectedO2Volume: vol,
                }));
              }}
              isPlaying={isPlaying}
            />
          )}

          {activeLab === 'hydrotropism' && (
            <RootTropismScene
              state={hydroState}
              onUpdateState={setHydroState}
              onUpdateRootAngle={(ang) => setHydroCurrentAngle(ang)}
              isPlaying={isPlaying}
            />
          )}
        </section>

        {/* Right Column: Scientific Control & Analysis Sidebar (5 cols on lg, 4 on xl) */}
        <aside className="lg:col-span-5 xl:col-span-4 flex flex-col h-[650px] lg:h-[720px]">
          <LabSidebar
            activeLab={activeLab}
            activeTab={sidebarTab}
            onTabChange={setSidebarTab}
            photoState={photoState}
            onUpdatePhotoState={setPhotoState}
            photoCurrentAngle={photoCurrentAngle}
            synthState={synthState}
            onUpdateSynthState={setSynthState}
            hydroState={hydroState}
            onUpdateHydroState={setHydroState}
            hydroCurrentAngle={hydroCurrentAngle}
          />
        </aside>
      </main>

      {/* Modals */}
      <LabReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        activeLab={activeLab}
        photoState={photoState}
        photoCurrentAngle={photoCurrentAngle}
        synthState={synthState}
        hydroState={hydroState}
        hydroCurrentAngle={hydroCurrentAngle}
      />

      <LabGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
