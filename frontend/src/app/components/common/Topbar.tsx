import React from 'react'
import ClockIcon from '../icons/ClockIcon'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLine } from '@fortawesome/free-brands-svg-icons'
import Image from 'next/image'
function Topbar() {
  return (
    <div className='flex justify-between mx-auto  px-5  py-2 bg-blue-900'>
      <div className="flex items-center gap-1.5 ">
        <ClockIcon className='text-white' />
        <p className='text-white text-sm'>เปิดทำการ ทุกวัน 08:00-21:00 น.</p>
      </div>
      <div className="flex items-center gap-1.5">
        <FontAwesomeIcon icon={faLine} style={{ color: "#74C0FC", }} className='text-2xl  ' />
        {/* <Image src={"/images/line-icon.png"} alt='' width={20} height={20} /> */}
        <p className='text-white text-sm'>  ToothToday</p>
      </div>
    </div>
  )
}

export default Topbar
