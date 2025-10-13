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
                  เลือกประเภทบริการ
                </h3>
                {/* <p className="text-sm text-gray-600 leading-relaxed">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Repellendus pariatur odio ut soluta architecto doloribus vero at facere maiores quia?

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
                  Lorem ipsum dolor sit, amet consectetur adipisicing elit. Repellendus pariatur odio ut soluta architecto doloribus vero at facere maiores quia?

              </p> */}
              </div>
              <div className="text-center">
                <div className="text-5xl md:text-8xl font-black text-yellow-500 mb-4  ">
                  {/* transform -rotate-6 */}3
                </div>
                <h3 className="text-lg md:text-xl font-bold text-blue-900 mb-4">
                  เลือกแพทย์
                </h3>
             
              </div>
              <div className="text-center">
                <div className="text-5xl md:text-8xl font-black text-yellow-500 mb-4  ">
                  {/* transform -rotate-6 */}4
                </div>
                <h3 className="text-lg md:text-xl font-bold text-blue-900 mb-4">
                  ยืนยันการจองและรอแจ้งเตือน
                </h3>
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
        </div>
      </section>
    </>
  );
}

export default AppointmentStep;
