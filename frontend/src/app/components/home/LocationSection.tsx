import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { faPhone } from "@fortawesome/free-solid-svg-icons/faPhone";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { faLine } from "@fortawesome/free-brands-svg-icons";
function LocationSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <h3 className="text-5xl font-semibold text-center text-blue-900 mb-9">
          สถานที่ตั้ง
        </h3>

        <div 
        className="grid grid-cols md:grid-cols-2 gap-4 items-center "
        // className="flex flex-col justify-center items-center"
        >
          <div className="w-full h-70 rounded-xl overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.711322040214!2d100.52318621533184!3d13.75633099035208!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e2992fb8df67a3%3A0x7e6c7e77b8e2c5c2!2sBangkok%20City%20Center!5e0!3m2!1sen!2sth!4v1699999999999"
              width="100%"
              height="100%"
              className="border-0 "
              allowFullScreen={true}
              loading="lazy"
            ></iframe>
          </div>
          <div className=" flex items-center justify-center flex-col">
            <div className=" mt-4 md:mt-0">
              <p className="text-gray-700 mb-4 text-xl md:text-2xl">
                <strong>
                  <FontAwesomeIcon icon={faLine} className="text-green-600"/> :
                </strong>{" "}
                ToothToday Demo Clinic
              </p>
              <p className="text-gray-700 mb-4 text-xl md:text-2xl">
                <strong>
                  <FontAwesomeIcon icon={faLocationDot} className="text-red-800"/> :
                </strong>{" "}
                123 ถนนสุขุมวิท กรุงเทพฯ 10110
              </p>
              <p className="text-gray-700 mb-4 text-xl md:text-2xl">
                <strong>
                  <FontAwesomeIcon icon={faPhone} className="text-blue-900"/> :
                </strong>{" "}
                02-123-4567
              </p>
              <p className="text-gray-700 mb-6 text-xl md:text-2xl">
                <strong>
                  <FontAwesomeIcon icon={faClock} className="text-gray-600"/> :
                </strong>{" "}
                ทุกวัน 08:00 - 21:00 น.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LocationSection;
