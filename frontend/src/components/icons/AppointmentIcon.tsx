import React, { FC, SVGProps } from "react";
import clsx from "clsx";
const AppointmentIcon: FC<SVGProps<SVGSVGElement>> = (props) => {
    const { className, ...restProps } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 120 120"
      className={clsx("size-20", className)}
      {...restProps}
    >
      <circle cx="60" cy="60" r="55" fill="#1DD1A1" stroke="#ffffff" strokeWidth="2"/>
      
      {/* Calendar */}
      <rect x="35" y="35" width="50" height="45" rx="4" ry="4" fill="#ffffff"/>
      
      {/* Calendar Header */}
      <rect x="35" y="35" width="50" height="12" rx="4" ry="4" fill="#0984e3"/>
      <rect x="35" y="41" width="50" height="6" fill="#0984e3"/>
      
      {/* Calendar Rings */}
      <rect x="42" y="30" width="4" height="10" rx="2" fill="#ddd"/>
      <rect x="56" y="30" width="4" height="10" rx="2" fill="#ddd"/>
      <rect x="70" y="30" width="4" height="10" rx="2" fill="#ddd"/>
      
      {/* Calendar Grid */}
      <line x1="42" y1="55" x2="78" y2="55" stroke="#f0f0f0" strokeWidth="1"/>
      <line x1="42" y1="65" x2="78" y2="65" stroke="#f0f0f0" strokeWidth="1"/>
      <line x1="50" y1="47" x2="50" y2="80" stroke="#f0f0f0" strokeWidth="1"/>
      <line x1="65" y1="47" x2="65" y2="80" stroke="#f0f0f0" strokeWidth="1"/>
      
      {/* Plus icon on calendar */}
      <circle cx="60" cy="65" r="8" fill="#1DD1A1"/>
      <rect x="56" y="63" width="8" height="2" rx="1" fill="#ffffff"/>
      <rect x="59" y="61" width="2" height="8" rx="1" fill="#ffffff"/>
    </svg>
  );
};

export default AppointmentIcon;
