import { NavLink } from 'react-router-dom'

function Navbar() {
  const navItems = [
    { name: 'ATTENDANCE', path: '/attendance', icon: '/icons/house-solid.svg' },
    { name: 'GRADES', path: '/grades', icon: '/icons/house-solid.svg' },
    { name: 'EXAMS', path: '/exams', icon: '/icons/house-solid.svg' },
    { name: 'SUBJECTS', path: '/subjects', icon: '/icons/house-solid.svg' },
    { name: 'PROFILE', path: '/profile', icon: '/icons/house-solid.svg' },
  ];

  return (
    <div className='flex items-center justify-between sm:gap-0 gap-2 w-screen fixed bottom-0 left-0 bg-[#242a32] py-2 px-4'>
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) => `
            text-md text-white overflow-x-hidden
            ${isActive ? 'opacity-100' : 'opacity-70'}
          `}
        >
          <div className='flex flex-col items-center'>
            <div className='hover:bg-gray-700 rounded-xl w-full p-1 flex items-center justify-center'>
              <img src={item.icon} alt={item.name} className="w-5 h-5" />
            </div>
            <p>{item.name}</p>
          </div>
        </NavLink>
      ))}
    </div>
  )
}

export default Navbar
