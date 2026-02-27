import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
function HeroSection() {
  const images = [
    "/images/hero-1.jpg",
    "/images/hero-3.jpeg",
    // {hero1},{hero2}
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  //change picture every 5 s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  // const nextSlide = () => {
  //   setCurrentIndex((prev) => (prev + 1) % images.length);
  // };
  // const prevSlide = () => {
  //   setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  // };
  return (
    <section className="relative mt-29 w-full overflow-hidden py-40 text-white">
      {/* Background */}
      <div className="absolute inset-0">
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? "opacity-100" : "opacity-0"}`}
          >
            <Image
              src={img}
              fill
              alt="`slide-${index}`"
              priority={index === 0}
              className="object-cover"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <h1 className="mb-6 text-4xl font-bold md:text-6xl">
          จองคิวทันตกรรม <br /> ง่ายใน 4 คลิก
        </h1>
        <p className="mb-8 text-xl text-purple-100 md:text-2xl">
          ระบบจองคิวทันตกรรมออนไลน์
          <br />
          ที่ช่วยให้คุณจองคิวได้ง่าย ๆ ด้วยระบบอัตโนมัติ
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/booking" passHref>
            <button className="rounded-4xl bg-[#4b8bb7] px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-blue-600">
              จองคิวทันที
            </button>
          </Link>
          <a href="#AppointmentStep">
            <button className="rounded-4xl border border-white bg-transparent px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-amber-200 hover:text-black">
              ดูตัวอย่าง
            </button>
          </a>
        </div>
      </div>
      {/* nav button */}
      {/* <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white p-3 rounded-full z-10"
      >
        &lt;
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full z-10"
      >
        &gt;
      </button> */}
    </section>
  );
}

export default HeroSection;
