import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from '@mui/lab';
import { Box, Container, Paper, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import Header from './Header';

export default function LandingPage() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50'>
      <Header />

      {/* Hero Section with Modern Design */}
      <div className='relative overflow-hidden'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16'>
          <div className='text-center relative z-10'>
            <h1 className='text-6xl font-extrabold text-slate-900 mb-8 tracking-tight'>
              <span className='bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600'>
                Powering Progress,
              </span>
              <br />
              One Test at a Time
            </h1>
            <p className='text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed font-medium'>
              Transform your testing experience with our innovative platform
              designed for modern education. Streamlined, secure, and smart.
            </p>
            <div className='flex justify-center gap-6'>
              <Link
                to='/login'
                className='px-8 py-4 text-lg font-medium rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 text-white hover:from-slate-700 hover:to-slate-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
              >
                Get Started
              </Link>
              <Link
                to='/login'
                className='px-8 py-4 text-lg font-medium rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200'
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
        {/* Abstract Background Elements */}
        <div className='absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none'>
          <div className='absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob'></div>
          <div className='absolute top-1/3 right-1/4 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000'></div>
          <div className='absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000'></div>
        </div>
      </div>

      {/* Features Section with Cards */}
      <div id='features' className='py-24 bg-white scroll-mt-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-slate-900 mb-4'>
              Features that Make Us Different
            </h2>
            <p className='text-xl text-slate-600'>
              Everything you need for modern examination management
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {/* Feature Card 1 */}
            <div className='bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300'>
              <div className='w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6'>
                <svg
                  className='w-6 h-6 text-slate-700'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-slate-900 mb-4'>
                Smart Question Bank
              </h3>
              <p className='text-slate-600 font-medium'>
                Intelligent question management system with automatic
                categorization and difficulty assessment.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className='bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300'>
              <div className='w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6'>
                <svg
                  className='w-6 h-6 text-slate-700'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-slate-900 mb-4'>
                Real-time Analytics
              </h3>
              <p className='text-slate-600 font-medium'>
                Comprehensive analytics and insights to track performance and
                identify areas for improvement.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className='bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300'>
              <div className='w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6'>
                <svg
                  className='w-6 h-6 text-slate-700'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-slate-900 mb-4'>
                Secure Environment
              </h3>
              <p className='text-slate-600 font-medium'>
                Advanced security measures to ensure exam integrity and prevent
                unauthorized access.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About/How It Works Section */}
      <div id='about' className='py-24 bg-slate-50 scroll-mt-20'>
        <Container maxWidth='lg'>
          {/* Timeline Section */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant='h3'
              sx={{ mb: 4, textAlign: 'center', color: 'primary.dark' }}
            >
              How It Works
            </Typography>
            <Timeline position='alternate'>
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot color='primary' />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Paper
                    sx={{
                      p: 3,
                      bgcolor: 'white',
                      borderRadius: '0.75rem',
                    }}
                  >
                    <Typography variant='h6'>Create Questions</Typography>
                    <Typography color='text.secondary' className='font-medium'>
                      Build your question bank with our intuitive interface
                    </Typography>
                  </Paper>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot color='primary' />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Paper
                    sx={{
                      p: 3,
                      bgcolor: 'white',
                      borderRadius: '0.75rem',
                    }}
                  >
                    <Typography variant='h6'>Design Exams</Typography>
                    <Typography color='text.secondary' className='font-medium'>
                      Create and customize exams with advanced settings
                    </Typography>
                  </Paper>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot color='primary' />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Paper
                    sx={{
                      p: 3,
                      bgcolor: 'white',
                      borderRadius: '0.75rem',
                    }}
                  >
                    <Typography variant='h6'>Conduct Tests</Typography>
                    <Typography color='text.secondary' className='font-medium'>
                      Monitor exams in real-time with anti-cheating measures
                    </Typography>
                  </Paper>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot color='primary' />
                </TimelineSeparator>
                <TimelineContent>
                  <Paper
                    sx={{
                      p: 3,
                      bgcolor: 'white',
                      borderRadius: '0.75rem',
                    }}
                  >
                    <Typography variant='h6'>Analyze Results</Typography>
                    <Typography color='text.secondary' className='font-medium'>
                      Get detailed insights and performance analytics
                    </Typography>
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            </Timeline>
          </Box>

          {/* Mission Statement */}
          <Box sx={{ textAlign: 'center' }}>
            <Paper
              sx={{
                p: 6,
                borderRadius: '0.75rem',
                bgcolor: 'primary.dark',
                color: 'white',
              }}
            >
              <Typography variant='h4' sx={{ mb: 2 }}>
                Our Mission
              </Typography>
              <Typography variant='h6' sx={{ maxWidth: 800, mx: 'auto' }}>
                To revolutionize online examination with cutting-edge
                technology, making assessment secure, efficient, and accessible
                for educational institutions worldwide.
              </Typography>
            </Paper>
          </Box>
        </Container>
      </div>

      {/* Statistics Section */}
      <div className='bg-slate-900 py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-center'>
            <div className='p-6'>
              <div className='text-4xl font-bold text-white mb-2'>10,000+</div>
              <div className='text-slate-400 font-medium'>
                Questions Created
              </div>
            </div>
            <div className='p-6'>
              <div className='text-4xl font-bold text-white mb-2'>5,000+</div>
              <div className='text-slate-400 font-medium'>Exams Conducted</div>
            </div>
            <div className='p-6'>
              <div className='text-4xl font-bold text-white mb-2'>95%</div>
              <div className='text-slate-400 font-medium'>
                Satisfaction Rate
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className='bg-white py-24'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-slate-900 mb-4'>
              Simple, Transparent Pricing
            </h2>
            <p className='text-xl text-slate-600 max-w-3xl mx-auto font-medium'>
              Choose the plan that best fits your institution&apos;s needs
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {/* Basic Plan */}
            <div className='bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-slate-200'>
              <div className='text-center mb-8'>
                <h3 className='text-2xl font-bold text-slate-900 mb-4'>
                  Basic Plan
                </h3>
                <div className='text-slate-900'>
                  <span className='text-4xl font-bold'>£1500</span>
                  <span className='text-slate-600'>/month</span>
                </div>
                <p className='text-slate-600 mt-2 font-medium'>
                  Ideal for small teams or individual educators
                </p>
              </div>
              <ul className='space-y-4 mb-8'>
                <li className='flex items-center text-slate-700 font-medium'>
                  <svg
                    className='w-5 h-5 text-slate-700 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                    />
                  </svg>
                  1 Admin
                </li>
                <li className='flex items-center text-slate-700 font-medium'>
                  <svg
                    className='w-5 h-5 text-slate-700 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                    />
                  </svg>
                  Up to 3 Instructors
                </li>
                <li className='flex items-center text-slate-700 font-medium'>
                  <svg
                    className='w-5 h-5 text-slate-700 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                  Up to 50 Exams
                </li>
              </ul>
              <Link
                to='/payment/basic'
                className='block text-center px-8 py-4 rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 text-white hover:from-slate-700 hover:to-slate-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium'
              >
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className='bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-slate-800 transform scale-105'>
              <div className='text-center mb-8'>
                <div className='inline-block px-4 py-1 rounded-full bg-slate-100 text-slate-800 font-medium text-sm mb-4'>
                  Most Popular
                </div>
                <h3 className='text-2xl font-bold text-slate-900 mb-4'>
                  Pro Plan
                </h3>
                <div className='text-slate-900'>
                  <span className='text-4xl font-bold'>£3750</span>
                  <span className='text-slate-600'>/month</span>
                </div>
                <p className='text-slate-600 mt-2 font-medium'>
                  Best for growing institutions and academies
                </p>
              </div>
              <ul className='space-y-4 mb-8'>
                <li className='flex items-center text-slate-700 font-medium'>
                  <svg
                    className='w-5 h-5 text-slate-700 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
                    />
                  </svg>
                  Up to 3 Admins
                </li>
                <li className='flex items-center text-slate-700 font-medium'>
                  <svg
                    className='w-5 h-5 text-slate-700 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                    />
                  </svg>
                  Up to 15 Instructors
                </li>
                <li className='flex items-center text-slate-700 font-medium'>
                  <svg
                    className='w-5 h-5 text-slate-700 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                  Up to 300 Exams
                </li>
              </ul>
              <Link
                to='/payment/pro'
                className='block text-center px-8 py-4 rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 text-white hover:from-slate-700 hover:to-slate-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium'
              >
                Get Started
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className='bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-slate-200'>
              <div className='text-center mb-8'>
                <h3 className='text-2xl font-bold text-slate-900 mb-4'>
                  Enterprise Plan
                </h3>
                <div className='text-slate-900'>
                  <span className='text-4xl font-bold'>£11250</span>
                  <span className='text-slate-600'>/month</span>
                </div>
                <p className='text-slate-600 mt-2 font-medium'>
                  For universities, corporations, and large institutions
                </p>
              </div>
              <ul className='space-y-4 mb-8'>
                <li className='flex items-center text-slate-700 font-medium'>
                  <svg
                    className='w-5 h-5 text-slate-700 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                    />
                  </svg>
                  Unlimited Admins
                </li>
                <li className='flex items-center text-slate-700 font-medium'>
                  <svg
                    className='w-5 h-5 text-slate-700 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                    />
                  </svg>
                  Unlimited Instructors
                </li>
                <li className='flex items-center text-slate-700 font-medium'>
                  <svg
                    className='w-5 h-5 text-slate-700 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                  Unlimited Exams
                </li>
              </ul>
              <Link
                to='/payment/enterprise'
                className='block text-center px-8 py-4 rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 text-white hover:from-slate-700 hover:to-slate-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium'
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className='bg-white py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-4xl font-bold text-slate-900 mb-8'>
            Ready to Transform Your Testing Experience?
          </h2>
          <Link
            to='/login'
            className='inline-flex items-center px-8 py-4 text-lg font-medium rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 text-white hover:from-slate-700 hover:to-slate-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
          >
            Get Started Today
          </Link>
        </div>
      </div>

      {/* Contact Section */}
      <div id='contact' className='py-24 bg-white scroll-mt-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-slate-900 mb-4'>
              Get in Touch
            </h2>
            <p className='text-xl text-slate-600 max-w-3xl mx-auto font-medium'>
              Have questions about our platform? We&apos;re here to help you get
              started.
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='bg-slate-50 p-8 rounded-2xl text-center'>
              <div className='w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6 mx-auto'>
                <svg
                  className='w-6 h-6 text-slate-700'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-slate-900 mb-4'>
                Email Us
              </h3>
              <p className='text-slate-600 font-medium'>info@xam.com</p>
            </div>
            <div className='bg-slate-50 p-8 rounded-2xl text-center'>
              <div className='w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6 mx-auto'>
                <svg
                  className='w-6 h-6 text-slate-700'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-slate-900 mb-4'>
                Call Us
              </h3>
              <p className='text-slate-600 font-medium'>19234</p>
            </div>
            <div className='bg-slate-50 p-8 rounded-2xl text-center'>
              <div className='w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6 mx-auto'>
                <svg
                  className='w-6 h-6 text-slate-700'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-slate-900 mb-4'>
                Visit Us
              </h3>
              <p className='text-slate-600 font-medium'>Cairo, Egypt</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className='bg-slate-900 text-slate-400'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
            <div className='col-span-1 md:col-span-2'>
              <div className='flex items-center gap-1 text-white mb-4'>
                <h3 className='font-expletus text-3xl font-semibold transition-transform rotate-180'>
                  X
                </h3>
                <span className='font-D-dinExp text-xl self-end tracking-[1.5px]'>
                  am
                </span>
              </div>
              <p className='mb-4 text-slate-400 font-medium'>
                Empowering educators with modern examination tools for better
                assessment and learning outcomes.
              </p>
              <div className='flex space-x-4'>
                <a
                  href='https://github/com/gazzaar/xam'
                  className='text-slate-400 hover:text-white transition-colors'
                >
                  <span className='sr-only'>GitHub</span>
                  <svg
                    className='h-6 w-6'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      fillRule='evenodd'
                      d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'
                      clipRule='evenodd'
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className='text-white font-semibold mb-4'>Quick Links</h4>
              <ul className='space-y-2 font-medium'>
                <li>
                  <Link
                    to='/login'
                    className='hover:text-white transition-colors'
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('features')}
                    className='text-slate-400 hover:text-white transition-colors font-bold'
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('about')}
                    className='text-slate-400 hover:text-white transition-colors font-bold'
                  >
                    How it works
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('contact')}
                    className='text-slate-400 hover:text-white transition-colors font-bold'
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className='text-white font-semibold mb-4'>Contact</h4>
              <ul className='space-y-2 font-medium'>
                <li>Email: info@xam.com</li>
                <li>Phone: 19234</li>
                <li>Address: Cairo, Egypt</li>
              </ul>
            </div>
          </div>
          <div className='border-t border-slate-800 mt-12 pt-8 text-center'>
            <p>&copy; {new Date().getFullYear()} Xam. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
