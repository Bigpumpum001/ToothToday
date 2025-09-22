import React, { FC, SVGProps } from "react";
import clsx from "clsx";
const CheckQueueIcon: FC<SVGProps<SVGSVGElement>> = (props) => {
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
      <circle cx="60" cy="60" r="55" fill="#FDCB6E" stroke="#ffffff" strokeWidth="2"/>
      
      {/* Phone outline - minimal */}
      <rect x="42" y="30" width="36" height="60" rx="12" ry="12" fill="none" stroke="#ffffff" strokeWidth="3"/>
      
      {/* Screen area */}
      <rect x="48" y="40" width="24" height="35" rx="2" ry="2" fill="#ffffff"/>
      
      {/* Queue visualization - dots */}
      <circle cx="54" cy="50" r="2" fill="#FDCB6E"/>
      <circle cx="60" cy="50" r="2" fill="#FDCB6E"/>
      <circle cx="66" cy="50" r="2" fill="#00b894"/>
      
      {/* Progress bar */}
      <rect x="50" y="58" width="20" height="3" rx="1.5" fill="#f0f0f0"/>
      <rect x="50" y="58" width="12" height="3" rx="1.5" fill="#00b894"/>
      
      {/* Queue number */}
      <text x="60" y="70" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="600" fill="#74b9ff">08</text>
      
      {/* Check icon */}
      <circle cx="75" cy="45" r="8" fill="#00b894"/>
      <path d="M71 45 L74 48 L79 42" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    //iphone
    // <svg
    //   xmlns="http://www.w3.org/2000/svg"
    //   fill="none"
    //   viewBox="0 0 120 120"
    //   className={clsx("size-20", className)}
    //   {...restProps}
    // >
    //   {/* Background Circle */}
    //   <circle cx="60" cy="60" r="55" fill="#FDCB6E" stroke="#ffffff" strokeWidth="2"/>
      
    //   {/* iPhone body */}
    //   <rect x="40" y="25" width="40" height="70" rx="12" ry="12" fill="#1a1a1a"/>
      
    //   {/* iPhone screen */}
    //   <rect x="43" y="30" width="34" height="60" rx="8" ry="8" fill="#000000"/>
      
    //   {/* Screen content area */}
    //   <rect x="45" y="32" width="30" height="56" rx="6" ry="6" fill="#ffffff"/>
      
    //   {/* Status bar */}
    //   <rect x="47" y="34" width="26" height="4" rx="1" fill="#f8f9fa"/>
    //   <circle cx="49" cy="36" r="1" fill="#00b894"/>
    //   <rect x="69" y="35" width="3" height="2" rx="0.5" fill="#333"/>
      
    //   {/* App header */}
    //   <rect x="47" y="40" width="26" height="8" rx="2" fill="#4A90E2"/>
    //   <text x="60" y="45" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="5" fontWeight="600" fill="#ffffff">ToothToday</text>
      
    //   {/* Queue status section */}
    //   <rect x="47" y="50" width="26" height="12" rx="2" fill="#f8f9fa"/>
    //   <text x="49" y="56" fontFamily="Arial, sans-serif" fontSize="4" fill="#666">คิวปัจจุบัน</text>
    //   <text x="71" y="56" textAnchor="end" fontFamily="Arial, sans-serif" fontSize="6" fontWeight="bold" fill="#e74c3c">A15</text>
    //   <text x="49" y="60" fontFamily="Arial, sans-serif" fontSize="4" fill="#666">คิวของคุณ</text>
    //   <text x="71" y="60" textAnchor="end" fontFamily="Arial, sans-serif" fontSize="6" fontWeight="bold" fill="#00b894">A08</text>
      
    //   {/* Progress indicator */}
    //   <rect x="49" y="65" width="22" height="2" rx="1" fill="#e9ecef"/>
    //   <rect x="49" y="65" width="12" height="2" rx="1" fill="#00b894"/>
    //   <text x="60" y="70" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="4" fill="#666">รออีก 7 คิว</text>
      
    //   {/* Queue list preview */}
    //   <g>
    //     <rect x="49" y="74" width="20" height="3" rx="1" fill="#e9ecef"/>
    //     <rect x="49" y="78" width="20" height="3" rx="1" fill="#e9ecef"/>
    //     <rect x="49" y="82" width="20" height="3" rx="1" fill="#00b894" opacity="0.3"/>
    //   </g>
      
    //   {/* Home indicator */}
    //   <rect x="55" y="85" width="10" height="2" rx="1" fill="#666"/>
      
    //   {/* Dynamic island (iPhone 14+) */}
    //   <rect x="55" y="28" width="10" height="3" rx="1.5" fill="#000000"/>
      
    //   {/* Notification badge */}
    //   <circle cx="75" cy="40" r="6" fill="#e74c3c"/>
    //   <text x="75" y="42" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="4" fontWeight="bold" fill="#ffffff">1</text>
    // </svg>
  );
};

export default CheckQueueIcon;
