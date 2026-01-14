import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Doctor } from "@/app/types/booking";
import api from "@/app/lib/api";

function About() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/doctors");
        setDoctors(res.data);
        // console.log("doc", res.data);
      } catch (error) {
        console.error("Error fetching doctors: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  return (
    <>
      <div className="max-w-5xl mx-auto px-4  space-y-16">
        {/* Section 1: About */}
        <section className="text-center space-y-6">
          {/* <h1 className="text-3xl font-bold text-blue-900">เกี่ยวกับ ToothToday</h1> */}
          <div className="flex items-center justify-center mb-8 h-full w-full">
            <Image
              src={"/images/about/about-img.png"}
              alt=""
              height={400}
              width={500}
              className="border-1 rounded-4xl border-gray-200 h-100 w-200 bg-white object-cover"
            />
          </div>
          <p className="text-gray-700 max-w-2xl mx-auto text-lg">
            ToothToday คือแพลตฟอร์มจองคิวทันตกรรมออนไลน์
            ที่ช่วยให้คุณดูตารางหมอและจองเวลาที่สะดวกได้ง่าย ๆ
            ไม่ต้องโทรหาคลินิกให้เสียเวลา พร้อมระบบแจ้งเตือนล่วงหน้า
            เพื่อให้คุณไม่พลาดคิวนัดสำคัญ
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="bg-blue-50 p-4 rounded-2xl shadow">
              <h3 className="font-semibold text-blue-900">ตารางหมอเรียลไทม์</h3>
              <p className="text-sm text-gray-600">
                อัปเดตสถานะว่างของหมอทุกวัน เลือกเวลาที่เหมาะกับคุณได้เลย
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl shadow">
              <h3 className="font-semibold text-blue-900">จองคิวง่าย</h3>
              <p className="text-sm text-gray-600">
                เพียงไม่กี่คลิกก็จองคิวสำเร็จ ลดปัญหาคิวซ้ำซ้อน
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl shadow">
              <h3 className="font-semibold text-blue-900">แจ้งเตือนคิว</h3>
              <p className="text-sm text-gray-600">
                ระบบส่งแจ้งเตือนก่อนถึงคิว ป้องกันการลืม
              </p>
            </div>
            {/* <div className="bg-blue-50 p-4 rounded-2xl shadow">
            <h3 className="font-semibold text-blue-900">ปลอดภัย</h3>
            <p className="text-sm text-gray-600">
              เก็บข้อมูลด้วยระบบความปลอดภัย มั่นใจได้ในความเป็นส่วนตัว
            </p>
          </div> */}
            <div className="bg-blue-50 p-4 rounded-2xl shadow">
              <h3 className="font-semibold text-blue-900">
                ประสบการณ์ที่ราบรื่น
              </h3>
              <p className="text-sm text-gray-600">
                ดีไซน์เรียบง่าย ใช้งานไม่ซับซ้อน เหมาะสำหรับทุกคน
              </p>
            </div>
          </div>
        </section>
      </div>
      {/* Section 2: Dentists */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-semibold text-blue-900 text-center mb-8">
            ทีมทันตแพทย์ของเรา
          </h2>
          {loading ? "Doctors is loading ..." : ""}

          {/* <div className="grid grid-cols sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 text-center">
            {doctors.map((dentist) => (
              <div
                key={dentist.id}
                // className="bg-white rounded-2xl shadow hover:shadow-lg transition p-3 text-center"
             className="rounded-xl overflow-hidden "
             >
                <Image
                  src={dentist.image_url}
                  alt={dentist.name}
                  width={280}
                  height={300}
                  className=" object-cover rounded-xl mx-auto mb-4 h-[300px]"
                />
                <h3 className="text-lg font-semibold text-blue-900">
                  {dentist.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {dentist.specialization}
                </p>
              </div>
            ))}
          </div> */}
          {/* Desktop / Tablet Grid */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-8">
            {doctors?.map((d, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center text-center"
              >
                <Image
                  src={d.image_url}
                  alt=""
                  width={400}
                  height={400}
                  priority
                  className="rounded-xl mb-4 flex-1"
                />
                <p className="text-blue-900 text-xl font-semibold mb-2">
                  {d.name}
                </p>
                <p className="text-base text-gray-500">{d.specialization}</p>
              </div>
            ))}
          </div>

          {/* Mobile Horizontal Scroll */}
          <div className="lg:hidden flex gap-4 overflow-x-auto py-2 px-1">
            {doctors?.map((d, index) => (
              <div
                key={index}
                className="flex-none w-72 flex flex-col items-center justify-center text-center"
              >
                <Image
                  src={d.image_url}
                  alt=""
                  width={400}
                  height={400}
                  priority
                  className="rounded-xl mb-4"
                />
                <p className="text-blue-900 text-xl font-semibold mb-2">
                  {d.name}
                </p>
                <p className="text-base text-gray-500">{d.specialization}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default About;
