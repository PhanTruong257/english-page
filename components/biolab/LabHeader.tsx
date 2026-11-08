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
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/90 shadow-sm px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand Logo & Labs Switcher */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 transition group-hover:scale-105">
              <span className="text-lg">🧬</span>
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-slate-900">Moon. Bio</span>
                <span className="text-emerald-600">Lab 3D</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  Virtual Lab
                </span>
              </div>
              <div className="text-[10px] text-slate-500 -mt-0.5 font-medium">Phòng thí nghiệm Sinh học ảo</div>
            </div>
          </Link>

          {/* Lab Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
            {labs.map((lab) => (
              <button
                key={lab.id}
                onClick={() => onSelectLab(lab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeLab === lab.id
                    ? 'bg-white text-emerald-700 border border-slate-200/80 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              isPlaying
                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 shadow-sm'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-sm'
            }`}
          >
            <span>{isPlaying ? '⏸️' : '▶️'}</span>
            <span>{isPlaying ? 'Tạm dừng' : 'Chạy tiếp'}</span>
          </button>

          {/* Time-lapse Multiplier */}
          <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200 p-0.5 text-xs shadow-inner">
            <span className="text-[10px] text-slate-500 px-2 font-bold">Tua:</span>
            {[1, 5, 20].map((m) => (
              <button
                key={m}
                onClick={() => onChangeTimeMultiplier(m)}
                className={`px-2 py-1 rounded-lg font-mono text-[11px] font-black transition ${
                  timeMultiplier === m
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
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
            className="p-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 transition shadow-sm"
          >
            🔄
          </button>

          {/* Help Guide */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition shadow-sm"
          >
            <span>📖</span>
            <span className="hidden sm:inline">Hướng dẫn</span>
          </button>

          {/* Export Report Button */}
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-md shadow-emerald-500/25 transition cursor-pointer"
          >
            <span>📄</span>
            <span>Xuất Báo Cáo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
