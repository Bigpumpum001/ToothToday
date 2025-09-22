import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
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
          <div className="flex items-center justify-center mb-8 h-full">
            <Image
              src={"/images/booking/book-real2.png"}
              alt=""
              height={500}
              width={800}
              className="border-1 rounded-4xl border-gray-200 bg-white object-cover   "
            />
          </div>
          <div
            className="text-center "

            // className="text-center mb-12"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-0">
              <div className="text-center">
                <div className="text-5xl md:text-8xl font-black text-yellow-500 mb-4  ">
                  {/* transform -rotate-10 italic*/}1
                </div>
                <h3 className="text-lg md:text-xl font-bold text-blue-900 mb-4">
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
                <div className="text-5xl md:text-8xl font-black text-yellow-500 mb-4  ">
                  {/* transform rotate-12 */}2
                </div>
                <h3 className="text-lg md:text-xl font-bold text-blue-900 mb-4">
                  เลือกวันและเวลาที่สะดวก
                </h3>
                {/* <p className="text-sm text-gray-600 leading-relaxed">
                หาการติดสังเกตเพื่อให้การทาน้ำ : สามารถส่องสาม
                ปานาเพื่อเขียวไปเท่า เพื่อสลายการกริยาสิย : กาลเก็บ
                ออนด์หาง : ทฤดีขนองการกจการ
              </p> */}
              </div>
              <div className="text-center">
                <div className="text-5xl md:text-8xl font-black text-yellow-500 mb-4  ">
                  {/* transform -rotate-6 */}3
                </div>
                <h3 className="text-lg md:text-xl font-bold text-blue-900 mb-4">
                  เลือกแพทย์
                </h3>
                {/* <p className="text-sm text-gray-600 leading-relaxed">
                หาการติดสังเกตเพื่อให้การทาน้ำ : สามารถส่องสาม
                ปานาเพื่อเขียวไปเท่า เพื่อสลายการกริยาสิย : กาลเก็บ
                ออนด์หาง : ทฤดีขนองการกจการ
              </p> */}
              </div>
              <div className="text-center">
                <div className="text-5xl md:text-8xl font-black text-yellow-500 mb-4  ">
                  {/* transform -rotate-6 */}4
                </div>
                <h3 className="text-lg md:text-xl font-bold text-blue-900 mb-4">
                  ยืนยันการจองและรอแจ้งเตือน
                </h3>
                {/* <p className="text-sm text-gray-600 leading-relaxed">
                หาการติดสังเกตเพื่อให้การทาน้ำ : สามารถส่องสาม
                ปานาเพื่อเขียวไปเท่า เพื่อสลายการกริยาสิย : กาลเก็บ
                ออนด์หาง : ทฤดีขนองการกจการ
              </p> */}
              </div>
            </div>
            <div className="mt-2 p-2 flex justify-center items-center">
              <Link href="/booking" passHref>
                <button className=" flex items-center justify-center p-2 w-full gap-2 group cursor-pointer">
                  <p className="text-base text-blue-900 font-semibold">ไปยังหน้าจองคิว</p>
                  <span className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200  group-hover:border-blue-900 group-active:border-blue-900  transition-colors">
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className=" text-blue-900 "
                    />
                  </span>
                </button>
              </Link>
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
