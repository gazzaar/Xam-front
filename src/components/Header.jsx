import { useNavigate } from 'react-router-dom';
import { IoMdCheckboxOutline } from 'react-icons/io';
const Header = () => {
  const navigate = useNavigate();
  return (
    <>
      <header>
        <div className='p-6 w-3/4 mt-0 mb-0 mr-auto ml-auto  flex items-center justify-between'>
          <div className='logo flex items-center gap-3'>
            <div className='flex items-end text-slate-800'>
              <h1 className='font-expletus text-4xl  font-bold   transition-transform rotate-180'>
                X
              </h1>
              <span className='font-D-dinExp text-3xl'>am</span>
            </div>
            <IoMdCheckboxOutline className='text-2xl text-red-500' />
          </div>
          <div className='flex gap-2 items-center '>
            <button
              onClick={() => navigate('/login')}
              type=''
              className='text-sm text-white rounded-md border-none outline-solid
              bg-slate-700 hover:bg-slate-400 transition-all duration-200  border pt-2 pb-2 pr-8 pl-8'
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              type=''
              className='text-sm text-black rounded-md border-solid 
              outline-solid border-slate-700 hover:bg-slate-700 hover:text-white transition-all duration-200 border pt-2 pb-2 pr-8 pl-8'
            >
              Sign up
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
