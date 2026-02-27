import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
function AppointmentStep() {
  return (
    <>
      <section className="bg-gray-50 py-20" id="AppointmentStep">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="mb-2 text-3xl font-semibold text-blue-900">
              ใช้งานง่ายใน 1 นาที
            </h2>
            <p className="mb-8 text-lg text-gray-600">
              ระบบใช้งานง่าย ใครๆ ก็สามารถใช้งานได้อย่างง่ายดาย
            </p>
          </div>
          <div className="mb-8 flex h-full items-center justify-center">
            <Image
              src={"/images/booking/book-real2.png"}
              alt=""
              height={500}
              width={800}
              className="rounded-4xl border-1 border-gray-200 bg-white object-cover"
            />
          </div>
          <div
            className="text-center"

            // className="text-center mb-12"
          >
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-0">
              <div className="text-center">
                <div className="mb-4 text-5xl font-black text-yellow-500 md:text-8xl">
                  {/* transform -rotate-10 italic*/}1
                </div>
                <h3 className="mb-4 text-lg font-bold text-blue-900 md:text-xl">
                  เลือกประเภทบริการ
                </h3>
                {/* <p className="text-sm text-gray-600 leading-relaxed">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Repellendus pariatur odio ut soluta architecto doloribus vero at facere maiores quia?

              </p> */}
              </div>
              <div className="text-center">
                <div className="mb-4 text-5xl font-black text-yellow-500 md:text-8xl">
                  {/* transform rotate-12 */}2
                </div>
                <h3 className="mb-4 text-lg font-bold text-blue-900 md:text-xl">
                  เลือกวันและเวลาที่สะดวก
                </h3>
                {/* <p className="text-sm text-gray-600 leading-relaxed">
                  Lorem ipsum dolor sit, amet consectetur adipisicing elit. Repellendus pariatur odio ut soluta architecto doloribus vero at facere maiores quia?

              </p> */}
              </div>
              <div className="text-center">
                <div className="mb-4 text-5xl font-black text-yellow-500 md:text-8xl">
                  {/* transform -rotate-6 */}3
                </div>
                <h3 className="mb-4 text-lg font-bold text-blue-900 md:text-xl">
                  เลือกแพทย์
                </h3>
              </div>
              <div className="text-center">
                <div className="mb-4 text-5xl font-black text-yellow-500 md:text-8xl">
                  {/* transform -rotate-6 */}4
                </div>
                <h3 className="mb-4 text-lg font-bold text-blue-900 md:text-xl">
                  ยืนยันการจองและรอแจ้งเตือน
                </h3>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-center p-2">
              <Link href="/booking" passHref>
                <button className="group flex w-full cursor-pointer items-center justify-center gap-2 p-2">
                  <p className="text-base font-semibold text-blue-900">
                    ไปยังหน้าจองคิว
                  </p>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition-colors group-hover:border-blue-900 group-active:border-blue-900">
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="text-blue-900"
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
