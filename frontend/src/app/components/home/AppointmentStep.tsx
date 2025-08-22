import React from "react";
import Image from "next/image";
function AppointmentStep() {
  return (
    <>
      <section className="py-20 bg-gray-50" id="AppointmentStep">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h2 className="text-blue-900 text-3xl font-semibold mb-2">
              ใช้งานง่ายใน 1 นาที
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              ระบบใช้งานง่าย ใครๆ ก็สามารถใช้งานได้อย่างง่ายดาย
            </p>
          </div>
          <div className="flex items-center justify-center mb-8">
            <Image
            src={"/images/booking/book-demo-crop.png"}
            alt=""
            height={600}
            width={500}
            className="border-1 rounded-4xl border-gray-200 bg-white "
             />
          </div>
          <div 
                    className="text-center "

          // className="text-center mb-12"
          >
            
            <div className="grid grid-cols sm:grid-cols-3 gap-4 md:gap-0">
              <div className="text-center">
                <div className="text-8xl font-black text-yellow-500 mb-4 italic transform -rotate-12">
                  1
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-4">
                  {/* เลือกคลินิกและประเภทการรักษา */}
                  เลือกประเภทบริการ
                </h3>
                {/* <p className="text-sm text-gray-600 leading-relaxed">
                หาการติดสังเกตเพื่อให้การทาน้ำ : สามารถส่องสาม
                ปานาเพื่อเขียวไปเท่า เพื่อสลายการกริยาสิย : กาลเก็บ
                ออนด์หาง : ทฤดีขนองการกจการ
              </p> */}
              </div>
              <div className="text-center">
                <div className="text-8xl font-black text-yellow-500 mb-4 italic transform rotate-12">
                  2
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-4">
                  เลือกวันและเวลาที่สะดวก
                </h3>
                {/* <p className="text-sm text-gray-600 leading-relaxed">
                หาการติดสังเกตเพื่อให้การทาน้ำ : สามารถส่องสาม
                ปานาเพื่อเขียวไปเท่า เพื่อสลายการกริยาสิย : กาลเก็บ
                ออนด์หาง : ทฤดีขนองการกจการ
              </p> */}
              </div>
              <div className="text-center">
                <div className="text-8xl font-black text-yellow-500 mb-4 italic transform -rotate-6">
                  3
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-4">
                  ยืนยันข้อมูล ยืนยันการจองและรอแจ้งเตือน
                </h3>
                {/* <p className="text-sm text-gray-600 leading-relaxed">
                หาการติดสังเกตเพื่อให้การทาน้ำ : สามารถส่องสาม
                ปานาเพื่อเขียวไปเท่า เพื่อสลายการกริยาสิย : กาลเก็บ
                ออนด์หาง : ทฤดีขนองการกจการ
              </p> */}
              </div>
            </div>
          </div>
          
          
          {/* <div className="">
            
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
                      <span className="text-red-600 font-medium">09:30 AM</span>
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
          </div> */}
        </div>
      </section>
    </>
  );
}

export default AppointmentStep;
