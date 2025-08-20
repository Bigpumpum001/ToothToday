import React from "react";
function WhyUsSection() {
  return (
    <section className="py-20 bg-white ">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className=" text-blue-900 text-4xl font-semibold text-center mb-10">
          ทำไมต้อง ToothToday ?
        </h2>
      
      <div className="grid md:grid-cols-3 gap-8 ">
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
        <div className="text-center ">
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
            สามารถเลื่อนคิวหรือยกเลิกได้ หากมีธุระเร่งด่วน <br/>หรือมีกิจกรรมฉุกเฉิน
            เพื่อให้ดูแล <br/>กับความต้องการของคุณ ก่อนใคร
          </p>
        </div>
      </div>
      </div>
    </section>
  );
}

export default WhyUsSection;
