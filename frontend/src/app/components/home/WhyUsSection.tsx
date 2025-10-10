import React from "react";
import AppointmentIcon from "../icons/AppointmentIcon";
import CheckQueueIcon from "../icons/CheckQueueIcon";
import ChangeAppointment from "../icons/ChangeAppointment";
function WhyUsSection() {
  return (
    <section className="py-20 bg-white " id="why-us">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className=" text-blue-900 text-4xl font-semibold text-center mb-10">
          ทำไมต้อง ToothToday ?
        </h2>

        <div className="grid md:grid-cols-3 gap-8 ">
          <div className="text-center">
           
            {/* <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center"> */}
            <div className="mx-auto flex items-center justify-center mb-6">
              <AppointmentIcon className="w-30 h-30"/>
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
      
            <div className="mx-auto flex items-center justify-center mb-6">
              <CheckQueueIcon className="w-30 h-30"/>
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
            
            <div className="mx-auto flex items-center justify-center mb-6">
              <ChangeAppointment className="w-30 h-30"/>
            </div>
            {/* เลื่อนคิวและ */}
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
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
