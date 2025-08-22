import React, { useState, useEffect } from "react";
import Image from "next/image";

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
    <section className="mt-29 relative w-full py-40 text-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 ">
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 
                ${index === currentIndex ? "opacity-100" : "opacity-0"}`}
          >
            <Image
              src={img}
              fill
              alt="`slide-${index}`"
              priority={index === 0}
              className="object-cover"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          จองคิวทันตกรรม <br /> ง่ายใน 3 คลิก
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-purple-100">
          ระบบจองคิวทันตกรรมออนไลน์
          <br />
          ที่ช่วยให้คุณจองคิวได้ง่าย ๆ ด้วยระบบอัตโนมัติ
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
            จองคิวทันที
          </button>
          <a href="#AppointmentStep">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
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
