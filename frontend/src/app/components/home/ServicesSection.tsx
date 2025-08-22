import React from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
function ServicesSection() {
  const images = [
    "/images/blog-1.png"
  ]
  function truncateText(text: string, maxLength: number): string{
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  }
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center pb-9">
          <h2 className="text-5xl  font-semibold text-blue-900">บริการของเรา</h2>
        </div>
        <div className="grid grid-cols sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center justify-center text-center" >
            <div className="rounded-xl overflow-hidden">
              <Image
              src={"/images/services-pic/dental_care2.png"}
              alt=""
              width={280}
              height={280}
              priority
              className="object-cover rounded-xl  transition-transform duration-75 ease-in-out hover:scale-105"
            />
            </div>
            

            <p className="text-blue-900 text-xl font-semibold mt-4 mb-2" >จัดฟัน</p>
            <p className="text-base text-gray-500  ">
              {truncateText(`การจัดฟันเป็นวิธีการปรับตำแหน่งฟันและขากรรไกรให้เหมาะสม ช่วยแก้ปัญหาฟันซ้อน ฟันเก ฟันยื่น หรือการสบฟันที่ผิดปกติ นอกจากช่วยให้การบดเคี้ยวมีประสิทธิภาพมากขึ้น ยังช่วยเสริมบุคลิกภาพและความมั่นใจในรอยยิ้มอีกด้วย
                `, 113)}
            </p>
            <button className=" flex items-center justify-center p-2 w-full gap-2 group cursor-pointer">
              <p className="text-base text-blue-900 ">อ่านต่อ</p>
              <span className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200  group-hover:border-blue-900 group-active:border-blue-900  transition-colors">
                <FontAwesomeIcon icon={faArrowRight} className=" text-blue-900 " />

              </span>
            </button>
          </div>
          <div className="flex flex-col items-center justify-center text-center" >

            <div className="rounded-xl overflow-hidden">
              <Image
              src={"/images/services-pic/cosmetic_dentistry.png"}
              alt=""
              width={280}
              height={280}
              priority
              className="object-cover rounded-xl  transition-transform duration-75 ease-in-out hover:scale-105"
            />
            </div>

            <p className="text-blue-900 text-xl font-semibold mt-4 mb-2" >ทันตกรรมเพื่อความสวยงาม
            </p>
            <p className="text-base text-gray-500">
              {truncateText(`ทันตกรรมเพื่อความสวยงามมุ่งเน้นไปที่การปรับปรุงรูปลักษณ์ของฟันและรอยยิ้ม ไม่ว่าจะเป็นการฟอกสีฟัน การเคลือบผิวฟัน หรือการปรับแต่งรูปฟัน เพื่อสร้างรอยยิ้มที่สวยงามและเป็นธรรมชาติ สะท้อนบุคลิกภาพที่มั่นใจของคุณ
`, 113)}
            </p>
            <button className=" flex items-center justify-center p-2 w-full gap-2 group cursor-pointer">
              <p className="text-base text-blue-900 ">อ่านต่อ</p>
              <span className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200  group-hover:border-blue-900 group-active:border-blue-900  transition-colors">
                <FontAwesomeIcon icon={faArrowRight} className=" text-blue-900 " />

              </span>
            </button>
          </div>
          <div className="flex flex-col items-center justify-center text-center" >

            <div className="rounded-xl overflow-hidden">
              <Image
              src={"/images/services-pic/dentures.png"}
              alt=""
              width={280}
              height={280}
              priority
              className="object-cover rounded-xl  transition-transform duration-75 ease-in-out hover:scale-105"
            />
            </div>

            <p className="text-blue-900 text-xl font-semibold mt-4 mb-2" >รากฟันเทียม - ฟันปลอม
            </p>
            <p className="text-base text-gray-500">
              {truncateText(`รากฟันเทียมและฟันปลอมเป็นทางเลือกในการทดแทนฟันที่สูญเสียไป โดยรากฟันเทียมจะยึดติดกับกระดูกขากรรไกรอย่างมั่นคง ทำให้ใช้งานได้ใกล้เคียงฟันธรรมชาติ ส่วนฟันปลอมเป็นอีกหนึ่งวิธีที่ช่วยฟื้นฟูการเคี้ยว พูด และความมั่นใจในการใช้ชีวิตประจำวัน`, 113)}
            </p>
            <button className=" flex items-center justify-center p-2 w-full gap-2 group cursor-pointer">
              <p className="text-base text-blue-900 ">อ่านต่อ</p>
              <span className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200  group-hover:border-blue-900 group-active:border-blue-900   transition-colors">
                <FontAwesomeIcon icon={faArrowRight} className=" text-blue-900 " />

              </span>
            </button>
          </div>
          <div className="flex flex-col items-center justify-center text-center" >

            <div className="rounded-xl overflow-hidden">
              <Image
              src={"/images/services-pic/dental_general.png"}
              alt=""
              width={280}
              height={280}
              priority
              className="object-cover rounded-xl  transition-transform duration-75 ease-in-out hover:scale-105"
            />
            </div>

            <p className="text-blue-900 text-xl font-semibold mt-4 mb-2" >ทันตกรรมทั่วไป
            </p>
            <p className="text-base text-gray-500">
              {truncateText(`ทันตกรรมทั่วไปครอบคลุมการดูแลพื้นฐานด้านสุขภาพช่องปาก เช่น การขูดหินปูน อุดฟัน ถอนฟัน และการตรวจสุขภาพฟันประจำปี เพื่อป้องกันปัญหาฟันผุและโรคเหงือก ช่วยรักษาสุขภาพช่องปากให้แข็งแรงในระยะยาว`, 100)}
            </p>
            <button className=" flex items-center justify-center p-2 w-full gap-2 group cursor-pointer">
              <p className="text-base text-blue-900 ">อ่านต่อ</p>
              <span className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200  group-hover:border-blue-900 group-active:border-blue-900   transition-colors">
                <FontAwesomeIcon icon={faArrowRight} className=" text-blue-900 " />

              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
