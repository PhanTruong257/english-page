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
import PhotosynthesisRelationshipMap from './PhotosynthesisRelationshipMap';

type SidebarTab = 'controls' | 'inquiry' | 'analytics' | 'mechanism' | 'missions';

interface Props {
  activeLab: LabId;
  activeTab?: SidebarTab;
  onTabChange?: (tab: SidebarTab) => void;
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
  activeTab: propActiveTab,
  onTabChange,
  photoState,
  onUpdatePhotoState,
  photoCurrentAngle,
  synthState,
  onUpdateSynthState,
  hydroState,
  onUpdateHydroState,
  hydroCurrentAngle,
}: Props) {
  const [localActiveTab, setLocalActiveTab] = useState<SidebarTab>('controls');
  const activeTab = propActiveTab ?? localActiveTab;

  const setActiveTab = (tab: SidebarTab) => {
    setLocalActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  // Inquiry Guided State
  const [selectedTopicId, setSelectedTopicId] = useState<string>('topic_p1');
  const [selectedHypothesis, setSelectedHypothesis] = useState<Record<string, string>>({});
  const [selectedPrediction, setSelectedPrediction] = useState<Record<string, string>>({});
  const [inquiryChecked, setInquiryChecked] = useState<Record<string, boolean>>({});
  const [inquiryAnswerSelected, setInquiryAnswerSelected] = useState<Record<number, number>>({});
  const [showRealWorldInsight, setShowRealWorldInsight] = useState<Record<string, boolean>>({});
  const [studentUserNotes, setStudentUserNotes] = useState<Record<string, string>>({});
  const [inquirySaved, setInquirySaved] = useState(false);

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
      colors: ['#10b981', '#38bdf8', '#f59e0b', '#ec4899', '#8b5cf6'],
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
  }, [photoState, synthState, hydroState, activeLab, completedMissions]);

  // Guided Inquiry Topics for Phototropism
  const phototropismInquiryTopics = [
    {
      id: 'topic_p1',
      title: '1. Hướng chiếu sáng và góc uốn thân',
      question: 'Khi chiếu sáng đơn hướng từ một bên, thân cây mầm sẽ phản ứng như thế nào và nguyên nhân là gì?',
      context: 'Đặt cây mầm trong buồng tối với bóng đèn chiếu lệch một góc sang trái hoặc phải.',
      hypotheses: [
        {
          id: 'h1_1',
          text: 'Thân cây mầm sẽ uốn cong về phía nguồn sáng (Tính hướng sáng dương) do sự dãn dài không đều giữa hai phía.',
          isSupported: true,
        },
        {
          id: 'h1_2',
          text: 'Thân cây sẽ uốn cong quay lưng lại với nguồn sáng để tránh nhiệt độ cao (Tính hướng sáng âm).',
          isSupported: false,
        },
        {
          id: 'h1_3',
          text: 'Thân cây luôn luôn mọc thẳng đứng vuông góc với mặt đất, không chịu tác động của ánh sáng đơn hướng.',
          isSupported: false,
        },
      ],
      predictions: [
        { id: 'pred1_1', text: 'Góc lệch của thân cây sẽ tỷ lệ thuận với góc xoay của nguồn sáng và độ sáng của đèn.' },
        { id: 'pred1_2', text: 'Cây sẽ uốn cong ngay lập tức trong 1 giây mà không cần thời gian thích ứng.' },
        { id: 'pred1_3', text: 'Cây chỉ cong khi đèn được đặt ở đỉnh đầu (góc 0°).' },
      ],
      inquiryQuestions: [
        {
          id: 101,
          question: 'Tại sao thân cây lại uốn cong về phía có ánh sáng? Phía chiếu sáng hay phía khuất sáng có tế bào dãn dài nhanh hơn?',
          options: [
            'Phía chiếu sáng dãn dài nhanh hơn kéo thân cây uốn sang',
            'Phía khuất sáng (tối) có nồng độ auxin cao hơn, kích thích tế bào dãn dài nhanh hơn phía sáng, làm thân uốn cong về phía sáng',
            'Cả hai phía dài bằng nhau nhưng phía sáng bị teo lại do khô nước',
          ],
          correctIndex: 1,
          explanation: 'Dưới ánh sáng đơn hướng, auxin vận chuyển chủ động sang phía tối nhờ protein PIN. Auxin kích hoạt bơm proton H⁺ làm dãn thành cellulose (Thuyết sinh trưởng axit), tế bào phía tối dài nhanh hơn đẩy cây uốn về phía sáng.',
        },
        {
          id: 102,
          question: 'Dưới chế độ X-Ray Auxin, khi chỉnh góc đèn sang phải (+35°), bạn quan sát thấy hiện tượng gì ở các hạt Auxin?',
          options: [
            'Hạt auxin biến mất hoàn toàn',
            'Hạt auxin dồn mạnh sang nửa thân bên trái (phía khuất sáng), chứng minh sự phân bố bất đối xứng',
            'Hạt auxin dồn hết về phía bên phải (phía có đèn chiếu)',
          ],
          correctIndex: 1,
          explanation: 'Quang thụ thể Phototropin kích hoạt sự vận chuyển dòng auxin dồn sang phía tối, tạo gradien nồng độ hormone kích thích dãn dài bất đối xứng.',
        },
      ],
      realWorld: {
        question: 'Vì sao chậu cây cảnh đặt trong phòng bên bậu cửa sổ sau vài ngày luôn mọc nghiêng hẳn ra ngoài? Người trồng cây cần làm gì?',
        insight: 'Do ánh sáng từ ngoài cửa sổ chiếu đơn hướng làm ngọn cây hướng sáng dương. Để cây mọc thẳng đẹp cân đối, người chăm sóc cần định kỳ xoay chậu 180° sau mỗi vài ngày để các phía của cây đều nhận sáng luân phiên.',
      },
    },
    {
      id: 'topic_p2',
      title: '2. Thí nghiệm Darwin: Vị trí cảm nhận ánh sáng',
      question: 'Bộ phận nào của cây mầm giữ vai trò tiếp nhận kích thích ánh sáng để ra lệnh uốn cong?',
      context: 'Năm 1880, Charles Darwin thực hiện các phép xử lý: để nguyên, cắt bỏ chóp, bọc mũ đen và bọc mũ trong suốt.',
      hypotheses: [
        {
          id: 'h2_1',
          text: 'Chóp bao lá mầm là nơi duy nhất cảm nhận kích thích ánh sáng rồi truyền tín hiệu xuống vùng dãn dài bên dưới.',
          isSupported: true,
        },
        {
          id: 'h2_2',
          text: 'Vùng thân dãn dài bên dưới mới là nơi cảm nhận ánh sáng vì đó là nơi trực tiếp uốn cong.',
          isSupported: false,
        },
        {
          id: 'h2_3',
          text: 'Toàn bộ thân và rễ đều tiếp nhận ánh sáng ngang nhau.',
          isSupported: false,
        },
      ],
      predictions: [
        { id: 'pred2_1', text: 'Nếu cắt bỏ chóp ngọn hoặc bọc mũ đen che tối chóp ngọn, cây sẽ mất hoàn toàn tính hướng sáng (mọc thẳng).' },
        { id: 'pred2_2', text: 'Cắt bỏ chóp ngọn sẽ làm cây uốn cong mạnh hơn bình thường.' },
      ],
      inquiryQuestions: [
        {
          id: 201,
          question: 'Khi chụp mũ trong suốt (Transparent Cap) che ngọn, tại sao cây vẫn uốn cong bình thường theo nguồn sáng?',
          options: [
            'Vì mũ trong suốt cho phép photon ánh sáng xuyên qua tác động lên thụ thể phototropin ở chóp ngọn',
            'Vì mũ trong suốt tạo ra auxin thay thế cho cây',
            'Vì chóp ngọn không có tác dụng gì',
          ],
          correctIndex: 0,
          explanation: 'Thí nghiệm đối chứng với mũ trong suốt chứng minh rằng tác nhân che tối (mũ đen) làm mất phản ứng hướng sáng là do ngăn cản ánh sáng tới chóp ngọn, chứ không phải do sức nặng cơ học của mũ.',
        },
      ],
      realWorld: {
        question: 'Tại sao khi nông dân bấm ngọn (cắt chóp sinh trưởng) của cây trồng (như ớt, chè, cúc) thì cây lại đâm nhiều cành ngang?',
        insight: 'Chóp ngọn là nơi sản sinh auxin ức chế chồi bên (ưu thế ngọn). Cắt chóp ngọn làm giảm auxin, giải phóng các chồi bên phát triển thành nhiều cành nhánh xum xuê tăng năng suất.',
      },
    },
    {
      id: 'topic_p3',
      title: '3. Bản chất tín hiệu hóa học (Thí nghiệm Boysen-Jensen)',
      question: 'Tín hiệu từ chóp truyền xuống thân là tín hiệu điện học hay chất hóa học hòa tan khuếch tán?',
      context: 'Peter Boysen-Jensen chèn miếng thạch agar (cho nước thấm qua) hoặc phiến mica (chống thấm) vào dưới chóp ngọn.',
      hypotheses: [
        {
          id: 'h3_1',
          text: 'Tín hiệu là một chất hóa học (Auxin) hòa tan, có thể khuếch tán tự do qua khối thạch Agar nhưng bị chặn bởi phiến Mica.',
          isSupported: true,
        },
        {
          id: 'h3_2',
          text: 'Tín hiệu là xung điện thần kinh truyền dọc theo sợi cơ sinh học.',
          isSupported: false,
        },
      ],
      predictions: [
        { id: 'pred3_1', text: 'Chèn miếng thạch Agar thì cây vẫn giữ được tính hướng sáng; chèn phiến Mica ở phía tối thì cây mất phản ứng uốn cong.' },
      ],
      inquiryQuestions: [
        {
          id: 301,
          question: 'Tại sao khi chèn phiến mica vào phía khuất sáng (shaded side), cây lại không thể uốn cong được?',
          options: [
            'Vì mica chặn dòng vận chuyển của Auxin từ chóp ngọn đi xuống vùng dãn dài ở phía tối',
            'Vì mica làm gãy thân cây',
            'Vì mica hút hết chất dinh dưỡng của đất',
          ],
          correctIndex: 0,
          explanation: 'Phiến mica không cho nước và chất tan thấm qua. Khi chặn dòng auxin ở phía tối, tế bào phía tối không nhận được auxin kích thích dãn dài nên cây không thể uốn cong.',
        },
      ],
      realWorld: {
        question: 'Trong nông nghiệp công nghệ cao, người ta phun thuốc điều hòa sinh trưởng chứa auxin tổng hợp nhằm mục đích gì?',
        insight: 'Auxin tổng hợp (như NAA, 2,4-D ở nồng độ thích hợp) được dùng để kích thích ra rễ cành giâm, kích thích đậu quả không hạt và ngăn rụng hoa/quả non.',
      },
    },
    {
      id: 'topic_p4',
      title: '4. Tác động của dải màu quang phổ ánh sáng',
      question: 'Màu sắc ánh sáng nào kích hoạt phản ứng hướng sáng mạnh nhất?',
      context: 'Chiếu sáng cây mầm bằng ánh sáng Trắng, Xanh lam (Blue), Đỏ (Red) hoặc Tắt đèn.',
      hypotheses: [
        {
          id: 'h4_1',
          text: 'Ánh sáng xanh lam (Blue light 400-500 nm) kích hoạt tính hướng sáng mạnh nhất do sắc tố quang thụ thể Phototropin hấp thụ đỉnh ở dải sóng này.',
          isSupported: true,
        },
        {
          id: 'h4_2',
          text: 'Ánh sáng đỏ (Red light) kích thích mạnh nhất vì có bước sóng dài nhất.',
          isSupported: false,
        },
        {
          id: 'h4_3',
          text: 'Mọi màu sắc ánh sáng đều kích thích hướng sáng như nhau.',
          isSupported: false,
        },
      ],
      predictions: [
        { id: 'pred4_1', text: 'Khi chuyển sang đèn màu Xanh lam, cây sẽ uốn cong với góc lớn nhất; khi chuyển sang đèn Đỏ cây uốn cong rất yếu.' },
      ],
      inquiryQuestions: [
        {
          id: 401,
          question: 'Sắc tố quang thụ thể nào ở thực vật chịu trách nhiệm tiếp nhận ánh sáng xanh lam để định hướng uốn cong?',
          options: [
            'Phototropin 1 và Phototropin 2 (thụ thể flavoprotein hấp thụ ánh sáng xanh)',
            'Diệp lục a (Chlorophyll a)',
            'Carotenoid tạo màu vàng cam',
          ],
          correctIndex: 0,
          explanation: 'Phototropin là thụ thể ánh sáng xanh chuyên biệt gắn trên màng sinh chất. Khi hấp thụ photon xanh lam, phototropin tự phosphoryl hóa và kích hoạt bơm PIN tái phân bố auxin.',
        },
      ],
      realWorld: {
        question: 'Trong các nhà kính trồng rau thông minh, tại sao người ta thường dùng đèn LED kết hợp ánh sáng Xanh lam và Đỏ?',
        insight: 'Ánh sáng đỏ giúp kích thích quang hợp tạo sinh khối tối đa, còn ánh sáng xanh lam điều khiển hình thái thân lá thẳng khỏe, mở khí khổng và hướng sáng tối ưu.',
      },
    },
  ];

  const currentTopic = phototropismInquiryTopics.find((t) => t.id === selectedTopicId) || phototropismInquiryTopics[0];

  // Quizzes list per lab
  const quizzes: Record<LabId, QuizQuestion[]> = {
    phototropism: [
      {
        id: 1,
        question: 'Tại sao thân cây mầm lại uốn cong về phía có ánh sáng chiếu đơn hướng?',
        options: [
          'Tế bào phía sáng nhận nhiều photon nên dãn dài nhanh hơn',
          'Auxin (AIA) bị phân giải ở phía sáng và vận chuyển dồn sang phía tối, kích thích dãn dài tế bào phía tối',
          'Nhiệt độ từ bóng đèn làm khô nước tế bào phía sáng',
          'Lục lạp chỉ quang hợp ở phía sáng kéo thân cây nghiêng theo',
        ],
        correctIndex: 1,
        explanation: 'Dưới tác động của ánh sáng đơn hướng, auxin vận chuyển chủ động sang phía khuất sáng. Nồng độ auxin cao kích hoạt bơm H⁺ dãn thành tế bào, làm tế bào phía tối dãn dài nhanh hơn phía sáng.',
      },
      {
        id: 2,
        question: 'Thí nghiệm cắt bỏ chóp ngọn của Charles Darwin chứng minh điều gì?',
        options: [
          'Chóp ngọn là nơi duy nhất quang hợp tạo chất hữu cơ',
          'Chóp bao lá mầm là nơi tiếp nhận kích thích ánh sáng để truyền tín hiệu xuống vùng dãn dài',
          'Cây không có rễ thì không uốn cong được',
          'Auxin chỉ được tổng hợp ở rễ và chuyển lên ngọn',
        ],
        correctIndex: 1,
        explanation: 'Khi cắt bỏ hoặc che tối chóp ngọn bằng mũ không trong suốt, cây mất hoàn toàn tính hướng sáng. Điều này chứng minh vị trí cảm nhận kích thích ánh sáng chính là chóp bao lá mầm.',
      },
      {
        id: 3,
        question: 'Sắc tố quang thụ thể nào tiếp nhận ánh sáng định hướng cho tính hướng sáng?',
        options: ['Diệp lục a (Chlorophyll a)', 'Phototropin (hấp thụ ánh sáng xanh lam)', 'Carotenoid', 'Phytochrome (hấp thụ ánh sáng đỏ xa)'],
        correctIndex: 1,
        explanation: 'Phototropin 1 và 2 là các flavoprotein cảm nhận ánh sáng xanh lam (blue light 400-500 nm), kích hoạt sự tái phân bố auxin sang phía tối.',
      },
    ],
    photosynthesis: [
      {
        id: 1,
        question: 'Bọt khí thoát ra liên tục từ cành rong đuôi chó trong thí nghiệm là khí gì?',
        options: ['Khí Carbon dioxide (CO₂)', 'Khí Oxy (O₂)', 'Khí Nitơ (N₂)', 'Hơi nước ngưng tụ'],
        correctIndex: 1,
        explanation: 'Khí thoát ra là Oxy (O₂) sinh ra từ quá trình quang phân ly nước tại màng thylakoid trong pha sáng: 2H₂O → 4H⁺ + 4e⁻ + O₂.',
      },
      {
        id: 2,
        question: 'Tại sao khi lắp kính lọc màu Xanh lục (Green), tốc độ thoát bọt khí lại giảm xuống mức tối thiểu?',
        options: [
          'Kính lọc xanh lục làm nóng nước làm rong chết',
          'Hệ sắc tố diệp lục phản xạ hầu hết ánh sáng xanh lục, không hấp thụ để quang hợp',
          'Ánh sáng xanh lục phá hủy phân tử CO₂',
          'Cành rong chỉ thở mà không quang hợp vào ban ngày',
        ],
        correctIndex: 1,
        explanation: 'Diệp lục hấp thụ mạnh nhất ở dải ánh sáng Xanh lam (430-450 nm) và Đỏ (650-680 nm), phản xạ màu xanh lục nên mắt ta thấy lá có màu xanh.',
      },
      {
        id: 3,
        question: 'Nếu tăng nhiệt độ nước lên quá 45°C - 50°C, điều gì sẽ xảy ra với quá trình quang hợp?',
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
    <div className="flex flex-col h-full bg-white/95 border border-slate-200/90 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 backdrop-blur-xl text-slate-800">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200/90 bg-slate-50/90 p-1.5 gap-1 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('controls')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
            activeTab === 'controls'
              ? 'bg-white text-emerald-700 border border-slate-200/90 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
          }`}
        >
          <span>🎛️</span> Điều khiển
        </button>

        <button
          onClick={() => setActiveTab('inquiry')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
            activeTab === 'inquiry'
              ? 'bg-white text-indigo-700 border border-slate-200/90 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
          }`}
        >
          <span>🔬</span> Nghiên cứu
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-white text-sky-700 border border-slate-200/90 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
          }`}
        >
          <span>📈</span> Số liệu
        </button>

        <button
          onClick={() => setActiveTab('mechanism')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
            activeTab === 'mechanism'
              ? 'bg-white text-amber-700 border border-slate-200/90 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
          }`}
        >
          <span>🧬</span> Cơ chế
        </button>

        <button
          onClick={() => setActiveTab('missions')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
            activeTab === 'missions'
              ? 'bg-white text-purple-700 border border-slate-200/90 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
          }`}
        >
          <span>🎯</span> Thử thách
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* TAB 1: CONTROLS */}
        {activeTab === 'controls' && (
          <div className="space-y-4">
            {/* LAB 1: PHOTOTROPISM CONTROLS */}
            {activeLab === 'phototropism' && (
              <>
                {/* Light Angle Slider */}
                <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Góc xoay nguồn sáng (Đèn)</span>
                    <span className="font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 font-bold">{photoState.lightAngle}°</span>
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
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span>-60° (Trái)</span>
                    <span>0° (Đỉnh đầu)</span>
                    <span>+60° (Phải)</span>
                  </div>
                </div>

                {/* Light Intensity */}
                <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Cường độ ánh sáng</span>
                    <span className="font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/80 font-bold">{photoState.lightIntensity}%</span>
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
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                </div>

                {/* Light Spectrum / Color */}
                <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                  <label className="text-xs font-bold text-slate-700">Quang phổ ánh sáng (Màu đèn)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'white', label: 'Trắng', activeClass: 'bg-white text-slate-900 border-slate-400 font-bold shadow-xs' },
                      { id: 'blue', label: 'Xanh lam', activeClass: 'bg-sky-100 text-sky-800 border-sky-400 font-bold shadow-xs' },
                      { id: 'red', label: 'Đỏ', activeClass: 'bg-rose-100 text-rose-800 border-rose-400 font-bold shadow-xs' },
                      { id: 'off', label: 'Tắt đèn', activeClass: 'bg-slate-200 text-slate-700 border-slate-400 font-bold shadow-xs' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() =>
                          onUpdatePhotoState((prev) => ({
                            ...prev,
                            lightColor: c.id as PhototropismState['lightColor'],
                          }))
                        }
                        className={`py-1.5 px-2 rounded-lg text-xs border transition cursor-pointer ${
                          photoState.lightColor === c.id
                            ? `${c.activeClass} ring-2 ring-emerald-500/30`
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    💡 Sắc tố Phototropin hấp thụ mạnh nhất ánh sáng xanh lam (400-500 nm).
                  </p>
                </div>

                {/* Plant Treatment (Darwin Experiments) */}
                <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                  <label className="text-xs font-bold text-slate-700">
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
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs cursor-pointer"
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
                <div className="flex items-center justify-between bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 shadow-xs">
                  <div>
                    <div className="text-xs font-bold text-amber-900">Chế độ X-Ray Phân tử Auxin</div>
                    <div className="text-[10px] text-amber-700 font-medium">Hiển thị các hạt hormone dồn về phía tối</div>
                  </div>
                  <button
                    onClick={() => onUpdatePhotoState((prev) => ({ ...prev, xrayMode: !prev.xrayMode }))}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                      photoState.xrayMode ? 'bg-amber-500 justify-end' : 'bg-slate-300 justify-start'
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
                <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Khoảng cách đèn chiếu sáng</span>
                    <span className="font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 font-bold">{synthState.lampDistance} cm</span>
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
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span>10 cm (Gần - Quang hợp mạnh)</span>
                    <span>100 cm (Xa)</span>
                  </div>
                </div>

                {/* CO2 Concentration (NaHCO3) */}
                <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Nồng độ CO₂ bổ sung (Dung dịch NaHCO₃)</span>
                    <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80 font-bold">{synthState.co2Concentration}%</span>
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
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500 font-medium">
                    NaHCO₃ cung cấp ion HCO₃⁻ phân li giải phóng CO₂ hòa tan trong nước cho cành rong.
                  </p>
                </div>

                {/* Water Temperature */}
                <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Nhiệt độ nước trong bể</span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded border ${
                      synthState.waterTemperature > 40
                        ? 'text-rose-700 bg-rose-50 border-rose-200'
                        : 'text-cyan-700 bg-cyan-50 border-cyan-200'
                    }`}>
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
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span>5°C (Lạnh)</span>
                    <span>30°C (Tối ưu)</span>
                    <span>50°C (Biến tính)</span>
                  </div>
                </div>

                {/* Color Filter */}
                <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                  <label className="text-xs font-bold text-slate-700">Kính lọc màu quang phổ</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'white', label: 'Trắng', activeClass: 'bg-white text-slate-900 border-slate-400 font-bold' },
                      { id: 'blue', label: 'Xanh lam', activeClass: 'bg-sky-100 text-sky-800 border-sky-400 font-bold' },
                      { id: 'red', label: 'Đỏ', activeClass: 'bg-rose-100 text-rose-800 border-rose-400 font-bold' },
                      { id: 'green', label: 'Xanh lục', activeClass: 'bg-emerald-100 text-emerald-800 border-emerald-400 font-bold' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() =>
                          onUpdateSynthState((prev) => ({
                            ...prev,
                            colorFilter: f.id as PhotosynthesisState['colorFilter'],
                          }))
                        }
                        className={`py-1.5 px-2 rounded-lg text-xs border transition cursor-pointer ${
                          synthState.colorFilter === f.id
                            ? `${f.activeClass} ring-2 ring-emerald-500/30 shadow-xs`
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Glowing Splint Combustion Test Button */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/90 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-amber-900">Thí nghiệm Thử que đóm cháy bùng</div>
                      <div className="text-[10px] text-amber-800 font-semibold">Khí O₂ thu được: {Math.round(synthState.collectedO2Volume)}%</div>
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
                      className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs rounded-xl hover:from-amber-600 hover:to-orange-600 shadow-md shadow-orange-500/20 disabled:opacity-50 transition cursor-pointer"
                    >
                      🔥 Thử que đóm
                    </button>
                  </div>
                  {synthState.collectedO2Volume < 25 && (
                    <p className="text-[10px] text-amber-800 font-medium">
                      ⚠️ Cần thu thập ít nhất 25% thể tích khí Oxy để tàn đóm bùng cháy.
                    </p>
                  )}
                </div>

                {/* Reset Gas Tube Button */}
                <button
                  onClick={() => onUpdateSynthState((prev) => ({ ...prev, collectedO2Volume: 0 }))}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs border border-slate-200 transition shadow-xs cursor-pointer"
                >
                  🔄 Đổ đầy nước / Đặt lại ống nghiệm
                </button>

                {/* Dynamic Multi-Factor Relationship Map & Causality Diagram */}
                <PhotosynthesisRelationshipMap
                  state={synthState}
                  onUpdateState={onUpdateSynthState}
                />
              </>
            )}

            {/* LAB 3: HYDROTROPISM CONTROLS */}
            {activeLab === 'hydrotropism' && (
              <>
                {/* Water Source Position */}
                <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                  <label className="text-xs font-bold text-slate-700">Vị trí đặt nguồn cấp ẩm (Nước)</label>
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
                        className={`py-2 px-2 rounded-xl text-xs border transition cursor-pointer ${
                          hydroState.waterSourcePos === pos.id
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-800 font-bold ring-2 ring-emerald-500/20 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 font-medium'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Turn Chamber 90 Degrees (Gravitropism competition) */}
                <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Xoay hộp thí nghiệm (Thử nghiệm trọng lực)</span>
                    <span className="font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 font-bold">{hydroState.boxRotation}°</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onUpdateHydroState((prev) => ({ ...prev, boxRotation: 0 }))}
                      className={`py-2 px-3 rounded-xl text-xs border transition cursor-pointer ${
                        hydroState.boxRotation === 0
                          ? 'bg-sky-100 border-sky-400 text-sky-800 font-bold ring-2 ring-sky-500/20 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 font-medium'
                      }`}
                    >
                      Đặt thẳng đứng (0°)
                    </button>
                    <button
                      onClick={() => onUpdateHydroState((prev) => ({ ...prev, boxRotation: 90 }))}
                      className={`py-2 px-3 rounded-xl text-xs border transition cursor-pointer ${
                        hydroState.boxRotation === 90
                          ? 'bg-amber-100 border-amber-400 text-amber-800 font-bold ring-2 ring-amber-500/20 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 font-medium'
                      }`}
                    >
                      Xoay ngang (90°)
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Khi xoay ngang 90°, hướng trọng lực kích hoạt kéo rễ cắm xuống, đối kháng hoặc hợp lực với hướng nước!
                  </p>
                </div>

                {/* X-Ray Statoliths Toggle */}
                <div className="flex items-center justify-between bg-sky-50/80 p-3.5 rounded-xl border border-sky-200 shadow-xs">
                  <div>
                    <div className="text-xs font-bold text-sky-900">X-Ray Thạch Lạp (Statoliths) chóp rễ</div>
                    <div className="text-[10px] text-sky-700 font-medium">Các hạt tinh bột lắng đọng cảm nhận gia tốc</div>
                  </div>
                  <button
                    onClick={() =>
                      onUpdateHydroState((prev) => ({ ...prev, xrayStatoliths: !prev.xrayStatoliths }))
                    }
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                      hydroState.xrayStatoliths ? 'bg-sky-500 justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-md transform transition" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB: GUIDED SCIENTIFIC INQUIRY (Nghiên cứu & Giả thuyết) */}
        {activeTab === 'inquiry' && (
          <div className="space-y-4">
            {/* Header intro */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200/80 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                <span className="text-base">🔬</span> Phương Pháp Nghiên Cứu Khoa Học
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Học sinh tự chọn <strong>giả thuyết</strong>, <strong>dự đoán</strong> kết quả trước khi chạy mô phỏng, sau đó <strong>đối chiếu với thực tế</strong> và <strong>phân tích nguyên nhân</strong> cơ chế tế bào.
              </p>
            </div>

            {/* Topic Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>📌</span> Chọn Câu Hỏi Nghiên Cứu:
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {phototropismInquiryTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setSelectedTopicId(topic.id);
                      setInquirySaved(false);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex items-center justify-between text-xs ${
                      selectedTopicId === topic.id
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-bold ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{topic.title}</span>
                    {selectedTopicId === topic.id && <span className="text-indigo-600 font-bold text-xs">● Đang xét</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Problem Statement Card */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Câu hỏi nghiên cứu:</div>
              <div className="text-xs font-extrabold text-slate-900 leading-snug">{currentTopic.question}</div>
              <p className="text-[11px] text-slate-500 italic">Bối cảnh: {currentTopic.context}</p>
            </div>

            {/* Step 1: Formulate Hypothesis */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                  Đặt Giả Thuyết Khoa Học (Hypothesis):
                </span>
              </div>
              <p className="text-[10px] text-slate-500">Em hãy chọn giả thuyết mà mình cho là hợp lý nhất để kiểm chứng:</p>

              <div className="space-y-1.5 pt-1">
                {currentTopic.hypotheses.map((h) => {
                  const isSelected = selectedHypothesis[currentTopic.id] === h.id;
                  return (
                    <button
                      key={h.id}
                      onClick={() => setSelectedHypothesis((prev) => ({ ...prev, [currentTopic.id]: h.id }))}
                      className={`w-full text-left p-2.5 rounded-xl text-xs border transition cursor-pointer flex items-start gap-2 ${
                        isSelected
                          ? 'bg-indigo-100 border-indigo-500 text-indigo-950 font-bold ring-1 ring-indigo-400'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center text-[10px] ${isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300'}`}>
                        {isSelected ? '✓' : ''}
                      </span>
                      <span className="flex-1 leading-relaxed">{h.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Prediction */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                  Dự Đoán Kết Quả Thực Nghiệm (Prediction):
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                {currentTopic.predictions.map((p) => {
                  const isSelected = selectedPrediction[currentTopic.id] === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPrediction((prev) => ({ ...prev, [currentTopic.id]: p.id }))}
                      className={`w-full text-left p-2.5 rounded-xl text-xs border transition cursor-pointer flex items-start gap-2 ${
                        isSelected
                          ? 'bg-purple-100 border-purple-500 text-purple-950 font-bold ring-1 ring-purple-400'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center text-[10px] ${isSelected ? 'bg-purple-600 text-white border-purple-600' : 'border-slate-300'}`}>
                        {isSelected ? '✓' : ''}
                      </span>
                      <span className="flex-1 leading-relaxed">{p.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Live Evidence & Comparison */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                  Đối Chiếu Dữ Liệu Thực Nghiệm 3D:
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Thời Gian Thực
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold">Góc nguồn sáng (Đèn):</div>
                  <div className="font-mono text-base font-bold text-amber-600">{photoState.lightAngle}°</div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold">Góc uốn thân thực tế:</div>
                  <div className="font-mono text-base font-bold text-emerald-600">{photoCurrentAngle}°</div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold">Phương pháp xử lý:</div>
                  <div className="text-[11px] font-bold text-slate-800 truncate">{photoState.plantTreatment}</div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold">Màu quang phổ:</div>
                  <div className="text-[11px] font-bold text-sky-600 uppercase">{photoState.lightColor}</div>
                </div>
              </div>

              <button
                onClick={() => {
                  setInquiryChecked((prev) => ({ ...prev, [currentTopic.id]: true }));
                  triggerConfetti();
                }}
                disabled={!selectedHypothesis[currentTopic.id]}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer mt-1"
              >
                🔍 Kiểm Chứng Giả Thuyết & Luận Giải
              </button>

              {inquiryChecked[currentTopic.id] && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <span>✅</span> Kết Luận Kiểm Chứng Thực Nghiệm:
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                    {selectedHypothesis[currentTopic.id] === currentTopic.hypotheses.find((h) => h.isSupported)?.id
                      ? 'Tuyệt vời! Dữ liệu thực nghiệm 3D đã chứng minh giả thuyết của bạn hoàn toàn chính xác. Thân cây uốn cong sinh học do sự tái phân bố hoocmôn Auxin dồn về phía tối.'
                      : 'Kết quả quan sát 3D cho thấy giả thuyết này bị bác bỏ. Thân cây thực tế đã uốn cong theo cơ chế hướng sáng dương dưới sự điều hòa của Auxin.'}
                  </p>
                </div>
              )}
            </div>

            {/* Step 4: Causal Analysis Questions */}
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">4</span>
                  Câu Hỏi Gợi Mở & Phân Tích Nguyên Nhân:
                </span>
              </div>

              <div className="space-y-3">
                {currentTopic.inquiryQuestions.map((q, idx) => (
                  <div key={q.id} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                    <div className="text-xs font-bold text-slate-900 leading-snug">
                      <span className="text-indigo-600">Câu {idx + 1}:</span> {q.question}
                    </div>

                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => {
                        const isAnsSelected = inquiryAnswerSelected[q.id] === optIdx;
                        let btnStyle = 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';

                        if (isAnsSelected) {
                          btnStyle = optIdx === q.correctIndex
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-1 ring-emerald-300'
                            : 'bg-rose-50 border-rose-300 text-rose-800';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => setInquiryAnswerSelected((prev) => ({ ...prev, [q.id]: optIdx }))}
                            className={`w-full text-left p-2 rounded-lg text-xs border transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {isAnsSelected && optIdx === q.correctIndex && <span>✓</span>}
                          </button>
                        );
                      })}
                    </div>

                    {inquiryAnswerSelected[q.id] !== undefined && (
                      <div className="text-[11px] text-slate-700 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200 leading-relaxed font-medium">
                        💡 <strong>Cơ chế sinh học:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Real World Application */}
              <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-purple-900 flex items-center gap-1.5">
                    <span>🌍</span> Vận Dụng Đời Sống Thực Tiễn:
                  </div>
                  {/* Click to reveal button: "Giải đáp" */}
                  <button
                    onClick={() =>
                      setShowRealWorldInsight((prev) => ({
                        ...prev,
                        [currentTopic.id]: !prev[currentTopic.id],
                      }))
                    }
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      showRealWorldInsight[currentTopic.id]
                        ? 'bg-purple-200/80 text-purple-950 border-purple-300 hover:bg-purple-200'
                        : 'bg-white text-purple-700 border-purple-300 hover:bg-purple-100 hover:text-purple-900'
                    }`}
                  >
                    <span>{showRealWorldInsight[currentTopic.id] ? '🔒' : '💡'}</span>
                    <span>{showRealWorldInsight[currentTopic.id] ? 'Ẩn giải đáp' : 'Giải đáp'}</span>
                  </button>
                </div>

                <div className="text-xs font-semibold text-slate-800 leading-snug">
                  {currentTopic.realWorld.question}
                </div>

                {/* Thought input for students before seeing answer */}
                {!showRealWorldInsight[currentTopic.id] && (
                  <div className="space-y-1 pt-0.5">
                    <input
                      type="text"
                      placeholder="Ghi chú suy nghĩ hoặc câu trả lời của bạn..."
                      value={studentUserNotes[currentTopic.id] || ''}
                      onChange={(e) =>
                        setStudentUserNotes((prev) => ({
                          ...prev,
                          [currentTopic.id]: e.target.value,
                        }))
                      }
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                    />
                    <p className="text-[10px] text-purple-700/80 italic">
                      💡 Tự suy nghĩ câu trả lời trước, sau đó bấm nút <strong>"Giải đáp"</strong> ở trên để đối chiếu.
                    </p>
                  </div>
                )}

                {/* Answer / Insight: ONLY SHOWN WHEN USER CLICKS "Giải đáp" */}
                {showRealWorldInsight[currentTopic.id] && (
                  <div className="p-2.5 bg-white/90 rounded-xl border border-purple-200 text-[11px] leading-relaxed text-purple-950 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="font-bold text-purple-800 flex items-center gap-1 text-[11px]">
                      <span>💡</span> Giải đáp khoa học:
                    </div>
                    <p className="text-slate-700">{currentTopic.realWorld.insight}</p>
                    {studentUserNotes[currentTopic.id] && (
                      <div className="mt-1.5 pt-1.5 border-t border-purple-100 text-[10px] text-slate-500">
                        <strong className="text-purple-700">Câu trả lời của bạn:</strong> {studentUserNotes[currentTopic.id]}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Save to Lab Report Button */}
              <button
                onClick={() => {
                  setInquirySaved(true);
                  triggerConfetti();
                }}
                className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-sm hover:from-emerald-700 hover:to-teal-700 transition cursor-pointer"
              >
                {inquirySaved ? '✅ Đã lưu kết quả nghiên cứu vào Sổ tay!' : '💾 Lưu kết quả nghiên cứu vào Sổ tay phòng Lab'}
              </button>
            </div>
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
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Góc lệch thân thực tế</div>
                    <div className="text-lg font-mono font-black text-emerald-600 mt-1">{photoCurrentAngle}°</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Tốc độ phân bố Auxin</div>
                    <div className="text-lg font-mono font-black text-amber-600 mt-1">
                      {photoState.plantTreatment === 'normal' || photoState.plantTreatment === 'transparent_cap'
                        ? '100% Hoạt động'
                        : '0% (Bị chặn)'}
                    </div>
                  </div>
                </>
              )}

              {activeLab === 'photosynthesis' && (
                <>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Tốc độ tạo bọt khí</div>
                    <div className="text-lg font-mono font-black text-sky-600 mt-1">
                      {synthState.bubblesPerMinute} <span className="text-[10px] text-slate-500 font-normal">bpm</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Khí O₂ thu được</div>
                    <div className="text-lg font-mono font-black text-amber-600 mt-1">
                      {Math.round(synthState.collectedO2Volume)}%
                    </div>
                  </div>

                  <div className="col-span-2">
                    <PhotosynthesisRelationshipMap
                      state={synthState}
                      onUpdateState={onUpdateSynthState}
                    />
                  </div>
                </>
              )}

              {activeLab === 'hydrotropism' && (
                <>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Góc uốn của rễ</div>
                    <div className="text-lg font-mono font-black text-emerald-600 mt-1">{hydroCurrentAngle}°</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Tác nhân chiếm ưu thế</div>
                    <div className="text-sm font-bold text-sky-700 mt-1">
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
          <div className="space-y-4 text-xs text-slate-700">
            {activeLab === 'phototropism' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 shadow-xs space-y-2">
                  <h4 className="font-bold text-emerald-800 text-sm">🌿 Cơ chế phân tử Tính Hướng Sáng</h4>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    1. <strong>Cảm nhận ánh sáng:</strong> Thụ thể <em>Phototropin</em> ở chóp ngọn cây hấp thụ photon ánh sáng xanh lam (Blue light).
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    2. <strong>Vận chuyển Auxin:</strong> Dưới kích thích ánh sáng đơn hướng, protein vận chuyển <em>PIN</em> điều hướng dòng phân tử Auxin (AIA) di chuyển chủ động sang tế bào phía khuất sáng (shaded side).
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    3. <strong>Kéo dài tế bào (Thuyết sinh trưởng axit):</strong> Auxin kích hoạt bơm proton H⁺ ra ngoài màng tế bào, làm giảm pH thành tế bào, hoạt hóa enzyme <em>Expansin</em> làm giãn liên kết cellulose. Tế bào phía tối phình dài nhanh hơn, đẩy thân uốn cong về phía nguồn sáng.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 leading-relaxed font-medium">
                  📌 <strong>Kết luận từ thí nghiệm Darwin:</strong> Chóp bao lá mầm là nơi tiếp nhận kích thích ánh sáng. Thân dưới chóp là nơi thực hiện phản ứng uốn cong.
                </div>
              </div>
            )}

            {activeLab === 'photosynthesis' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 shadow-xs space-y-2">
                  <h4 className="font-bold text-sky-800 text-sm">🧪 Cơ chế Sinh hóa Quá trình Quang hợp</h4>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] text-center text-teal-800 font-bold shadow-xs">
                    6CO₂ + 12H₂O + Ánh sáng → C₆H₁₂O₆ + 6O₂ + 6H₂O
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    • <strong>Pha sáng (Thylakoid):</strong> Hạt diệp lục hấp thụ photon giải phóng electron vào chuỗi truyền điện tử, đồng thời xảy ra quang phân ly nước tạo ra khí O₂ thoát ra ngoài và tích trữ năng lượng ATP, NADPH.
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    • <strong>Định luật Blackman về nhân tố hạn chế:</strong> Tốc độ quang hợp bị giới hạn bởi yếu tố ở mức thấp nhất (hoặc ánh sáng, hoặc nồng độ CO₂, hoặc nhiệt độ).
                  </p>
                </div>
              </div>
            )}

            {activeLab === 'hydrotropism' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 shadow-xs space-y-2">
                  <h4 className="font-bold text-emerald-800 text-sm">🌱 Cơ chế Cảm nhận Hướng nước & Trọng lực của Rễ</h4>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    • <strong>Thạch lạp (Statoliths):</strong> Trong chóp rễ có các tế bào chuyên hóa chứa các hạt tinh bột nặng (Statoliths). Trọng lực làm các hạt này lắng xuống đáy tế bào, kích hoạt dòng tín hiệu Auxin.
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    • <strong>Nghịch lý Auxin ở rễ:</strong> Khác với thân, tế bào rễ cực kỳ nhạy cảm với Auxin. Nồng độ auxin cao ở mặt dưới sẽ <strong>ức chế</strong> sự dãn dài tế bào, làm tế bào mặt trên dài nhanh hơn khiến rễ cắm xuống đất (Hướng đất dương).
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-600">
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
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700">
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
                        ? 'bg-purple-50/90 border-purple-200 shadow-xs'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs mt-0.5 ${
                          m.isCompleted
                            ? 'bg-purple-600 text-white font-bold'
                            : 'border-2 border-slate-300 text-transparent'
                        }`}
                      >
                        {m.isCompleted ? '✓' : ''}
                      </div>
                      <div className="flex-1">
                        <div className={`text-xs font-bold ${m.isCompleted ? 'text-purple-900' : 'text-slate-800'}`}>
                          {m.title}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{m.description}</div>
                        {!m.isCompleted && (
                          <div className="text-[10px] text-purple-700 font-medium mt-1 italic">Gợi ý: {m.hint}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Quiz Section */}
            <div className="pt-3 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700">Trắc nghiệm nhanh</h4>
                {quizSubmitted && (
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300 shadow-xs">
                    Điểm: {quizzes[activeLab].filter((q) => selectedAnswers[q.id] === q.correctIndex).length}/
                    {quizzes[activeLab].length}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {quizzes[activeLab].map((q, idx) => (
                  <div key={q.id} className="p-3 bg-slate-50/90 rounded-xl border border-slate-200 space-y-2.5 shadow-xs">
                    <div className="text-xs font-bold text-slate-800 leading-snug">
                      <span className="text-amber-700">Câu {idx + 1}:</span> {q.question}
                    </div>

                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[q.id] === optIdx;
                        let optionStyle = 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-medium';

                        if (quizSubmitted) {
                          if (optIdx === q.correctIndex) {
                            optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold ring-1 ring-emerald-300';
                          } else if (isSelected) {
                            optionStyle = 'bg-rose-50 border-rose-300 text-rose-800 font-medium';
                          }
                        } else if (isSelected) {
                          optionStyle = 'bg-sky-50 border-sky-400 text-sky-800 font-bold ring-1 ring-sky-300';
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={quizSubmitted}
                            onClick={() => setSelectedAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                            className={`w-full text-left p-2 rounded-lg text-xs border transition flex items-center justify-between cursor-pointer ${optionStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && optIdx === q.correctIndex && <span className="font-bold">✓</span>}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="text-[11px] text-slate-700 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200 leading-relaxed font-medium">
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
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
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
