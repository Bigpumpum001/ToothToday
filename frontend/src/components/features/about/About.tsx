import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Doctor } from "@/types/booking";
import api from "@/lib/api";

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
      <div className="mx-auto max-w-5xl space-y-16 px-4">
        {/* Section 1: About */}
        <section className="space-y-6 text-center">
          {/* <h1 className="text-3xl font-bold text-blue-900">เกี่ยวกับ ToothToday</h1> */}
          <div className="mb-8 flex h-full w-full items-center justify-center">
            <Image
              src={"/images/about/about-img.png"}
              alt=""
              height={400}
              width={500}
              className="h-100 w-200 rounded-4xl border-1 border-gray-200 bg-white object-cover"
            />
          </div>
          <p className="mx-auto max-w-2xl text-lg text-gray-700">
            ToothToday คือแพลตฟอร์มจองคิวทันตกรรมออนไลน์
            ที่ช่วยให้คุณดูตารางหมอและจองเวลาที่สะดวกได้ง่าย ๆ
            ไม่ต้องโทรหาคลินิกให้เสียเวลา พร้อมระบบแจ้งเตือนล่วงหน้า
            เพื่อให้คุณไม่พลาดคิวนัดสำคัญ
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-blue-50 p-4 shadow">
              <h3 className="font-semibold text-blue-900">ตารางหมอเรียลไทม์</h3>
              <p className="text-sm text-gray-600">
                อัปเดตสถานะว่างของหมอทุกวัน เลือกเวลาที่เหมาะกับคุณได้เลย
              </p>
            </div>
            <div className="rounded-2xl bg-blue-50 p-4 shadow">
              <h3 className="font-semibold text-blue-900">จองคิวง่าย</h3>
              <p className="text-sm text-gray-600">
                เพียงไม่กี่คลิกก็จองคิวสำเร็จ ลดปัญหาคิวซ้ำซ้อน
              </p>
            </div>
            <div className="rounded-2xl bg-blue-50 p-4 shadow">
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
            <div className="rounded-2xl bg-blue-50 p-4 shadow">
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
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-8 text-center text-4xl font-semibold text-blue-900">
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
          <div className="hidden gap-8 lg:grid lg:grid-cols-3">
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
                  className="mb-4 flex-1 rounded-xl"
                />
                <p className="mb-2 text-xl font-semibold text-blue-900">
                  {d.name}
                </p>
                <p className="text-base text-gray-500">{d.specialization}</p>
              </div>
            ))}
          </div>

          {/* Mobile Horizontal Scroll */}
          <div className="flex gap-4 overflow-x-auto px-1 py-2 lg:hidden">
            {doctors?.map((d, index) => (
              <div
                key={index}
                className="flex w-72 flex-none flex-col items-center justify-center text-center"
              >
                <Image
                  src={d.image_url}
                  alt=""
                  width={400}
                  height={400}
                  priority
                  className="mb-4 rounded-xl"
                />
                <p className="mb-2 text-xl font-semibold text-blue-900">
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
