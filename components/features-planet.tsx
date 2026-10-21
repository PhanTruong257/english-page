import Image from "next/image";
import Avatar01 from "@/public/images/avatar-01.jpg";
import Avatar02 from "@/public/images/avatar-02.jpg";
import Avatar03 from "@/public/images/avatar-03.jpg";
import Avatar05 from "@/public/images/avatar-05.jpg";

export default function FeaturesPlanet() {
  const teachers = [
    {
      name: "Sarah Jenkins, M.Ed",
      origin: "London, United Kingdom 🇬🇧",
      role: "Lead Phonetics & Accent Coach",
      credentials: "Cambridge CELTA & DELTA Certified",
      experience: "10+ Years International Teaching",
      bio: "Specializes in British RP & General American phonetics, connected speech mechanics, and helping ESL professionals eliminate speech hesitation.",
      avatar: Avatar01,
      badge: "Accent Expert",
    },
    {
      name: "David Miller, MBA",
      origin: "California, United States 🇺🇸",
      role: "Head of Executive Communication",
      credentials: "Stanford Exec Ed • Cambridge CELTA",
      experience: "12+ Years Corporate Training",
      bio: "Former corporate communications trainer in Silicon Valley. Mentors engineers, managers, and executives for MNC board meetings and salary negotiations.",
      avatar: Avatar02,
      badge: "Executive Coach",
    },
    {
      name: "Emma Watson-Reed, BA",
      origin: "Toronto, Canada 🇨🇦",
      role: "Conversational Fluency & Interview Mentor",
      credentials: "Univ. of Toronto • Trinity CertTESOL",
      experience: "8+ Years Interview Coaching",
      bio: "Passionate about conversational agility and behavioral interviews. Has guided over 1,500 candidates into Fortune 500 tech & finance roles.",
      avatar: Avatar03,
      badge: "Career Specialist",
    },
    {
      name: "Michael Chang, MA",
      origin: "Melbourne, Australia 🇦🇺",
      role: "Public Speaking & Debate Director",
      credentials: "Univ. of Melbourne • Applied Linguistics",
      experience: "9+ Years Debate & Presentation",
      bio: "Trains leaders in high-stakes stage presence, keynote speech architecture, active listening, and spontaneous audience Q&A handling.",
      avatar: Avatar05,
      badge: "Public Speaking",
    },
  ];

  const academyPillars = [
    {
      title: "100% Certified Native Speakers",
      desc: "Every instructor holds internationally recognized CELTA, DELTA, or Trinity certifications, with at least 5+ years of verified adult teaching experience.",
      icon: "🎓",
    },
    {
      title: "Active Speaking Time (>70%)",
      desc: "No passive lectures. Classes are strictly limited to 1-on-1 or small cohorts (max 4 students) to guarantee you speak for the majority of every session.",
      icon: "⏱️",
    },
    {
      title: "Diagnostic Accent & IPA Coaching",
      desc: "Pinpoint accuracy in vowel length, word linking, rhythm, and final consonant sounds (-s, -ed, -th) through real-time instructor corrections.",
      icon: "🎙️",
    },
    {
      title: "Flexible Hybrid Learning",
      desc: "Learn in our modern communicative academy studios or join live interactive digital classrooms with customized lesson schedules.",
      icon: "🏛️",
    },
  ];

  return (
    <section id="faculty" className="relative py-16 md:py-24 bg-gray-50/70 border-b border-gray-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section title: Faculty */}
        <div className="mx-auto max-w-3xl pb-12 text-center md:pb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 mb-4 border border-blue-200/50">
            <span>✨ World-Class Educators</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl tracking-tight">
            Meet Our Distinguished Native Faculty
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Our educators are not just native speakers—they are certified linguistic mentors who understand how to unlock your conversational confidence.
          </p>
        </div>

        {/* Teachers Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-20">
          {teachers.map((teacher, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col justify-between rounded-2xl bg-white border border-gray-200/90 p-6 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay={idx * 100}
            >
              <div>
                {/* Avatar & origin */}
                <div className="relative mb-5 flex items-center justify-between">
                  <div className="relative">
                    <Image
                      className="h-16 w-16 rounded-2xl object-cover ring-2 ring-blue-100 shadow-md group-hover:scale-105 transition"
                      src={teacher.avatar}
                      width={64}
                      height={64}
                      alt={teacher.name}
                    />
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 border border-blue-200/60">
                    {teacher.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
                  {teacher.name}
                </h3>
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  {teacher.origin}
                </p>
                <div className="mb-3 inline-block rounded-md bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-700">
                  {teacher.role}
                </div>

                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  {teacher.bio}
                </p>
              </div>

              <div className="border-t border-gray-100 pt-3 text-[11px] text-gray-500 space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-gray-700">
                  <span className="text-blue-500">✓</span> {teacher.credentials}
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <span className="text-emerald-500">✓</span> {teacher.experience}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section: Why Apex Academy */}
        <div id="features" className="rounded-3xl bg-white border border-gray-200/90 p-8 md:p-12 shadow-sm">
          <div className="mx-auto max-w-3xl pb-10 text-center">
            <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 mb-3 border border-indigo-200/50">
              🏛️ The Apex Standard
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Why Professionals & Learners Choose Apex Academy
            </h3>
            <p className="mt-2 text-sm md:text-base text-gray-600">
              We eliminate traditional rote learning and focus entirely on communicative agility, active speech production, and real-life scenarios.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {academyPillars.map((p, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-gray-50/70 p-5 border border-gray-100 hover:bg-blue-50/30 transition"
              >
                <div className="text-3xl mb-3">{p.icon}</div>
                <h4 className="font-bold text-gray-900 text-base mb-2">
                  {p.title}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}