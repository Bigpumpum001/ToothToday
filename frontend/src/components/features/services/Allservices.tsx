import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { ServiceWithContent } from "@/types/booking";
import api from "@/lib/api";

function Allservices() {
  const [servicesContent, setServicesContent] = useState<ServiceWithContent[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/services-with-content");
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
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4">
        {/* <div className="text-center pb-9">
            <h2 className="text-5xl  font-semibold text-blue-900">
              บริการทั้งหมดของเรา
            </h2>
          </div> */}
        {loading ? "Services is loading ..." : ""}
        <div className="grid-cols grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {servicesContent
            ? servicesContent.map((s, index) => (
                <div
                  className="flex h-full flex-col items-center justify-center text-center"
                  key={index}
                >
                  <div className="h-[280px] w-[280px] overflow-hidden rounded-xl">
                    <Image
                      src={s.image_url}
                      alt=""
                      width={280}
                      height={280}
                      priority
                      className="rounded-xl object-cover transition-transform duration-75 ease-in-out hover:scale-105"
                    />
                  </div>

                  <p className="mt-4 mb-2 text-xl font-semibold text-blue-900">
                    {s.title}
                  </p>
                  <p className="flex-grow text-base text-gray-500">
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
