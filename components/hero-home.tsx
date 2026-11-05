import Image from "next/image";
import PageIllustration from "@/components/page-illustration";
import Avatar01 from "@/public/images/avatar-01.jpg";
import Avatar02 from "@/public/images/avatar-02.jpg";
import Avatar03 from "@/public/images/avatar-03.jpg";
import Avatar04 from "@/public/images/avatar-04.jpg";
import Avatar05 from "@/public/images/avatar-05.jpg";
import Avatar06 from "@/public/images/avatar-06.jpg";

export default function HeroHome() {
  return (
    <section id="about" className="relative">
      <PageIllustration />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero content */}
        <div className="pb-12 pt-32 md:pb-20 md:pt-40">
          {/* Section header */}
          <div className="pb-12 text-center md:pb-16">
            <div
              className="mb-6 border-y [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-300/.8),transparent)1]"
              data-aos="zoom-y-out"
            >
              <div className="flex flex-col items-center justify-center py-2 gap-2">
                <div className="-mx-0.5 flex justify-center -space-x-2.5">
                  <Image
                    className="box-content rounded-full border-2 border-white shadow-xs"
                    src={Avatar01}
                    width={32}
                    height={32}
                    alt="Instructor"
                  />
                  <Image
                    className="box-content rounded-full border-2 border-white shadow-xs"
                    src={Avatar02}
                    width={32}
                    height={32}
                    alt="Instructor"
                  />
                  <Image
                    className="box-content rounded-full border-2 border-white shadow-xs"
                    src={Avatar03}
                    width={32}
                    height={32}
                    alt="Instructor"
                  />
                  <Image
                    className="box-content rounded-full border-2 border-white shadow-xs"
                    src={Avatar04}
                    width={32}
                    height={32}
                    alt="Instructor"
                  />
                  <Image
                    className="box-content rounded-full border-2 border-white shadow-xs"
                    src={Avatar05}
                    width={32}
                    height={32}
                    alt="Instructor"
                  />
                  <Image
                    className="box-content rounded-full border-2 border-white shadow-xs"
                    src={Avatar06}
                    width={32}
                    height={32}
                    alt="Instructor"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                  <span className="flex text-amber-400">★★★★★</span>
                  <span>
                    Rated 4.9/5 by over <strong>12,000+ confident graduates</strong>
                  </span>
                </div>
              </div>
            </div>

            <h1
              className="mb-6 border-y text-4xl font-extrabold tracking-tight text-gray-900 [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-300/.8),transparent)1] sm:text-5xl md:text-6xl"
              data-aos="zoom-y-out"
              data-aos-delay={150}
            >
              Master Fluent English Speaking With <br className="max-lg:hidden" />
              <span className="text-blue-600">Certified Native Instructors</span>
            </h1>

            <div className="mx-auto max-w-3xl">
              <p
                className="mb-8 text-lg text-gray-600 leading-relaxed"
                data-aos="zoom-y-out"
                data-aos-delay={300}
              >
                Welcome to <strong>Apex English Academy</strong>. Stop memorizing boring grammar rules.
                Train your speaking reflexes with international educators through personalized 1-on-1 coaching,
                interactive conversational workshops, and accent refinement.
              </p>
              <div className="relative before:absolute before:inset-0 before:border-y before:[border-image:linear-gradient(to_right,transparent,--theme(--color-slate-300/.8),transparent)1]">
                <div
                  className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center gap-4 py-2"
                  data-aos="zoom-y-out"
                  data-aos-delay={450}
                >
                  <a
                    className="group mb-3 inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition sm:mb-0 sm:w-auto"
                    href="#consultation"
                  >
                    <span>Book a Free Trial Session</span>
                    <span className="ml-1 tracking-normal text-blue-200 transition-transform group-hover:translate-x-1">
                      -&gt;
                    </span>
                  </a>
                  <a
                    className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition sm:w-auto"
                    href="#faculty"
                  >
                    Meet Our Faculty
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Academy Showcase Card */}
          <div
            className="mx-auto max-w-4xl"
            data-aos="zoom-y-out"
            data-aos-delay={600}
          >
            <div className="relative rounded-2xl bg-white border border-gray-200/90 p-6 md:p-8 shadow-2xl shadow-blue-500/10">
              {/* Header inside card */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900">
                      Live Academy Demo Classroom
                    </h4>
                    <p className="text-xs text-gray-500">
                      Interactive 1-on-1 English Communication Coaching
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Native Teachers Online Now
                </div>
              </div>

              {/* Dialogue / Classroom simulation */}
              <div className="space-y-4 rounded-xl bg-gray-50/75 p-4 md:p-6 border border-gray-100">
                {/* Teacher message */}
                <div className="flex items-start gap-3">
                  <Image
                    className="h-10 w-10 rounded-full border-2 border-white shadow-xs shrink-0"
                    src={Avatar02}
                    width={40}
                    height={40}
                    alt="Teacher David"
                  />
                  <div className="rounded-2xl rounded-tl-none bg-blue-600 p-4 text-white shadow-xs max-w-xl">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-blue-100">
                        Instructor David Miller, M.Ed (UK)
                      </span>
                      <span className="text-[10px] text-blue-200">Head of Fluency</span>
                    </div>
                    <p className="text-sm leading-relaxed">
                      &quot;Welcome, Alex! Today we are practicing how to pitch your tech project to international stakeholders. Notice how connecting words like &apos;furthermore&apos; and &apos;as a result&apos; help your ideas flow effortlessly.&quot;
                    </p>
                  </div>
                </div>

                {/* Student message */}
                <div className="flex items-start justify-end gap-3">
                  <div className="rounded-2xl rounded-tr-none bg-white p-4 text-gray-800 shadow-sm border border-gray-200/80 max-w-xl">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-900">
                        Alex Nguyen (Student)
                      </span>
                      <span className="text-[10px] text-gray-400">Audio Recorded</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      &quot;Thank you, David! Could you please check my pronunciation of &apos;strategy&apos; and &apos;collaborative&apos;? I used to hesitate on syllable stress.&quot;
                    </p>
                  </div>
                  <Image
                    className="h-10 w-10 rounded-full border-2 border-white shadow-xs shrink-0"
                    src={Avatar04}
                    width={40}
                    height={40}
                    alt="Student"
                  />
                </div>

                {/* Live Feedback bar */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-emerald-50 border border-emerald-200/80 px-4 py-2.5 text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-700">✓ Real-time Teacher Feedback:</span>
                    <span>Intonation & Rhythm: 96% | Natural Stress on &apos;STRAT-e-gy&apos; perfected!</span>
                  </div>
                  <span className="font-semibold text-emerald-600">Immediate Correction</span>
                </div>
              </div>

              {/* Academy Credentials row */}
              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 sm:grid-cols-4 text-center">
                <div className="p-2">
                  <div className="text-2xl font-extrabold text-blue-600">100%</div>
                  <div className="text-xs font-medium text-gray-500">CELTA / DELTA Certified</div>
                </div>
                <div className="p-2">
                  <div className="text-2xl font-extrabold text-blue-600">1:1 & 1:4</div>
                  <div className="text-xs font-medium text-gray-500">Intensive Small Classes</div>
                </div>
                <div className="p-2">
                  <div className="text-2xl font-extrabold text-blue-600">12,000+</div>
                  <div className="text-xs font-medium text-gray-500">Graduates Empowered</div>
                </div>
                <div className="p-2">
                  <div className="text-2xl font-extrabold text-blue-600">98%</div>
                  <div className="text-xs font-medium text-gray-500">Pass & Fluency Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}