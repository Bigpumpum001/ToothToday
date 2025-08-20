import React, { useState, useEffect } from "react";
import Image from "next/image";
import hero1 from "/public/images/hero-1.jpg";
import hero2 from "/public/images/hero-2.jpg";
const Queue4Dentist = () => {
  const images = [
    "/images/hero-1.jpg",
    "/images/hero-2.jpg",
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

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-teal-500 text-white px-3 py-1 rounded text-sm font-medium">
                Queue4Dentist
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a
                  href="#"
                  className="text-gray-900 hover:text-teal-600 px-3 py-2 text-sm font-medium"
                >
                  Home
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-teal-600 px-3 py-2 text-sm font-medium"
                >
                  Queue
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-teal-600 px-3 py-2 text-sm font-medium"
                >
                  Profile
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-teal-600 px-3 py-2 text-sm font-medium"
                >
                  Contact Us
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-teal-600 px-3 py-2 text-sm font-medium"
                >
                  Login
                </a>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative w-full h-screen text-white overflow-hidden">
        {/* Background Images */}
        <div className="absolute inset-0">
          {images.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={img}
                fill
                alt="`slide-${index}`"
                priority={index === 0}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            จองคิวทันตกรรม
            <br />
            ง่ายใน 3 คลิก
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-purple-100">
            ระบบจองคิวทันตกรรมออนไลน์ครั้งแรก
            <br />
            ที่ช่วยให้คุณจองคิวได้ง่าย ๆ ด้วยระบบอัตโนมัติอัจฉริยะ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
              จองคิวทันที
            </button>
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
              ดูตัวอย่าง
            </button>
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full z-10"
        >
          ◀
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full z-10"
        >
          ▶
        </button>
      </section>
      {/* <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            จองคิวทันตกรรม
            <br />
            ง่ายใน 3 คลิก
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-purple-100">
            ระบบจองคิวทันตกรรมออนไインครั้งแรก
            <br />
            ที่ช่วยให้คุณจองคิวได้ง่าย ๆ ด้วยระบบอัตโนมัติอัจฉริยะ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
              จองคิวทันที
            </button>
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
              ดูตัวอย่าง
            </button>
          </div>
        </div>
      </section> */}

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            ทำไมต้อง Queue4Dentist
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                จองคิว 24/7
              </h3>
              <p className="text-gray-600">
                ไม่ต้องรอแค่เวลาทำการ
                <br />
                จองคิวได้ตลอด 24 ชั่วโมง
                <br />
                ด้วยระบบออนไลน์
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                เช็คคิวได้ตลอดเวลา
              </h3>
              <p className="text-gray-600">
                ดูสถานะคิวปัจจุบันได้ทุกที่ทุกเวลา
                <br />
                ไม่ต้องโทรถามคลินิก
                <br />
                ทำให้รู้ว่าต้อง รอนานแค่ไหน
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-5 5v-5zM9 7H4l5-5v5zm11 3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                เลื่อนคิวและยกเลิกได้
              </h3>
              <p className="text-gray-600">
                สามารถเลื่อนคิวหรือยกเลิกได้
                <br />
                หากมีธุระเร่งด่วน
                <br />
                หรือมีกิจกรรมฉุกเฉิน เพื่อให้ดูแล กับความต้องการของคุณ ก่อนใคร
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                ใช้งานง่ายใน 1 นาที
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                ระบบใช้งานง่าย ใครๆ ก็สามารถใช้งานได้อย่างง่ายดาย
              </p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      เลือกคลินิกและประเภทการรักษา
                    </h4>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      เลือกวันและเวลาที่สะดวก
                    </h4>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      ยืนยันข้อมูล ยืนยันการจองและรอแจ้งเตือน
                    </h4>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Mockup */}
            <div className="relative">
              <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
                <div className="bg-gray-100 p-4 border-b">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">คิวของฉัน</h3>
                    <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm">
                      กำลังรอ
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">คิว #15</span>
                        <span className="text-red-600 font-medium">
                          09:30 AM
                        </span>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">คิว #16</span>
                        <span className="text-yellow-600 font-medium">
                          10:00 AM
                        </span>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">คิว #17</span>
                        <span className="text-green-600 font-medium">
                          10:30 AM
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <div className="text-center text-sm text-gray-500">
                      เวลารอโดยประมาณ: 25 นาที
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="bg-teal-500 text-white px-3 py-1 rounded text-sm font-medium inline-block mb-4">
                Queue4Dentist
              </div>
              <p className="text-gray-400 text-sm">
                ระบบจองคิวทันตกรรมออนไลน์
                <br />
                ที่ใช้งานง่ายและสะดวกที่สุด
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">บริการ</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    จองคิวออนไลน์
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    ตรวจสอบคิว
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    จัดการคิว
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">สำหรับคลินิก</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    ลงทะเบียนคลินิก
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    จัดการระบบ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    รายงาน
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">ติดต่อเรา</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>โทร: 02-xxx-xxxx</li>
                <li>อีเมล: info@queue4dentist.com</li>
                <li>Line: @queue4dentist</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Queue4Dentist. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Queue4Dentist;
