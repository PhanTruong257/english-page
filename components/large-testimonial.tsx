import Image from "next/image";
import TestimonialImg from "@/public/images/large-testimonial.jpg";

export default function LargeTestimonial() {
  return (
    <section id="testimonials" className="bg-white py-16 md:py-24 border-t border-gray-100">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/50">
            <span>💬 Alumni Success Story</span>
          </div>

          <div className="relative inline-flex pt-2">
            <Image
              className="rounded-full ring-4 ring-blue-50 shadow-md"
              src={TestimonialImg}
              width={64}
              height={64}
              alt="Alumnus Marcus Nguyen"
            />
          </div>

          <blockquote className="text-xl md:text-2xl font-bold text-gray-900 leading-snug">
            &quot;Before studying at Apex Academy, I dreaded speaking up in regional strategy meetings and always hid behind email. Working 1-on-1 with Instructor David for 8 weeks transformed my confidence. I just pitched our new product line to over 40 global stakeholders without hesitation!&quot;
          </blockquote>

          <div className="text-sm font-medium text-gray-500">
            <span className="text-gray-900 font-semibold">Marcus Nguyen</span>{" "}
            <span className="text-gray-300">/</span>{" "}
            <span className="text-blue-600 font-medium">
              Lead Solutions Architect at Global FinTech
            </span>
          </div>

          <div className="pt-2 flex justify-center text-amber-400 text-sm tracking-widest">
            ★★★★★
          </div>
        </div>
      </div>
    </section>
  );
}