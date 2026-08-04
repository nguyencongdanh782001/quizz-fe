"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const partners = [
  { name: "Đại học Quốc gia Hà Nội", src: "/images/landing/partner-vnu.png" },
  { name: "Đại học Y Hà Nội", src: "/images/landing/partner-hmu.jpg" },
  { name: "Đại học Kinh tế Quốc dân", src: "/images/landing/partner-neu.png" },
  { name: "Đại học Hà Nội", src: "/images/landing/partner-hanu.png" },
  { name: "Đại học Vinh", src: "/images/landing/partner-vinh.png" },
  {
    name: "Đại học Y Dược Buôn Ma Thuột",
    src: "/images/landing/partner-bmtu.png",
  },
] as const;

const duplicatedPartners = [...partners, ...partners, ...partners, ...partners];

export function LandingPartners() {
  return (
    <section
      className="overflow-hidden bg-white py-10"
      aria-label="Đối tác giáo dục"
    >
      <div className="mx-auto max-w-[1280px] px-5 md:px-8">
        <p className="mb-8 text-center text-base font-extrabold uppercase tracking-wide text-[#111827] sm:text-lg">
          Được tin dùng bởi đối tác trường học và đơn vị giáo dục hàng đầu
        </p>
      </div>

      <div className="relative w-full overflow-hidden py-2">
        {/* Left & Right gradient fade overlay for smooth entering/exiting effect */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-linear-to-r from-white to-transparent sm:w-24 md:w-32" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-linear-to-l from-white to-transparent sm:w-24 md:w-32" />

        <motion.div
          className="flex w-max items-center gap-5 sm:gap-6 md:gap-8"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            ease: "linear",
            duration: 35,
            repeat: Infinity,
          }}
        >
          {duplicatedPartners.map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className="flex h-16 w-24 shrink-0 items-center justify-center sm:w-28 md:w-32"
            >
              <Image
                src={partner.src}
                alt={partner.name}
                width={160}
                height={70}
                draggable={false}
                className="max-h-16 w-auto max-w-[160px] object-contain opacity-90 transition-opacity hover:opacity-100"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
