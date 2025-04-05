import { Link } from 'react-router-dom';
import Header from './Header';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-slate-800 mb-8">
            Powering Progress, One Test at a Time
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Transform your testing experience with our innovative platform
            designed for modern education.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 border border-slate-300 text-base font-medium rounded-md text-slate-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Feature */}
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-slate-800 mb-6">
                Exams Reimagined, Results Revealed
              </h2>
              <p className="text-gray-600 mb-6">
                Experience a new way of assessment with our intelligent platform
                that makes exam creation, management, and evaluation seamless
                and efficient.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center text-gray-600">
                  <svg
                    className="h-5 w-5 text-slate-700 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Automated Grading
                </li>
                <li className="flex items-center text-gray-600">
                  <svg
                    className="h-5 w-5 text-slate-700 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Real-time Analytics
                </li>
                <li className="flex items-center text-gray-600">
                  <svg
                    className="h-5 w-5 text-slate-700 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Secure Environment
                </li>
              </ul>
            </div>

            {/* Right Feature */}
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-slate-800 mb-6">
                Your Edge in Every Exam
              </h2>
              <p className="text-gray-600 mb-6">
                Empower your testing process with advanced features designed to
                enhance both the instructor and student experience.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center text-gray-600">
                  <svg
                    className="h-5 w-5 text-slate-700 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Smart Question Bank
                </li>
                <li className="flex items-center text-gray-600">
                  <svg
                    className="h-5 w-5 text-slate-700 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Detailed Reports
                </li>
                <li className="flex items-center text-gray-600">
                  <svg
                    className="h-5 w-5 text-slate-700 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Anti-cheating Measures
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-8">
            Ready to Transform Your Testing Experience?
          </h2>
          <Link
            to="/signup"
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          >
            Get Started Today
          </Link>
        </div>
      </div>
    </div>
  );
}
