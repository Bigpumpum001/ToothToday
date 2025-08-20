import React from "react";
import Image from "next/image";
function ServicesSection() {
    const images = [
        "/images/blog-1.png"
    ] 
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center pb-9">
          <h2 className="text-5xl  font-semibold text-blue-900">บริการของเรา</h2>
        </div>
        <div className="grid grid-cols sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center justify-center text-center" >
            
            <Image
            src={"/images/blog-1.png"}
            alt=""
            width={280}
            height={280}
            priority
            className="rounded-xl mb-4"
            />
            
            <p className="text-blue-900 text-xl font-semibold mb-2" >จัดฟัน</p>
            <p className="text-base text-gray-500">การจัดฟันเป็นหนึ่งในบริการที่สำคัญและได้รับความนิยมอย่างสูงในคลินิกทันตกรรมเมตา</p>
            </div>
          <div className="flex flex-col items-center justify-center text-center" >
            
            <Image
            src={"/images/blog-2.png"}
            alt=""
            width={280}
            height={280}
            priority
            className="rounded-xl mb-4"
            />
            
            <p className="text-blue-900 text-xl font-semibold mb-2" >ทันตกรรมเพื่อความสวยงาม
</p>
            <p className="text-base text-gray-500">ทันตกรรมเพื่อความสวยงามคือการผสมผสานระหว่างวิทยาศาสตร์และศิลปะในการ</p>
            </div>
            <div className="flex flex-col items-center justify-center text-center" >
            
            <Image
            src={"/images/blog-3.png"}
            alt=""
            width={280}
            height={280}
            priority
            className="rounded-xl mb-4"
            />
            
            <p className="text-blue-900 text-xl font-semibold mb-2" >รากฟันเทียม - ฟันปลอม
</p>
            <p className="text-base text-gray-500">การสูญเสียฟันสามารถส่งผลกระทบต่อการพูด การเคี้ยวอาหาร และความมั่นใจในตัวเอง</p>
            </div>
            <div className="flex flex-col items-center justify-center text-center" >
            
            <Image
            src={"/images/blog-4.png"}
            alt=""
            width={280}
            height={280}
            priority
            className="rounded-xl mb-4"
            />
            
            <p className="text-blue-900 text-xl font-semibold mb-2" >ทันตกรรมทั่วไป
</p>
            <p className="text-base text-gray-500">ทันตกรรมทั่วไปเป็นพื้นฐานสำคัญของการดูแลสุขภาพช่องปาก เพื่อป้องกันและรักษา</p>
            </div>
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
