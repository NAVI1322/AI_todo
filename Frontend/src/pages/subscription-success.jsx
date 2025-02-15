import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { toast } from 'react-hot-toast';

export function SubscriptionSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        // Refresh user data to get updated subscription status
        await authService.refreshUser();
        toast.success('Successfully upgraded to Premium!');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } catch (error) {
        console.error('Error checking subscription:', error);
        toast.error('There was an issue verifying your subscription.');
      }
    };

    checkSubscriptionStatus();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Thank You for Upgrading!
          </h1>
          <p className="text-lg text-gray-600">
            Your subscription has been successfully processed.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            What's Next?
          </h2>
          <ul className="space-y-4 text-left">
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-indigo-500 mt-1 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-gray-600">
                You now have access to unlimited learning paths
              </span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-indigo-500 mt-1 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-gray-600">
                Advanced AI customization is now enabled
              </span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-indigo-500 mt-1 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-gray-600">
                Priority support is now available to you
              </span>
            </li>
          </ul>
        </div>

        <p className="text-gray-500 text-sm">
          Redirecting you to the dashboard in a few seconds...
        </p>
      </div>
    </div>
  );
} 