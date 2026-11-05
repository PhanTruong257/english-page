'use client';

import React from 'react';
import Link from 'next/link';
import { LabId } from './types';

interface Props {
  activeLab: LabId;
  onSelectLab: (id: LabId) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  timeMultiplier: number;
  onChangeTimeMultiplier: (multiplier: number) => void;
  onReset: () => void;
  onOpenReport: () => void;
  onOpenGuide: () => void;
}

export default function LabHeader({
  activeLab,
  onSelectLab,
  isPlaying,
  onTogglePlay,
  timeMultiplier,
  onChangeTimeMultiplier,
  onReset,
  onOpenReport,
  onOpenGuide,
}: Props) {
  const labs: { id: LabId; label: string; icon: string }[] = [
    { id: 'phototropism', label: '1. Tính hướng sáng', icon: '🌿' },
    { id: 'photosynthesis', label: '2. Thí nghiệm quang hợp', icon: '🧪' },
    { id: 'hydrotropism', label: '3. Tính hướng nước & rễ', icon: '🌱' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand Logo & Labs Switcher */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/25 transition group-hover:scale-105">
              <span className="text-lg">🧬</span>
            </div>
            <div>
              <div className="font-extrabold text-base text-white tracking-tight flex items-center gap-1">
                Bio<span className="text-emerald-400">Lab 3D</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                  Virtual Lab
                </span>
              </div>
              <div className="text-[10px] text-slate-400 -mt-0.5">Phòng thí nghiệm Sinh học ảo</div>
            </div>
          </Link>

          {/* Lab Tabs */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            {labs.map((lab) => (
              <button
                key={lab.id}
                onClick={() => onSelectLab(lab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeLab === lab.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{lab.icon}</span>
                <span className="hidden sm:inline">{lab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Play / Pause */}
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            <span>{isPlaying ? '⏸️' : '▶️'}</span>
            <span>{isPlaying ? 'Tạm dừng' : 'Chạy tiếp'}</span>
          </button>

          {/* Time-lapse Multiplier */}
          <div className="flex items-center bg-slate-900/90 rounded-xl border border-slate-800 p-0.5 text-xs">
            <span className="text-[10px] text-slate-500 px-2 font-medium">Tua:</span>
            {[1, 5, 20].map((m) => (
              <button
                key={m}
                onClick={() => onChangeTimeMultiplier(m)}
                className={`px-2 py-1 rounded-lg font-mono text-[11px] font-bold transition ${
                  timeMultiplier === m
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m}x
              </button>
            ))}
          </div>

          {/* Reset button */}
          <button
            onClick={onReset}
            title="Làm mới thông số về mặc định"
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition"
          >
            🔄
          </button>

          {/* Help Guide */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition"
          >
            <span>📖</span>
            <span className="hidden sm:inline">Hướng dẫn</span>
          </button>

          {/* Export Report Button */}
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer"
          >
            <span>📄</span>
            <span>Xuất Báo Cáo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
