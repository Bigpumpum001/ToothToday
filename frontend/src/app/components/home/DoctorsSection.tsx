import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Doctor } from "@/app/types/booking";
import api from "@/app/lib/api";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
function DoctorsSection() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/doctors");
        setDoctors(res.data);
        // console.log("doc", res.data);
      } catch (error) {
        console.error("Error fetching doctors: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  // if (loading) return <p>Doctors is loading ...</p>
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center pb-9">
          <h2 className="text-4xl  font-semibold text-blue-900">
            ทันตแพทย์ของเรา
          </h2>
        </div>
        {loading ? "Doctors is loading ..." : ""}
        {/* <div className="grid grid-cols sm:grid-cols-2 md:grid-cols-3 gap-8">
          {doctors
            ? doctors.slice(0, 3).map((d, index) => (
                <div
                  className="flex flex-col items-center justify-center text-center"
                  key={index}
                >
                  <Image
                    src={d.image_url}
                    alt=""
                    width={400}
                    height={400}
                    priority
                    className="rounded-xl mb-4"
                  />

                  <p className="text-blue-900 text-xl font-semibold mb-2">
                    {d.name}
                  </p>
                  <p className="text-base text-gray-500">{d.specialization}</p>
                </div>
              ))
            : ""}
        </div> */}
        {/* Desktop / Tablet Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {doctors?.slice(0, 3).map((d, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center text-center"
            >
              <Image
                src={d.image_url}
                alt=""
                width={400}
                height={400}
                priority
                className="rounded-xl mb-4"
              />
              <p className="text-blue-900 text-xl font-semibold mb-2">
                {d.name}
              </p>
              <p className="text-base text-gray-500">{d.specialization}</p>
            </div>
          ))}
        </div>

        {/* Mobile Horizontal Scroll */}
        <div className="md:hidden flex gap-4 overflow-x-auto py-2 px-1">
          {doctors?.slice(0, 3).map((d, index) => (
            <div
              key={index}
              className="flex-none w-72 flex flex-col items-center justify-center text-center"
            >
              <Image
                src={d.image_url}
                alt=""
                width={400}
                height={400}
                priority
                className="rounded-xl mb-4"
              />
              <p className="text-blue-900 text-xl font-semibold mb-2">
                {d.name}
              </p>
              <p className="text-base text-gray-500">{d.specialization}</p>
            </div>
          ))}
        </div>
        <div className="mt-2 p-2 flex justify-center items-center">
          <Link href="/about" passHref>
            <button className=" flex items-center justify-center p-2 w-full gap-2 group cursor-pointer">
              <p className="text-base text-blue-900 ">เพิ่มเติม</p>
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
    </section>
  );
}

export default DoctorsSection;
