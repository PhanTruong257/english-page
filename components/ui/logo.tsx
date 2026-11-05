import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 font-bold text-xl tracking-tight text-white group"
      aria-label="BioLab 3D"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/25 transition group-hover:scale-105">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 21h10" />
          <path d="M12 21a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 9.6 5 11.5 5 14a7 7 0 0 0 7 7z" />
          <path d="M12 11v6" />
          <path d="M10 14h4" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="flex items-center leading-none font-extrabold text-white text-lg tracking-wide">
          Bio<span className="text-emerald-400 ml-0.5">Lab 3D</span>
        </span>
        <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-400/80">
          Phòng thí nghiệm ảo
        </span>
      </div>
    </Link>
  );
}
