import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 font-bold text-xl tracking-tight text-gray-900 group"
      aria-label="Apex Academy"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white shadow-md shadow-blue-500/25 transition group-hover:scale-105">
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
          <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
          <path d="M22 10v6" />
          <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="flex items-center leading-none font-extrabold text-gray-900 text-lg">
          Apex<span className="text-blue-600 ml-0.5">Academy</span>
        </span>
        <span className="text-[10px] font-semibold tracking-wider uppercase text-gray-500">
          English Center
        </span>
      </div>
    </Link>
  );
}
