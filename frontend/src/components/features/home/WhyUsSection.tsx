import React from "react";
import AppointmentIcon from "../../icons/AppointmentIcon";
import CheckQueueIcon from "../../icons/CheckQueueIcon";
import ChangeAppointment from "../../icons/ChangeAppointment";
function WhyUsSection() {
  return (
    <section className="bg-white py-20" id="why-us">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-10 text-center text-4xl font-semibold text-blue-900">
          ทำไมต้อง ToothToday ?
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="text-center">
            {/* <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center"> */}
            <div className="mx-auto mb-6 flex items-center justify-center">
              <AppointmentIcon className="h-30 w-30" />
            </div>

            <h3 className="mb-4 text-xl font-semibold text-gray-900">
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
            <div className="mx-auto mb-6 flex items-center justify-center">
              <CheckQueueIcon className="h-30 w-30" />
            </div>
            <h3 className="mb-4 text-xl font-semibold text-gray-900">
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
          <div className="text-center">
            <div className="mx-auto mb-6 flex items-center justify-center">
              <ChangeAppointment className="h-30 w-30" />
            </div>
            {/* เลื่อนคิวและ */}
            <h3 className="mb-4 text-xl font-semibold text-gray-900">
              ยกเลิกคิวได้ <span className="text-gray-500"></span>
            </h3>
            <p className="text-gray-600">
              สามารถยกเลิกได้ <br />
              หากมีธุระเร่งด่วนหรือมีกิจกรรมฉุกเฉิน
              {/* เพื่อให้ดูแล <br/>กับความต้องการของคุณ ก่อนใคร */}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyUsSection;
