import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Doctor } from "@/types/booking";
import api from "@/lib/api";
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
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="pb-9 text-center">
          <h2 className="text-4xl font-semibold text-blue-900">
            ทันตแพทย์ของเรา
          </h2>
        </div>
        {loading ? "Doctors is loading ..." : ""}
        {/* Desktop / Tablet Grid */}
        <div className="hidden gap-8 md:grid md:grid-cols-3">
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
                className="mb-4 flex-1 rounded-xl"
              />
              <p className="mb-2 text-xl font-semibold text-blue-900">
                {d.name}
              </p>
              <p className="text-base text-gray-500">{d.specialization}</p>
            </div>
          ))}
        </div>

        {/* Mobile Horizontal Scroll */}
        <div className="flex gap-4 overflow-x-auto px-1 py-2 md:hidden">
          {doctors?.slice(0, 3).map((d, index) => (
            <div
              key={index}
              className="flex w-72 flex-none flex-col items-center justify-center text-center"
            >
              <Image
                src={d.image_url}
                alt=""
                width={400}
                height={400}
                priority
                className="mb-4 rounded-xl"
              />
              <p className="mb-2 text-xl font-semibold text-blue-900">
                {d.name}
              </p>
              <p className="text-base text-gray-500">{d.specialization}</p>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-center p-2">
          <Link href="/about" passHref>
            <button className="group flex w-full cursor-pointer items-center justify-center gap-2 p-2">
              <p className="text-base text-blue-900">เพิ่มเติม</p>
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

export default DoctorsSection;
