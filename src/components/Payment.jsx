import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

export default function Payment() {
  const { plan } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    email: '',
  });

  const planDetails = {
    basic: {
      name: 'Basic Plan',
      price: '£1500/month',
      features: ['1 Admin', 'Up to 3 Instructors', 'Up to 50 Exams'],
    },
    pro: {
      name: 'Pro Plan',
      price: '£3750/month',
      features: ['Up to 3 Admins', 'Up to 15 Instructors', 'Up to 300 Exams'],
    },
    enterprise: {
      name: 'Enterprise Plan',
      price: '£11250/month',
      features: [
        'Unlimited Admins',
        'Unlimited Instructors',
        'Unlimited Exams',
      ],
    },
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically handle the payment processing
    toast.success('Payment processed successfully!');
    navigate('/login');
  };

  if (!planDetails[plan]) {
    return <div>Invalid plan selected</div>;
  }

  return (
    <div className='min-h-screen bg-slate-50 py-12'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='bg-white rounded-2xl shadow-lg p-8'>
          <div className='text-center mb-8'>
            <h2 className='text-3xl font-bold text-slate-900 mb-2'>
              Complete Your Purchase
            </h2>
            <p className='text-slate-600 font-medium'>
              You&apos;re subscribing to {planDetails[plan].name} at{' '}
              {planDetails[plan].price}
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            {/* Payment Form */}
            <div>
              <form onSubmit={handleSubmit} className='space-y-6'>
                <div>
                  <label
                    htmlFor='name'
                    className='block text-sm font-medium text-slate-700 mb-1'
                  >
                    Cardholder Name
                  </label>
                  <input
                    type='text'
                    id='name'
                    name='name'
                    value={formData.name}
                    onChange={handleInputChange}
                    className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor='email'
                    className='block text-sm font-medium text-slate-700 mb-1'
                  >
                    Email Address
                  </label>
                  <input
                    type='email'
                    id='email'
                    name='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor='cardNumber'
                    className='block text-sm font-medium text-slate-700 mb-1'
                  >
                    Card Number
                  </label>
                  <input
                    type='text'
                    id='cardNumber'
                    name='cardNumber'
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder='1234 5678 9012 3456'
                    className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    required
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label
                      htmlFor='expiryDate'
                      className='block text-sm font-medium text-slate-700 mb-1'
                    >
                      Expiry Date
                    </label>
                    <input
                      type='text'
                      id='expiryDate'
                      name='expiryDate'
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder='MM/YY'
                      className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor='cvv'
                      className='block text-sm font-medium text-slate-700 mb-1'
                    >
                      CVV
                    </label>
                    <input
                      type='text'
                      id='cvv'
                      name='cvv'
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder='123'
                      className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      required
                    />
                  </div>
                </div>

                <button
                  type='submit'
                  className='w-full bg-gradient-to-r from-slate-800 to-slate-700 text-white py-4 px-8 rounded-xl hover:from-slate-700 hover:to-slate-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium'
                >
                  Pay {planDetails[plan].price}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className='bg-slate-50 p-6 rounded-xl'>
              <h3 className='text-lg font-semibold text-slate-900 mb-4'>
                Order Summary
              </h3>
              <div className='space-y-4'>
                <div className='flex justify-between items-center pb-4 border-b border-slate-200'>
                  <span className='font-medium text-slate-700'>Plan</span>
                  <span className='font-semibold text-slate-900'>
                    {planDetails[plan].name}
                  </span>
                </div>
                <div className='pb-4 border-b border-slate-200'>
                  <h4 className='font-medium text-slate-700 mb-2'>
                    Features included:
                  </h4>
                  <ul className='space-y-2'>
                    {planDetails[plan].features.map((feature, index) => (
                      <li
                        key={index}
                        className='flex items-center text-slate-600'
                      >
                        <svg
                          className='w-5 h-5 text-green-500 mr-2'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className='flex justify-between items-center text-lg'>
                  <span className='font-medium text-slate-700'>Total</span>
                  <span className='font-bold text-slate-900'>
                    {planDetails[plan].price}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
