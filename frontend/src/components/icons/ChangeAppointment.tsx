import React, { FC, SVGProps } from "react";
import clsx from "clsx";
const ChangeAppointment: FC<SVGProps<SVGSVGElement>> = (props) => {
    const { className, ...restProps } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 120 120"
      className={clsx("size-20", className)}
      {...restProps}
    >
      {/* Background Circle */}
      <circle cx="60" cy="60" r="55" fill="#A29BFE" stroke="#ffffff" strokeWidth="2"/>
      
      {/* Calendar squares representing appointments */}
      <rect x="35" y="40" width="18" height="15" rx="3" fill="#ffffff"/>
      <rect x="67" y="40" width="18" height="15" rx="3" fill="#ffffff"/>
      
      {/* Date text */}
      <text x="44" y="50" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="600" fill="#A29BFE">15</text>
      <text x="76" y="50" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="600" fill="#A29BFE">22</text>
      
      {/* Swap arrows between dates */}
      <path d="M55 42 Q60 38 65 42" stroke="#00b894" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M65 53 Q60 57 55 53" stroke="#00b894" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      
      {/* Arrow heads */}
      <path d="M63 40 L65 42 L63 44" stroke="#00b894" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M57 55 L55 53 L57 51" stroke="#00b894" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      
      {/* Cancel/Delete icon */}
      <circle cx="75" cy="70" r="8" fill="#e84393"/>
      <path d="M71 66 L79 74 M79 66 L71 74" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
      
      {/* Small calendar icon for reference */}
      <rect x="50" y="70" width="12" height="10" rx="1" fill="#ffffff"/>
      <rect x="50" y="70" width="12" height="3" rx="1" fill="#6c5ce7"/>
      <line x1="53" y1="68" x2="53" y2="74" stroke="#ddd" strokeWidth="1"/>
      <line x1="59" y1="68" x2="59" y2="74" stroke="#ddd" strokeWidth="1"/>
    </svg>
  );
};

export default ChangeAppointment;
