import React from 'react'
import Image from "next/image";

function DoctorsSection() {
  return (
    <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center pb-9">
              <h2 className="text-5xl  font-semibold text-blue-900">ทันตแพทย์ของเรา</h2>
            </div>
            <div className="grid grid-cols sm:grid-cols-2 md:grid-cols-3 gap-8">
              
              <div className="flex flex-col items-center justify-center text-center" >
                
                <Image
                src={"/images/doctors/Ms.Praiya_Wattanasirichoke.png"}
                alt=""
                width={400}
                height={400}
                priority
                className="rounded-xl mb-4"
                />
                
                <p className="text-blue-900 text-xl font-semibold mb-2" >ทพญ.ไปรยา วัฒนาศิริโชค</p>
                <p className="text-base text-gray-500">ทันตกรรมทั่วไป</p>
                </div>
                <div className="flex flex-col items-center justify-center text-center" >
                
                <Image
                src={"/images/doctors/Mr.Pongsak_Kirapirom.png"}
                alt=""
                width={400}
                height={400}
                priority
                className="rounded-xl mb-4"
                />
                
                <p className="text-blue-900 text-xl font-semibold mb-2" >ทพ.พงศ์ศักดิ์ คิราภิรมย์</p>
                <p className="text-base text-gray-500">ทันตกรรมทั่วไป</p>
                </div>
                <div className="flex flex-col items-center justify-center text-center" >
                
                <Image
                src={"/images/doctors/Ms.Nicha_Pamormatee.png"}
                alt=""
                width={400}
                height={400}
                priority
                className="rounded-xl mb-4"
                />
                
                <p className="text-blue-900 text-xl font-semibold mb-2" >ทพญ.ณิชา ภมรเมธี</p>
                <p className="text-base text-gray-500">ทันตกรรมทั่วไป</p>
                </div>
            </div>
          </div>
        </section>
  )
}

export default DoctorsSection
