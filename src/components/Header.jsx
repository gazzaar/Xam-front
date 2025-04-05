import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="relative mt-4 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-1 text-slate-800">
              <h1 className="font-expletus text-4xl sm:text-6xl font-semibold transition-transform rotate-180">
                X
              </h1>
              <span className="font-D-dinExp text-2xl sm:text-4xl self-end tracking-[1.5px]">
                am
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-white rounded-md border-none outline-solid bg-slate-700 hover:bg-slate-600 transition-all duration-200 px-6 py-2"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="text-sm border border-slate-300  font-medium rounded-md text-slate-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 px-6 py-2"
            >
              Sign up
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-700 hover:text-slate-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden absolute w-full bg-white shadow-lg z-50">
          <div className="pt-2 pb-3 space-y-1">
            <button
              onClick={() => {
                navigate('/login');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left block px-4 py-2 text-base font-medium text-white bg-slate-700 hover:bg-slate-600 transition-all duration-200"
            >
              Login
            </button>
            <button
              onClick={() => {
                navigate('/signup');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left block px-4 py-2 text-base font-medium text-slate-700 hover:bg-slate-700 hover:text-white transition-all duration-200 border-t border-gray-200"
            >
              Sign up
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
