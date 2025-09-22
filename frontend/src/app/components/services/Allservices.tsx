import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { ServiceContent } from "@/app/types/booking";
import api from "@/app/lib/api";

function Allservices() {
  const [servicesContent, setServicesContent] = useState<ServiceContent[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/services-content");
        setServicesContent(res.data);
        // console.log(res.data);
      } catch (error) {
        console.error("Error fetching services content: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* <div className="text-center pb-9">
            <h2 className="text-5xl  font-semibold text-blue-900">
              บริการทั้งหมดของเรา
            </h2>
          </div> */}
        {loading ? "Services is loading ..." : ""}
        <div className="grid grid-cols sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {servicesContent
            ? servicesContent.map((s, index) => (
                <div
                  className="flex flex-col items-center justify-center text-center h-full"
                  key={index}
                >
                  <div className="rounded-xl overflow-hidden w-[280px] h-[280px]">
                    <Image
                      src={s.image_url}
                      alt=""
                      width={280}
                      height={280}
                      priority
                      className="object-cover rounded-xl  transition-transform duration-75 ease-in-out hover:scale-105"
                    />
                  </div>

                  <p className="text-blue-900 text-xl font-semibold mt-4 mb-2">
                    {s.title}
                  </p>
                  <p className="text-base text-gray-500  flex-grow">
                    {s.content}

                  </p>
                  {/* <button className=" flex items-center justify-center p-2 w-full gap-2 group cursor-pointer">
                      <p className="text-base text-blue-900 ">อ่านต่อ</p>
                      <span className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200  group-hover:border-blue-900 group-active:border-blue-900  transition-colors">
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          className=" text-blue-900 "
                        />
                      </span>
                    </button> */}
                </div>
              ))
            : ""}
        </div>
      </div>
    </section>
  );
}

export default Allservices;
