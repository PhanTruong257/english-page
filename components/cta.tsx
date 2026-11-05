"use client";

import Image from "next/image";
import Stripes from "@/public/images/stripes-dark.svg";

export default function Cta() {
  return (
    <section id="consultation" className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div
          className="relative overflow-hidden rounded-3xl text-center shadow-2xl before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-3xl before:bg-blue-600 px-6 py-14 md:px-12 md:py-20"
          data-aos="zoom-y-out"
        >
          {/* Glow */}
          <div
            className="absolute bottom-0 left-1/2 -z-10 -translate-x-1/2 translate-y-1/2"
            aria-hidden="true"
          >
            <div className="h-64 w-[520px] rounded-full border-[24px] border-blue-400 blur-3xl opacity-40" />
          </div>

          {/* Stripes */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2 transform opacity-30"
            aria-hidden="true"
          >
            <Image
              className="max-w-none"
              src={Stripes}
              width={768}
              height={432}
              alt="Background pattern"
            />
          </div>

          <div className="mx-auto max-w-2xl">
            <span className="inline-block rounded-full bg-blue-500/30 px-3.5 py-1 text-xs font-semibold text-white mb-4 border border-blue-400/40">
              🎓 Complimentary Speaking Evaluation
            </span>

            <h2 className="mb-4 text-3xl font-extrabold text-white md:text-5xl tracking-tight">
              Ready to Speak English with Unshakable Confidence?
            </h2>

            <p className="mb-8 text-base md:text-lg text-blue-100 leading-relaxed">
              Book a free 20-minute diagnostic session with one of our certified native instructors. Receive an instant fluency report and a customized learning roadmap.
            </p>

            <div className="mx-auto max-w-md">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert(
                    "Thank you for registering! Our academic advisor will contact you within 24 hours to confirm your speaking assessment."
                  );
                }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="text"
                  placeholder="Enter your email or phone number..."
                  required
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-white shadow-sm"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-black transition cursor-pointer"
                >
                  Book Free Assessment
                </button>
              </form>
              <p className="mt-3 text-xs text-blue-200">
                🔒 No credit card required. 100% confidential.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}