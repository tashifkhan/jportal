import React from 'react'
function Navbar() {

  return (
    <div className=' flex items-center justify-between sm:gap-0 gap-2 w-screen absolute bottom-0 left-0 bg-[#242a32] py-2 px-4'>

      <div className='text-md text-white overflow-x-hidden '>
        <a href="">
              <div className='flex flex-col items-center'>
                <div className='hover:bg-gray-700 rounded-xl w-full p-1 flex items-center justify-center'>
                  <img src="/icons/house-solid.svg" alt="Home" className="w-5 h-5" />
                </div>
          <p >HOME</p>
          </div>
          </a>
          </div>
      <div className='text-md text-white overflow-x-hidden'><a href=""><a href="">
              <div className='flex flex-col items-center'>
                <div className='hover:bg-gray-700 rounded-xl w-full p-1 flex items-center justify-center'>
                  <img src="/icons/house-solid.svg" alt="Home" className="w-5 h-5" />
                </div>
          <p >ATTENDANCE</p>
          </div>
          </a></a></div>
      <div className='text-md text-white overflow-x-hidden '><a href=""><a href="">
              <div className='flex flex-col items-center'>
                <div className='hover:bg-gray-700 rounded-xl w-full p-1 flex items-center justify-center'>
                  <img src="/icons/house-solid.svg" alt="Home" className="w-5 h-5" />
                </div>
            <p >GRADES</p>
          </div>
          </a></a></div>
      <div className='text-md text-white overflow-x-hidden'><a href=""><a href="">
              <div className='flex flex-col items-center'>
                <div className='hover:bg-gray-700 rounded-xl w-full p-1 flex items-center justify-center'>
                  <img src="/icons/house-solid.svg" alt="Home" className="w-5 h-5" />
                </div>
            <p >EXAMS</p>
          </div>
          </a></a></div>
      <div className='text-md text-white overflow-x-hidden'><a href=""><a href="">
              <div className='flex flex-col items-center'>
                <div className='hover:bg-gray-700 rounded-xl w-full p-1 flex items-center justify-center'>
                  <img src="/icons/house-solid.svg" alt="Home" className="w-5 h-5" />
                </div>
            <p >SUBJECTS</p>
          </div>
          </a></a></div>
    </div>
  )
}

export default Navbar
