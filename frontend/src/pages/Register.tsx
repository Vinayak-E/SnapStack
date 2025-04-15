import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import OtpVerification from './OtpVerfication';
import toast from 'react-hot-toast';

const Register = () => {
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    server: ''
  });
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showOtpForm, setShowOtpForm] = useState<boolean>(false);
  const navigate = useNavigate();

  const validateEmail = (email: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password: string): string => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const validatePhone = (phone: string): string => {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      return 'Please enter a valid phone number (10 digit)';
    }
    return '';
  };

  const validateForm = (): boolean => {
    const newErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: password !== confirmPassword ? 'Passwords do not match' : '',
      phone: validatePhone(phone),
      server: ''
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSuccess('');
    setErrors({ ...errors, server: '' });
    setIsLoading(true);

    try {
      const response = await register({ email, phone, password });
      setSuccess(response.data.message);
      setShowOtpForm(true);
    } catch (err: any) {
      setErrors({ 
        ...errors, 
        server: err.response?.data?.message || 'Error during registration' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSuccess = (message: string) => {
    localStorage.setItem('registrationSuccess', message);
    toast.success(message);
    setSuccess(message);
    setTimeout(() => navigate('/login'), 1000);
  };

  const handleOtpError = (message: string) => {
    setErrors({
      ...errors,
      server: message
    });
  };
  
  
  const handleResendSuccess = (message: string) => {
    
    setSuccess(message);
    
    setErrors({
      ...errors,
      server: ''
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg transition-colors duration-200">
        <div className="flex items-center justify-center">
          <div>
            <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 text-center">SnapStack</h1>
            <h2 className="mt-1 text-center text-2xl font-extrabold text-gray-900 dark:text-white">
              {showOtpForm ? 'Verify Your Email' : 'Create your account'}
            </h2>
          </div>
        </div>

        {errors.server && (
          <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded" role="alert">
            <p>{errors.server}</p>
          </div>
        )}
        
        {success && !showOtpForm && (
          <div className="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-400 p-4 rounded" role="alert">
            <p>{success}</p>
          </div>
        )}

        {!showOtpForm ? (
          <form className="mt-8 space-y-6" onSubmit={handleRegisterSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                    errors.email ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 
                  focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  sm:text-sm transition-colors duration-200`}
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors({ ...errors, email: validateEmail(e.target.value) });
                    }
                  }}
                  onBlur={() => setErrors({ ...errors, email: validateEmail(email) })}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                    errors.phone ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 
                  focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  sm:text-sm transition-colors duration-200`}
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) {
                      setErrors({ ...errors, phone: validatePhone(e.target.value) });
                    }
                  }}
                  onBlur={() => setErrors({ ...errors, phone: validatePhone(phone) })}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.password ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 
                    focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    sm:text-sm transition-colors duration-200`}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors({ ...errors, password: validatePassword(e.target.value) });
                      }
                    }}
                    onBlur={() => setErrors({ ...errors, password: validatePassword(password) })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.confirmPassword ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 
                    focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    sm:text-sm transition-colors duration-200`}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) {
                        setErrors({
                          ...errors,
                          confirmPassword: e.target.value !== password ? 'Passwords do not match' : ''
                        });
                      }
                    }}
                    onBlur={() => 
                      setErrors({
                        ...errors,
                        confirmPassword: confirmPassword !== password ? 'Passwords do not match' : ''
                      })
                    }
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 disabled:bg-indigo-400 dark:disabled:bg-indigo-400/70 transition-colors duration-200"
              >
                {isLoading ? (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  'Register'
                )}
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Already have an account? </span>
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200">
                Sign in
              </Link>
            </div>
          </form>
        ) : (
          <OtpVerification 
            email={email} 
            onSuccess={handleOtpSuccess}
            onError={handleOtpError}
            onResendSuccess={handleResendSuccess} 
          />
        )}
      </div>
    </div>
  );
};

export default Register;