'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  LabId,
  PhototropismState,
  PhotosynthesisState,
  HydrotropismState,
  LabMission,
  QuizQuestion,
} from './types';
import LabAnalyticsChart from './LabAnalyticsChart';

interface Props {
  activeLab: LabId;
  photoState: PhototropismState;
  onUpdatePhotoState: (updater: (prev: PhototropismState) => PhototropismState) => void;
  photoCurrentAngle: number;

  synthState: PhotosynthesisState;
  onUpdateSynthState: (updater: (prev: PhotosynthesisState) => PhotosynthesisState) => void;

  hydroState: HydrotropismState;
  onUpdateHydroState: (updater: (prev: HydrotropismState) => HydrotropismState) => void;
  hydroCurrentAngle: number;
}

export default function LabSidebar({
  activeLab,
  photoState,
  onUpdatePhotoState,
  photoCurrentAngle,
  synthState,
  onUpdateSynthState,
  hydroState,
  onUpdateHydroState,
  hydroCurrentAngle,
}: Props) {
  const [activeTab, setActiveTab] = useState<'controls' | 'analytics' | 'mechanism' | 'missions'>('controls');

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Missions state per lab
  const [completedMissions, setCompletedMissions] = useState<Record<string, boolean>>({});

  // Trigger confetti on mission complete
  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#38bdf8', '#f59e0b', '#ec4899'],
    });
  };

  // Check mission progress dynamically
  useEffect(() => {
    if (activeLab === 'phototropism') {
      if (Math.abs(photoState.lightAngle) >= 30 && !completedMissions['p1']) {
        setCompletedMissions((prev) => ({ ...prev, p1: true }));
        triggerConfetti();
      }
      if (photoState.xrayMode && !completedMissions['p2']) {
        setCompletedMissions((prev) => ({ ...prev, p2: true }));
        triggerConfetti();
      }
      if (photoState.plantTreatment === 'decapitated' && !completedMissions['p3']) {
        setCompletedMissions((prev) => ({ ...prev, p3: true }));
        triggerConfetti();
      }
    } else if (activeLab === 'photosynthesis') {
      if (synthState.bubblesPerMinute >= 30 && !completedMissions['s1']) {
        setCompletedMissions((prev) => ({ ...prev, s1: true }));
        triggerConfetti();
      }
      if (synthState.colorFilter === 'green' && !completedMissions['s2']) {
        setCompletedMissions((prev) => ({ ...prev, s2: true }));
        triggerConfetti();
      }
      if (synthState.glowingSplintActive && synthState.splintBurstEffect && !completedMissions['s3']) {
        setCompletedMissions((prev) => ({ ...prev, s3: true }));
        triggerConfetti();
      }
    } else if (activeLab === 'hydrotropism') {
      if (hydroState.waterSourcePos === 'left' || hydroState.waterSourcePos === 'right') {
        if (!completedMissions['h1']) {
          setCompletedMissions((prev) => ({ ...prev, h1: true }));
          triggerConfetti();
        }
      }
      if (hydroState.boxRotation === 90 && !completedMissions['h2']) {
        setCompletedMissions((prev) => ({ ...prev, h2: true }));
        triggerConfetti();
      }
      if (hydroState.xrayStatoliths && !completedMissions['h3']) {
        setCompletedMissions((prev) => ({ ...prev, h3: true }));
        triggerConfetti();
      }
    }
  }, [photoState, synthState, hydroState, activeLab]);

  // Quiz questions per lab
  const quizzes: Record<LabId, QuizQuestion[]> = {
    phototropism: [
      {
        id: 1,
        question: 'Loại hormone thực vật nào đóng vai trò chính trong tính hướng sáng của cây?',
        options: ['Gibberellin (GA)', 'Auxin (AIA)', 'Cytokinin', 'Axit Abscisic (ABA)'],
        correctIndex: 1,
        explanation: 'Auxin kích thích sự dãn dài của tế bào. Dưới tác dụng của ánh sáng đơn hướng, auxin vận chuyển chủ động sang phía khuất sáng làm phía này lớn nhanh hơn.',
      },
      {
        id: 2,
        question: 'Khi cắt bỏ chóp bao lá mầm của cây mạ, cây sẽ phản ứng thế nào khi chiếu sáng một bên?',
        options: [
          'Vẫn uốn cong mạnh về phía ánh sáng',
          'Uốn cong ngược lại khỏi ánh sáng',
          'Không uốn cong, tiếp tục mọc thẳng hoặc ngừng sinh trưởng chóp',
          'Cây lập tức rũ héo',
        ],
        correctIndex: 2,
        explanation: 'Thí nghiệm của Darwin chứng minh chóp bao lá mầm là nơi tiếp nhận kích thích ánh sáng và sản sinh auxin. Cắt bỏ chóp sẽ làm mất khả năng cảm ứng hướng sáng.',
      },
      {
        id: 3,
        question: 'Quang phổ ánh sáng nào kích hoạt tính hướng sáng mạnh nhất ở thực vật?',
        options: ['Ánh sáng đỏ (Red)', 'Ánh sáng xanh lục (Green)', 'Ánh sáng xanh lam (Blue)', 'Ánh sáng hồng ngoại'],
        correctIndex: 2,
        explanation: 'Sắc tố tiếp nhận ánh sáng định hướng là Phototropin (Flavoprotein), hấp thụ mạnh nhất ở dải ánh sáng xanh lam (400-500 nm).',
      },
    ],
    photosynthesis: [
      {
        id: 1,
        question: 'Bọt khí thoát ra từ cành rong đuôi chó trong thí nghiệm là khí gì?',
        options: ['Khí Cacbonic (CO2)', 'Khí Oxy (O2)', 'Khí Nitơ (N2)', 'Hơi nước'],
        correctIndex: 1,
        explanation: 'Khí oxy được giải phóng trong pha sáng của quang hợp thông qua quá trình quang phân ly nước: 2H2O -> 4H+ + 4e- + O2.',
      },
      {
        id: 2,
        question: 'Vì sao khi dùng kính lọc màu xanh lục (Green), tốc độ thoát bọt khí giảm sút nghiêm trọng?',
        options: [
          'Ánh sáng xanh lục quá nóng làm chết rong',
          'Lục lạp chứa diệp lục phản xạ ánh sáng xanh lục, hầu như không hấp thụ được năng lượng này',
          'Ánh sáng lục ức chế CO2 hòa tan',
          'Rong hấp thụ màu lục nhưng thải ra CO2',
        ],
        correctIndex: 1,
        explanation: 'Hệ sắc tố quang hợp (Diệp lục a, b) chỉ hấp thụ mạnh ở vùng xanh lam và vùng đỏ; phản xạ vùng xanh lục làm lá có màu xanh.',
      },
      {
        id: 3,
        question: 'Khi nhiệt độ nước tăng lên 50°C, hiện tượng gì sẽ xảy ra với quá trình quang hợp?',
        options: [
          'Quang hợp đạt tốc độ cực đại kỷ lục',
          'Quang hợp giảm mạnh hoặc ngừng hẳn do các enzyme bị biến tính',
          'Quang hợp không đổi vì nhiệt độ không ảnh hưởng',
          'Cây chuyển sang quang hợp không cần ánh sáng',
        ],
        correctIndex: 1,
        explanation: 'Pha tối (chu trình Calvin) phụ thuộc vào enzyme (như RuBisCO). Ở nhiệt độ cao (>45°C), cấu trúc protein enzyme bị biến tính làm ngừng phản ứng xúc tác.',
      },
    ],
    hydrotropism: [
      {
        id: 1,
        question: 'Tính hướng nước của rễ thuộc loại cảm ứng nào?',
        options: ['Hướng động âm (-)', 'Hướng động dương (+)', 'Ứng động sinh trưởng', 'Cảm ứng hóa học âm'],
        correctIndex: 1,
        explanation: 'Rễ cây sinh trưởng hướng về phía có nguồn nước (hướng kích thích thuận lợi) nên là hướng động dương (+).',
      },
      {
        id: 2,
        question: 'Bộ phận nào của rễ giữ vai trò nhận biết trọng lực và định hướng sinh trưởng?',
        options: ['Vùng lông hút', 'Vùng dãn dài tế bào', 'Chóp rễ (Root cap) chứa tế bào thạch lạp (statocytes)', 'Vùng vỏ rễ'],
        correctIndex: 2,
        explanation: 'Chóp rễ chứa các tế bào có hạt thạch lạp (statoliths) giàu tinh bột. Các hạt này lắng xuống đáy tế bào theo trọng lực giúp rễ cảm nhận hướng đất.',
      },
      {
        id: 3,
        question: 'Tại sao nồng độ auxin cao ở mặt dưới rễ lại ức chế tế bào mặt dưới dãn dài (ngược với thân cây)?',
        options: [
          'Vì rễ không có enzyme phân giải auxin',
          'Tế bào rễ có độ nhạy cảm cao với auxin, nồng độ tối ưu cho rễ thấp hơn nhiều so với thân',
          'Auxin ở rễ biến thành độc tố khi gặp đất',
          'Do rễ không có thành cellulose',
        ],
        correctIndex: 1,
        explanation: 'Thang nồng độ tối ưu của rễ rất thấp (~10^-10 M). Nồng độ auxin vượt ngưỡng ở mặt dưới gây ức chế dãn dài, làm mặt trên dài nhanh hơn nên rễ uốn cong xuống dưới.',
      },
    ],
  };

  // Missions list per lab
  const missionsList: Record<LabId, LabMission[]> = {
    phototropism: [
      {
        id: 'p1',
        title: 'Tạo góc lệch ánh sáng',
        description: 'Chỉnh góc đèn lệch ít nhất 30° sang bên trái hoặc bên phải để kích thích cây bắt đầu uốn cong.',
        isCompleted: !!completedMissions['p1'],
        hint: 'Kéo thanh trượt "Góc xoay đèn" lên >30° hoặc <-30°',
      },
      {
        id: 'p2',
        title: 'Kích hoạt Chế độ X-Ray',
        description: 'Bật chế độ X-Ray để quan sát sự di chuyển và tích tụ của các phân tử Auxin ở phía tối.',
        isCompleted: !!completedMissions['p2'],
        hint: 'Bấm nút gạt "Chế độ X-Ray Phân tử Auxin"',
      },
      {
        id: 'p3',
        title: 'Tái hiện Thí nghiệm Darwin',
        description: 'Chọn phương pháp xử lý "Cắt bỏ chóp ngọn" để kiểm tra xem cây có còn phản ứng với ánh sáng không.',
        isCompleted: !!completedMissions['p3'],
        hint: 'Chọn "Cắt bỏ chóp ngọn (Decapitated)" trong mục Xử lý thí nghiệm',
      },
    ],
    photosynthesis: [
      {
        id: 's1',
        title: 'Tăng tốc độ quang hợp',
        description: 'Điều chỉnh các yếu tố (đưa đèn lại gần, tăng CO2, nhiệt độ ~30°C) để đạt tốc độ > 30 bọt khí/phút.',
        isCompleted: !!completedMissions['s1'],
        hint: 'Giảm khoảng cách đèn xuống < 30cm và bổ sung NaHCO3',
      },
      {
        id: 's2',
        title: 'Thử nghiệm Kính lọc xanh lục',
        description: 'Chuyển sang kính lọc màu Xanh lục để quan sát sự suy giảm nghiêm trọng của quá trình quang hợp.',
        isCompleted: !!completedMissions['s2'],
        hint: 'Chọn kính lọc "Xanh lục (Green)"',
      },
      {
        id: 's3',
        title: 'Kiểm tra Oxy bằng Que đóm',
        description: 'Thu thập đủ lượng khí O2 trong ống nghiệm và ấn nút thử que đóm để tạo ngọn lửa bùng cháy.',
        isCompleted: !!completedMissions['s3'],
        hint: 'Chờ khí O2 đạt > 25% rồi bấm "Đưa que đóm vào thử"',
      },
    ],
    hydrotropism: [
      {
        id: 'h1',
        title: 'Tạo chênh lệch độ ẩm',
        description: 'Đặt nguồn nước sang bên trái hoặc bên phải để quan sát rễ bắt đầu uốn cong.',
        isCompleted: !!completedMissions['h1'],
        hint: 'Chọn vị trí nguồn nước là "Bên trái" hoặc "Bên phải"',
      },
      {
        id: 'h2',
        title: 'Thí nghiệm đối chứng trọng lực',
        description: 'Xoay hộp thí nghiệm ngang 90° để khảo sát cuộc cạnh tranh giữa hướng trọng lực và hướng nước.',
        isCompleted: !!completedMissions['h2'],
        hint: 'Bấm nút "Xoay ngang hộp 90°"',
      },
      {
        id: 'h3',
        title: 'Quan sát Thạch lạp (Statoliths)',
        description: 'Bật chế độ X-Ray chóp rễ để thấy các hạt tinh bột thạch lạp cảm nhận trọng trường.',
        isCompleted: !!completedMissions['h3'],
        hint: 'Bật toggle "X-Ray Thạch Lạp chóp rễ"',
      },
    ],
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/95 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800/80 bg-slate-950/60 p-1.5 gap-1">
        <button
          onClick={() => setActiveTab('controls')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'controls'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <span>🎛️</span> Điều khiển
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'analytics'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <span>📈</span> Số liệu
        </button>

        <button
          onClick={() => setActiveTab('mechanism')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'mechanism'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <span>🧬</span> Cơ chế
        </button>

        <button
          onClick={() => setActiveTab('missions')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'missions'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <span>🎯</span> Thử thách
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        {/* TAB 1: CONTROLS */}
        {activeTab === 'controls' && (
          <div className="space-y-5">
            {/* LAB 1: PHOTOTROPISM CONTROLS */}
            {activeLab === 'phototropism' && (
              <>
                {/* Light Angle Slider */}
                <div className="space-y-2 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">Góc xoay nguồn sáng (Đèn)</span>
                    <span className="font-mono text-amber-400 font-bold">{photoState.lightAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="-60"
                    max="60"
                    step="5"
                    value={photoState.lightAngle}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      onUpdatePhotoState((prev) => ({ ...prev, lightAngle: val }));
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>-60° (Trái)</span>
                    <span>0° (Đỉnh đầu)</span>
                    <span>+60° (Phải)</span>
                  </div>
                </div>

                {/* Light Intensity */}
                <div className="space-y-2 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">Cường độ ánh sáng</span>
                    <span className="font-mono text-sky-400 font-bold">{photoState.lightIntensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={photoState.lightIntensity}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      onUpdatePhotoState((prev) => ({ ...prev, lightIntensity: val }));
                    }}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                </div>

                {/* Light Spectrum / Color */}
                <div className="space-y-2 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
                  <label className="text-xs font-semibold text-slate-300">Quang phổ ánh sáng (Màu đèn)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'white', label: 'Trắng', color: 'border-slate-300 text-white' },
                      { id: 'blue', label: 'Xanh lam', color: 'border-sky-500 text-sky-400' },
                      { id: 'red', label: 'Đỏ', color: 'border-red-500 text-red-400' },
                      { id: 'off', label: 'Tắt đèn', color: 'border-slate-600 text-slate-400' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() =>
                          onUpdatePhotoState((prev) => ({
                            ...prev,
                            lightColor: c.id as PhototropismState['lightColor'],
                          }))
                        }
                        className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                          photoState.lightColor === c.id
                            ? `${c.color} bg-slate-800 ring-2 ring-emerald-500/40`
                            : 'border-slate-800 text-slate-500 hover:bg-slate-900'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    💡 Sắc tố Phototropin hấp thụ mạnh nhất ánh sáng xanh lam (400-500 nm).
                  </p>
                </div>

                {/* Plant Treatment (Darwin Experiments) */}
                <div className="space-y-2 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
                  <label className="text-xs font-semibold text-slate-300">
                    Thí nghiệm kinh điển (Darwin & Boysen-Jensen)
                  </label>
                  <select
                    value={photoState.plantTreatment}
                    onChange={(e) =>
                      onUpdatePhotoState((prev) => ({
                        ...prev,
                        plantTreatment: e.target.value as PhototropismState['plantTreatment'],
                      }))
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="normal">1. Cây nguyên vẹn (Đối chứng)</option>
                    <option value="decapitated">2. Cắt bỏ chóp ngọn (Decapitated)</option>
                    <option value="opaque_cap">3. Chùm mũ đen che chóp ngọn (Opaque Cap)</option>
                    <option value="transparent_cap">4. Chùm mũ trong suốt che ngọn (Transparent Cap)</option>
                    <option value="agar_block">5. Chèn miếng thạch Agar dưới chóp</option>
                    <option value="mica_insert">6. Chèn phiến Mica cản auxin</option>
                  </select>
                </div>

                {/* X-Ray Auxin Toggle */}
                <div className="flex items-center justify-between bg-yellow-950/20 p-3.5 rounded-xl border border-yellow-500/30">
                  <div>
                    <div className="text-xs font-semibold text-yellow-300">Chế độ X-Ray Phân tử Auxin</div>
                    <div className="text-[10px] text-yellow-200/70">Hiển thị các hạt hormone dồn về phía tối</div>
                  </div>
                  <button
                    onClick={() => onUpdatePhotoState((prev) => ({ ...prev, xrayMode: !prev.xrayMode }))}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                      photoState.xrayMode ? 'bg-yellow-500 justify-end' : 'bg-slate-700 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-md transform transition" />
                  </button>
                </div>
              </>
            )}

            {/* LAB 2: PHOTOSYNTHESIS CONTROLS */}
            {activeLab === 'photosynthesis' && (
              <>
                {/* Lamp Distance */}
                <div className="space-y-2 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">Khoảng cách đèn chiếu sáng</span>
                    <span className="font-mono text-amber-400 font-bold">{synthState.lampDistance} cm</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={synthState.lampDistance}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      onUpdateSynthState((prev) => ({ ...prev, lampDistance: val }));
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>10 cm (Gần - Quang hợp mạnh)</span>
                    <span>100 cm (Xa)</span>
                  </div>
                </div>

                {/* CO2 Concentration (NaHCO3) */}
                <div className="space-y-2 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">Nồng độ CO₂ bổ sung (Dung dịch NaHCO₃)</span>
                    <span className="font-mono text-emerald-400 font-bold">{synthState.co2Concentration}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="4.0"
                    step="0.5"
                    value={synthState.co2Concentration}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      onUpdateSynthState((prev) => ({ ...prev, co2Concentration: val }));
                    }}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">
                    NaHCO₃ cung cấp ion HCO₃⁻ phân li giải phóng CO₂ hòa tan trong nước cho cành rong.
                  </p>
                </div>

                {/* Water Temperature */}
                <div className="space-y-2 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">Nhiệt độ nước trong bể</span>
                    <span className={`font-mono font-bold ${synthState.waterTemperature > 40 ? 'text-red-400' : 'text-cyan-400'}`}>
                      {synthState.waterTemperature}°C {synthState.waterTemperature > 40 && '(Quá nóng!)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={synthState.waterTemperature}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      onUpdateSynthState((prev) => ({ ...prev, waterTemperature: val }));
                    }}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>5°C (Lạnh)</span>
                    <span>30°C (Tối ưu)</span>
                    <span>50°C (Biến tính)</span>
                  </div>
                </div>

                {/* Color Filter */}
                <div className="space-y-2 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
                  <label className="text-xs font-semibold text-slate-300">Kính lọc màu quang phổ</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'white', label: 'Trắng' },
                      { id: 'blue', label: 'Xanh lam' },
                      { id: 'red', label: 'Đỏ' },
                      { id: 'green', label: 'Xanh lục' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() =>
                          onUpdateSynthState((prev) => ({
                            ...prev,
                            colorFilter: f.id as PhotosynthesisState['colorFilter'],
                          }))
                        }
                        className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                          synthState.colorFilter === f.id
                            ? 'bg-sky-950 border-sky-400 text-sky-200 ring-2 ring-sky-500/30'
                            : 'border-slate-800 text-slate-400 hover:bg-slate-900'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Glowing Splint Combustion Test Button */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 to-orange-950/40 border border-amber-600/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-amber-300">Thí nghiệm Thử que đóm cháy bùng</div>
                      <div className="text-[10px] text-amber-200/80">Khí O₂ thu được: {Math.round(synthState.collectedO2Volume)}%</div>
                    </div>
                    <button
                      onClick={() => {
                        onUpdateSynthState((prev) => ({
                          ...prev,
                          glowingSplintActive: true,
                          splintBurstEffect: prev.collectedO2Volume >= 25,
                        }));
                        setTimeout(() => {
                          onUpdateSynthState((prev) => ({ ...prev, glowingSplintActive: false }));
                        }, 4000);
                      }}
                      disabled={synthState.glowingSplintActive}
                      className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs rounded-xl hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-orange-500/20 disabled:opacity-50 transition cursor-pointer"
                    >
                      🔥 Thử que đóm
                    </button>
                  </div>
                  {synthState.collectedO2Volume < 25 && (
                    <p className="text-[10px] text-amber-400/80">
                      ⚠️ Cần thu thập ít nhất 25% thể tích khí Oxy để tàn đóm bùng cháy.
                    </p>
                  )}
                </div>

                {/* Reset Gas Tube Button */}
                <button
                  onClick={() => onUpdateSynthState((prev) => ({ ...prev, collectedO2Volume: 0 }))}
                  className="w-full py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-xl text-xs border border-slate-700/80 transition"
                >
                  🔄 Đổ đầy nước / Đặt lại ống nghiệm
                </button>
              </>
            )}

            {/* LAB 3: HYDROTROPISM CONTROLS */}
            {activeLab === 'hydrotropism' && (
              <>
                {/* Water Source Position */}
                <div className="space-y-2 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
                  <label className="text-xs font-semibold text-slate-300">Vị trí đặt nguồn cấp ẩm (Nước)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'left', label: 'Bên trái 💧' },
                      { id: 'bottom', label: 'Ở đáy chậu' },
                      { id: 'right', label: 'Bên phải 💧' },
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        onClick={() =>
                          onUpdateHydroState((prev) => ({
                            ...prev,
                            waterSourcePos: pos.id as HydrotropismState['waterSourcePos'],
                          }))
                        }
                        className={`py-2 px-2 rounded-xl text-xs font-medium border transition ${
                          hydroState.waterSourcePos === pos.id
                            ? 'bg-emerald-950 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/30'
                            : 'border-slate-800 text-slate-400 hover:bg-slate-900'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Turn Chamber 90 Degrees (Gravitropism competition) */}
                <div className="space-y-2 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">Xoay hộp thí nghiệm (Thử nghiệm trọng lực)</span>
                    <span className="font-mono text-amber-400 font-bold">{hydroState.boxRotation}°</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onUpdateHydroState((prev) => ({ ...prev, boxRotation: 0 }))}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border transition ${
                        hydroState.boxRotation === 0
                          ? 'bg-sky-950 border-sky-400 text-sky-300'
                          : 'border-slate-800 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      Đặt thẳng đứng (0°)
                    </button>
                    <button
                      onClick={() => onUpdateHydroState((prev) => ({ ...prev, boxRotation: 90 }))}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border transition ${
                        hydroState.boxRotation === 90
                          ? 'bg-amber-950 border-amber-400 text-amber-300'
                          : 'border-slate-800 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      Xoay ngang (90°)
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Khi xoay ngang 90°, hướng trọng lực kích hoạt kéo rễ cắm xuống, đối kháng hoặc hợp lực với hướng nước!
                  </p>
                </div>

                {/* X-Ray Statoliths Toggle */}
                <div className="flex items-center justify-between bg-amber-950/20 p-3.5 rounded-xl border border-amber-500/30">
                  <div>
                    <div className="text-xs font-semibold text-amber-300">X-Ray Thạch Lạp (Statoliths) chóp rễ</div>
                    <div className="text-[10px] text-amber-200/70">Các hạt tinh bột lắng đọng cảm nhận gia tốc</div>
                  </div>
                  <button
                    onClick={() =>
                      onUpdateHydroState((prev) => ({ ...prev, xrayStatoliths: !prev.xrayStatoliths }))
                    }
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                      hydroState.xrayStatoliths ? 'bg-amber-500 justify-end' : 'bg-slate-700 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-md transform transition" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            {/* Live Chart */}
            <LabAnalyticsChart
              activeLab={activeLab}
              photoAngle={photoCurrentAngle}
              bubblesRate={synthState.bubblesPerMinute}
              temperature={synthState.waterTemperature}
              lightDistance={synthState.lampDistance}
              rootAngle={hydroCurrentAngle}
            />

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {activeLab === 'phototropism' && (
                <>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Góc lệch thân thực tế</div>
                    <div className="text-lg font-mono font-bold text-emerald-400 mt-1">{photoCurrentAngle}°</div>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Tốc độ phân bố Auxin</div>
                    <div className="text-lg font-mono font-bold text-yellow-400 mt-1">
                      {photoState.plantTreatment === 'normal' || photoState.plantTreatment === 'transparent_cap'
                        ? '100% Hoạt động'
                        : '0% (Bị chặn)'}
                    </div>
                  </div>
                </>
              )}

              {activeLab === 'photosynthesis' && (
                <>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Tốc độ tạo bọt khí</div>
                    <div className="text-lg font-mono font-bold text-sky-400 mt-1">
                      {synthState.bubblesPerMinute} <span className="text-[10px] text-slate-400 font-normal">bpm</span>
                    </div>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Khí O₂ thu được</div>
                    <div className="text-lg font-mono font-bold text-amber-400 mt-1">
                      {Math.round(synthState.collectedO2Volume)}%
                    </div>
                  </div>
                </>
              )}

              {activeLab === 'hydrotropism' && (
                <>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Góc uốn của rễ</div>
                    <div className="text-lg font-mono font-bold text-emerald-400 mt-1">{hydroCurrentAngle}°</div>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Tác nhân chiếm ưu thế</div>
                    <div className="text-sm font-bold text-sky-400 mt-1">
                      {hydroState.boxRotation === 90 ? 'Cạnh tranh Trọng lực / Nước' : 'Hướng nước (+) Dương'}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: MECHANISM (Lý thuyết cơ chế) */}
        {activeTab === 'mechanism' && (
          <div className="space-y-4 text-xs text-slate-300">
            {activeLab === 'phototropism' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-emerald-400 text-sm">🌿 Cơ chế phân tử Tính Hướng Sáng</h4>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    1. <strong>Cảm nhận ánh sáng:</strong> Thụ thể <em>Phototropin</em> ở chóp ngọn cây hấp thụ photon ánh sáng xanh lam (Blue light).
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    2. <strong>Vận chuyển Auxin:</strong> Dưới kích thích ánh sáng đơn hướng, protein vận chuyển <em>PIN</em> điều hướng dòng phân tử Auxin (AIA) di chuyển chủ động sang tế bào phía khuất sáng (shaded side).
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    3. <strong>Kéo dài tế bào (Thuyết sinh trưởng axit):</strong> Auxin kích hoạt bơm proton H⁺ ra ngoài màng tế bào, làm giảm pH thành tế bào, hoạt hóa enzyme <em>Expansin</em> làm giãn liên kết cellulose. Tế bào phía tối phình dài nhanh hơn, đẩy thân uốn cong về phía nguồn sáng.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-600/30 text-[11px] text-amber-200">
                  📌 <strong>Kết luận từ thí nghiệm Darwin:</strong> Chóp bao lá mầm là nơi tiếp nhận kích thích ánh sáng. Thân dưới chóp là nơi thực hiện phản ứng uốn cong.
                </div>
              </div>
            )}

            {activeLab === 'photosynthesis' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400 text-sm">🧪 Cơ chế Sinh hóa Quá trình Quang hợp</h4>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-700 font-mono text-[11px] text-center text-cyan-300">
                    6CO₂ + 12H₂O + Ánh sáng → C₆H₁₂O₆ + 6O₂ + 6H₂O
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    • <strong>Pha sáng (Thylakoid):</strong> Hạt diệp lục hấp thụ photon giải phóng electron vào chuỗi truyền điện tử, đồng thời xảy ra quang phân ly nước tạo ra khí O₂ thoát ra ngoài và tích trữ năng lượng ATP, NADPH.
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    • <strong>Định luật Blackman về nhân tố hạn chế:</strong> Tốc độ quang hợp bị giới hạn bởi yếu tố ở mức thấp nhất (hoặc ánh sáng, hoặc nồng độ CO₂, hoặc nhiệt độ).
                  </p>
                </div>
              </div>
            )}

            {activeLab === 'hydrotropism' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-emerald-400 text-sm">🌱 Cơ chế Cảm nhận Hướng nước & Trọng lực của Rễ</h4>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    • <strong>Thạch lạp (Statoliths):</strong> Trong chóp rễ có các tế bào chuyên hóa chứa các hạt tinh bột nặng (Statoliths). Trọng lực làm các hạt này lắng xuống đáy tế bào, kích hoạt dòng tín hiệu Auxin.
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    • <strong>Nghịch lý Auxin ở rễ:</strong> Khác với thân, tế bào rễ cực kỳ nhạy cảm với Auxin. Nồng độ auxin cao ở mặt dưới sẽ <strong>ức chế</strong> sự dãn dài tế bào, làm tế bào mặt trên dài nhanh hơn khiến rễ cắm xuống đất (Hướng đất dương).
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    • <strong>Hướng nước (Hydrotropism):</strong> Khi có gradien ẩm mạnh, kênh canxi và thụ thể MIZ1 ở rễ sẽ định hướng sự phân bố lại auxin, giúp rễ uốn cong theo nguồn nước sinh tồn.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MISSIONS & QUIZ */}
        {activeTab === 'missions' && (
          <div className="space-y-6">
            {/* Missions Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Nhiệm vụ phòng Lab ({missionsList[activeLab].filter((m) => m.isCompleted).length}/
                  {missionsList[activeLab].length})
                </h4>
              </div>

              <div className="space-y-2.5">
                {missionsList[activeLab].map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-xl border transition ${
                      m.isCompleted
                        ? 'bg-purple-950/30 border-purple-500/50'
                        : 'bg-slate-950/50 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs mt-0.5 ${
                          m.isCompleted
                            ? 'bg-purple-500 text-white font-bold'
                            : 'border border-slate-700 text-slate-600'
                        }`}
                      >
                        {m.isCompleted ? '✓' : ''}
                      </div>
                      <div className="flex-1">
                        <div className={`text-xs font-semibold ${m.isCompleted ? 'text-purple-300' : 'text-slate-200'}`}>
                          {m.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{m.description}</div>
                        {!m.isCompleted && (
                          <div className="text-[10px] text-purple-400/80 mt-1 italic">Gợi ý: {m.hint}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Quiz Section */}
            <div className="pt-3 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Trắc nghiệm nhanh</h4>
                {quizSubmitted && (
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    Điểm: {quizzes[activeLab].filter((q) => selectedAnswers[q.id] === q.correctIndex).length}/
                    {quizzes[activeLab].length}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {quizzes[activeLab].map((q, idx) => (
                  <div key={q.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2.5">
                    <div className="text-xs font-semibold text-slate-200 leading-snug">
                      <span className="text-amber-400">Câu {idx + 1}:</span> {q.question}
                    </div>

                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[q.id] === optIdx;
                        let optionStyle = 'border-slate-800 text-slate-400 hover:bg-slate-900';

                        if (quizSubmitted) {
                          if (optIdx === q.correctIndex) {
                            optionStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold';
                          } else if (isSelected) {
                            optionStyle = 'bg-red-950/80 border-red-500 text-red-300';
                          }
                        } else if (isSelected) {
                          optionStyle = 'bg-sky-950 border-sky-400 text-sky-200';
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={quizSubmitted}
                            onClick={() => setSelectedAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                            className={`w-full text-left p-2 rounded-lg text-xs border transition flex items-center justify-between ${optionStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && optIdx === q.correctIndex && <span>✓</span>}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="text-[11px] text-slate-400 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        💡 <strong>Giải thích:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}

                <button
                  onClick={() => {
                    if (quizSubmitted) {
                      setQuizSubmitted(false);
                      setSelectedAnswers({});
                    } else {
                      setQuizSubmitted(true);
                      triggerConfetti();
                    }
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
                >
                  {quizSubmitted ? '🔄 Làm lại bài trắc nghiệm' : 'Kiểm tra kết quả trắc nghiệm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
