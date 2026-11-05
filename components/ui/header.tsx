import Link from "next/link";
import Logo from "./logo";

export default function Header() {
  return (
    <header className="fixed top-2 z-30 w-full md:top-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative flex h-14 items-center justify-between gap-3 rounded-2xl bg-white/95 px-4 shadow-lg shadow-black/[0.04] backdrop-blur-md border border-gray-200/80">
          <div className="flex items-center">
            <Logo />
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600">
            <Link href="#about" className="transition hover:text-blue-600">
              About Us
            </Link>
            <Link href="#faculty" className="transition hover:text-blue-600">
              Our Teachers
            </Link>
            <Link href="#programs" className="transition hover:text-blue-600">
              Programs
            </Link>
            <Link href="#features" className="transition hover:text-blue-600">
              Methodology
            </Link>
            <Link href="#testimonials" className="transition hover:text-blue-600">
              Reviews
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="#consultation"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              Book Free Trial
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
