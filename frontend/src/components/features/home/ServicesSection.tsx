import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { ServiceWithContent } from "@/types/booking";
import api from "@/lib/api";
function ServicesSection() {
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
  function truncateText(text: string, maxLength: number): string {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  }
  // if (loading) return <p> Service content is loading ...</p>;
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="pb-9 text-center">
          <h2 className="text-4xl font-semibold text-blue-900">บริการของเรา</h2>
        </div>
        {loading ? "Services is loading ..." : ""}
        {/* <div className="grid grid-cols sm:grid-cols-2 md:grid-cols-4 gap-4">
          {servicesContent
            ? servicesContent.slice(0, 4).map((s, index) => (
                <div
                  className="flex flex-col items-center justify-center text-center"
                  key={index}
                >
                  <div className="rounded-xl overflow-hidden">
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
                  <p className="text-base text-gray-500  ">
                    {truncateText(s.content, 113)}
                    {s.content}
                  </p>
                  <button className=" flex items-center justify-center p-2 w-full gap-2 group cursor-pointer">
                    <p className="text-base text-blue-900 ">อ่านต่อ</p>
                    <span className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200  group-hover:border-blue-900 group-active:border-blue-900  transition-colors">
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className=" text-blue-900 "
                      />
                    </span>
                  </button>
                </div>
              ))
            : ""}
        </div> */}
        <div className="hidden gap-4 xl:grid xl:grid-cols-4">
          {servicesContent?.slice(0, 4).map((s, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center text-center"
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
                {s.short_description}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="flex gap-4 overflow-x-auto px-1 py-2 xl:hidden">
          {servicesContent?.slice(0, 4).map((s, index) => (
            <div
              key={index}
              className="flex w-80 flex-none flex-col items-center justify-center text-center"
            >
              <div className="overflow-hidden rounded-xl">
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
              <p className="text-base text-gray-500">{s.content}</p>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-center p-2">
          <Link href="/services" passHref>
            <button className="group flex w-full cursor-pointer items-center justify-center gap-2 p-2">
              <p className="text-base text-blue-900">บริการทั้งหมด</p>
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
    </section>
  );
}

export default ServicesSection;
