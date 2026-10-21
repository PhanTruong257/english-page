import Link from "next/link";
import Logo from "./logo";

export default function Footer({ border = false }: { border?: boolean }) {
  return (
    <footer className="bg-white border-t border-gray-200/80">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className={`grid gap-10 py-10 sm:grid-cols-12 md:py-14 ${border ? "border-t border-gray-200" : ""}`}>
          <div className="space-y-3 sm:col-span-12 lg:col-span-4">
            <div>
              <Logo />
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Apex English Academy is a premier language center dedicated to real-world communication, accent refinement, and career-advancing English fluency guided by certified native educators.
            </p>
            <div className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} Apex English Academy. All rights reserved.
            </div>
          </div>

          <div className="space-y-2 sm:col-span-6 md:col-span-4 lg:col-span-3">
            <h3 className="text-sm font-bold text-gray-900">Programs & Courses</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link className="transition hover:text-blue-600" href="#programs">Executive & Business English</Link></li>
              <li><Link className="transition hover:text-blue-600" href="#programs">Global Job Interview Mastery</Link></li>
              <li><Link className="transition hover:text-blue-600" href="#programs">Accent Refinement & Phonetics</Link></li>
              <li><Link className="transition hover:text-blue-600" href="#programs">Public Speaking & Debate</Link></li>
            </ul>
          </div>

          <div className="space-y-2 sm:col-span-6 md:col-span-4 lg:col-span-3">
            <h3 className="text-sm font-bold text-gray-900">The Academy</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link className="transition hover:text-blue-600" href="#faculty">Meet Our Faculty</Link></li>
              <li><Link className="transition hover:text-blue-600" href="#features">Our Teaching Methodology</Link></li>
              <li><Link className="transition hover:text-blue-600" href="#testimonials">Student Testimonials</Link></li>
              <li><Link className="transition hover:text-blue-600" href="#consultation">Free Speaking Assessment</Link></li>
            </ul>
          </div>

          <div className="space-y-2 sm:col-span-6 md:col-span-4 lg:col-span-2">
            <h3 className="text-sm font-bold text-gray-900">Accreditations</h3>
            <ul className="space-y-2 text-xs text-gray-500">
              <li>✓ Cambridge CELTA/DELTA Faculty</li>
              <li>✓ Interactive 1-on-1 Mentorship</li>
              <li>✓ 100% Spoken Fluency Guarantee</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative -mt-10 h-36 w-full overflow-hidden" aria-hidden="true">
        <div className="pointer-events-none absolute left-1/2 -z-10 -translate-x-1/2 text-center text-[140px] sm:text-[200px] font-extrabold leading-none select-none text-gray-100/70 tracking-tighter">
          Apex Academy
        </div>
      </div>
    </footer>
  );
}
