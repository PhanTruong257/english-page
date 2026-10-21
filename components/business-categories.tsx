export default function BusinessCategories() {
  const tracks = [
    {
      title: "Executive & Business Communication",
      level: "Professional Track",
      desc: "Lead international meetings, resolve conflicts constructively, negotiate contracts, and master executive boardroom presence.",
      tag: "Corporate & Management",
      icon: "💼",
    },
    {
      title: "Global Job Interview Mastery",
      level: "Career Breakthrough",
      desc: "Simulate real interviews with native executives using the STAR technique, conquer tough behavioral questions, and negotiate top salaries.",
      tag: "Job Seekers & Tech Leads",
      icon: "🎯",
    },
    {
      title: "Speaking Reflex & Accent Refinement",
      level: "Core Fluency Track",
      desc: "Stop translating in your head. Master American & British phonetic linking, intonation, connected speech, and effortless everyday small talk.",
      tag: "All Proficiency Levels",
      icon: "🗣️",
    },
    {
      title: "Public Speaking & Keynote Presentations",
      level: "Advanced Stage Track",
      desc: "Overcome speaking anxiety, captivate international audiences, handle spontaneous Q&A sessions, and structure high-impact slides.",
      tag: "Founders & Presenters",
      icon: "🎙️",
    },
  ];

  return (
    <section id="programs" className="relative bg-white py-16 md:py-24 border-y border-gray-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl pb-12 text-center md:pb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 mb-4 border border-blue-200/50">
            <span>🎯 Tailored Learning Pathways</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl tracking-tight">
            Comprehensive Communication Programs
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Engineered around realistic conversational scenarios, practical roleplays, and personalized native teacher feedback.
          </p>
        </div>

        {/* Grid cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tracks.map((t, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between rounded-2xl border border-gray-200/90 bg-gray-50/60 p-6 shadow-xs hover:shadow-lg hover:border-blue-300 hover:bg-white transition duration-300"
              data-aos="fade-up"
              data-aos-delay={idx * 100}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{t.icon}</span>
                  <span className="rounded-full bg-blue-100/80 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                    {t.level}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
                  {t.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  {t.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200/70 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">{t.tag}</span>
                <a
                  href="#consultation"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition inline-flex items-center gap-1"
                >
                  Learn More <span>→</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}