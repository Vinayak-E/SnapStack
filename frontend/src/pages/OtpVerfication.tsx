import React, { useState, useEffect, useRef } from 'react';
import { verifyOtp, resendOtp } from '../services/api';

interface OtpVerificationProps {
  email: string;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onResendSuccess?: (message: string) => void;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({ 
  email, 
  onSuccess, 
  onError,
  onResendSuccess = () => {}, 
}) => {
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resendTimer, setResendTimer] = useState<number>(30);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [resendMessage, setResendMessage] = useState<string>(''); 

  const inputRefs = Array(6).fill(null).map(() => useRef<HTMLInputElement>(null));


  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleInputChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value.slice(-1);
    setOtpDigits(newOtpDigits);

    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        inputRefs[index - 1].current?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    if (!/^\d+$/.test(pastedData)) return;
    
    const digits = pastedData.slice(0, 6).split('');
    const newOtpDigits = [...otpDigits];
    digits.forEach((digit, index) => {
      if (index < 6) newOtpDigits[index] = digit;
    });
    
    setOtpDigits(newOtpDigits);
    
    const nextEmptyIndex = newOtpDigits.findIndex(digit => !digit);
    if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
      inputRefs[nextEmptyIndex].current?.focus();
    } else {
      inputRefs[5].current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const otpValue = otpDigits.join('');
    
    if (otpValue.length !== 6) {
      onError('Please enter all 6 digits of the verification code');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await verifyOtp({ email, otp: otpValue });
      onSuccess(response.data.message);
    } catch (err: any) {
      onError(err.response?.data?.message || 'Error verifying OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;
    
    setIsResending(true);
    setResendMessage('');
    
    try {
      const response = await resendOtp({ email });
      onResendSuccess(response.data.message);
      setResendMessage(response.data.message || 'Verification code resent');
      setResendTimer(30);
      setCanResend(false);
    } catch (err: any) {
      onError(err.response?.data?.message || 'Failed to resend verification code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Enter 6-digit verification code
        </label>
        
        {resendMessage && (
          <div className="mb-4 p-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-sm text-center">
            {resendMessage}
          </div>
        )}
        
        <div className="flex justify-center gap-2 sm:gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="w-12 h-12">
              <input
                ref={inputRefs[index]} // Use individual ref
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={otpDigits[index]}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-full h-full text-center text-xl font-semibold border rounded-md 
                           border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-700 
                           text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-4">
          Didn't receive the code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || isResending}
            className={`font-medium ${
              canResend && !isResending
                ? 'text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300'
                : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
            } transition-colors duration-200`}
          >
            {isResending
              ? 'Sending...'
              : canResend
                ? 'Resend Code'
                : `Resend in ${resendTimer}s`}
          </button>
        </p>

        <button
          type="submit"
          disabled={isLoading || otpDigits.some(digit => digit === '')}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent
                   text-sm font-medium rounded-md text-white 
                   bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 
                   disabled:bg-indigo-400 dark:disabled:bg-indigo-400/70 
                   transition-colors duration-200"
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
            'Verify'
          )}
        </button>
      </div>
    </form>
  );
};

export default OtpVerification;