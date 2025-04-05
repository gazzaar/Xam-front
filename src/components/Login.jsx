import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // TODO: Implement actual login API call here
      console.log('Login attempt with:', formData);
      // On successful login:
      // navigate('/');
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
    }
  };

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-md'>
        <div>
          <h1 className='mt-6 text-center text-3xl font-bold tracking-tight text-gray-900'>
            Welcome Back
          </h1>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Please enter your details to sign in
          </p>
        </div>

        {error && (
          <div
            className='bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative'
            role='alert'
          >
            <span className='block sm:inline'>{error}</span>
          </div>
        )}

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='space-y-4 rounded-md'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700'
              >
                Email
              </label>
              <input
                type='email'
                id='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                placeholder='Enter your email'
                required
                className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700'
              >
                Password
              </label>
              <input
                type='password'
                id='password'
                name='password'
                value={formData.password}
                onChange={handleChange}
                placeholder='Enter your password'
                required
                className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'
              />
            </div>
          </div>

          <button
            type='submit'
            className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2  focus:bg-slate-600 transition-colors duration-200'
          >
            Sign In
          </button>
        </form>

        <p className='mt-4 text-center text-sm text-gray-600'>
          Don&apos;t have an account?{' '}
          <Link
            to='/signup'
            className='font-medium text-slate-700 hover:text-slate-600'
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
