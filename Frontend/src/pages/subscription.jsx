import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { authService } from '../services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../components/ui/theme-provider';
import { ThemeToggle } from '../components/ui/theme-toggle';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export function SubscriptionPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showFeatures, setShowFeatures] = useState(false);
  const { theme, setTheme } = useTheme();
  const user = authService.getCurrentUser();

  const plans = [
    {
      id: 'free',
      name: 'Free Spirit',
      price: '$0',
      period: 'forever',
      features: [
        'Up to 5 learning paths',
        'Basic AI customization',
        'Community support',
        'Standard resources'
      ],
      buttonText: 'Current Plan',
      isPopular: false,
      disabled: true,
      priceId: null,
      color: 'from-blue-400 to-indigo-500',
      bgGradient: 'from-blue-50 to-indigo-50',
      icon: '🌱'
    },
    {
      id: 'premium',
      name: 'Growth Master',
      price: '$10',
      period: 'per month',
      features: [
        'Unlimited learning paths',
        'Advanced AI customization',
        'Priority support',
        'Exclusive resources',
        'Early access to features',
        'Custom path duration',
        'Premium templates',
        'Advanced analytics'
      ],
      buttonText: 'Upgrade Now',
      isPopular: true,
      disabled: false,
      priceId: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID,
      color: 'from-indigo-400 to-blue-500',
      bgGradient: 'from-indigo-50 to-blue-50',
      icon: '🚀'
    },
    {
      id: 'enterprise',
      name: 'Innovation Elite',
      price: '$49',
      period: 'per month',
      features: [
        'Everything in Growth Master',
        'Team collaboration',
        'Custom branding',
        'API access',
        'Analytics dashboard',
        'Dedicated support',
        'Custom integrations',
        'SLA guarantees',
        'Custom AI models',
        'White-label solution'
      ],
      buttonText: 'Contact Sales',
      isPopular: false,
      disabled: false,
      priceId: null,
      color: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      icon: '⭐'
    }
  ];

  const handleSubscribe = async (plan) => {
    if (plan.name === 'Enterprise') {
      window.location.href = 'mailto:sales@example.com?subject=Enterprise Plan Inquiry';
      return;
    }

    if (!plan.priceId) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Create a Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/subscription`
        })
      });

      const session = await response.json();

      if (!session || !session.id) {
        throw new Error('Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id
      });

      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to process subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => setShowFeatures(true), 500);
  }, []);

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-indigo-900 to-gray-900 text-white' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900'}`}>
      {/* Back Button and Theme Toggle */}
      <div className="fixed top-8 left-8 right-8 z-50 flex justify-between items-center">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            isDark 
              ? 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-200' 
              : 'bg-white/50 hover:bg-white/80 text-gray-700 shadow-lg backdrop-blur-sm'
          } transition-all duration-300`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </motion.button>

        <ThemeToggle />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-24 relative"
        >
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-3xl ${isDark ? 'opacity-20' : 'opacity-10'} -z-10`} />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-block mb-8"
          >
            <span className={`px-6 py-3 rounded-full text-base font-medium ${
              isDark 
                ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-200 border border-blue-500/20'
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border border-blue-200'
            }`}>
              🎉 Special Launch Pricing
            </span>
          </motion.div>
          
          <h1 className={`text-7xl font-bold mb-8 bg-gradient-to-r ${
            isDark 
              ? 'from-blue-300 via-indigo-300 to-blue-300'
              : 'from-blue-600 via-indigo-600 to-blue-600'
          } text-transparent bg-clip-text`}>
            Elevate Your Learning Journey
          </h1>
          <p className={`text-2xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
            Choose your perfect plan and unlock the power of AI-driven personalized learning
          </p>
        </motion.div>

        {/* Current Plan Banner */}
        {user && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-3xl mx-auto mb-24"
          >
            <div className={`relative overflow-hidden rounded-2xl ${
              isDark 
                ? 'bg-gradient-to-r from-gray-900/50 to-indigo-900/50 backdrop-blur-xl border border-gray-700'
                : 'bg-white border border-gray-200 shadow-lg'
            }`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${
                isDark ? 'from-indigo-500/10' : 'from-indigo-500/5'
              } to-transparent`} />
              <div className="relative p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Your Current Plan</h2>
                    <p className="text-lg text-gray-300">
                      You are on the{' '}
                      <span className="font-semibold text-blue-400">
                        {user?.subscription?.type || 'Free Spirit'}
                      </span>{' '}
                      plan
                    </p>
                  </div>
                  {user?.subscription?.type === 'premium' ? (
                    <div className="flex flex-col items-end">
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse" />
                        Active
                      </span>
                      <p className="text-sm text-gray-400 mt-2">
                        Next billing: {user?.subscription?.nextBillingDate || 'N/A'}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-gray-800 text-gray-300 border border-gray-700">
                        {user?.subscription?.type === 'free' ? 'Limited Access' : 'No Subscription'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-24">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 * (index + 1) }}
              whileHover={{ y: -5 }}
              className={`relative rounded-2xl ${
                isDark 
                  ? 'bg-gradient-to-br from-gray-900/50 to-indigo-900/50 backdrop-blur-xl border border-gray-800 hover:border-gray-700'
                  : 'bg-white border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl'
              } p-8 transition-all duration-300 ${
                plan.isPopular ? `ring-2 ${isDark ? 'ring-blue-500/50' : 'ring-blue-500'} transform lg:scale-105` : ''
              } ${
                selectedPlan === plan.id ? `ring-2 ${isDark ? 'ring-blue-500/50' : 'ring-blue-500'}` : ''
              }`}
              onClick={() => !plan.disabled && setSelectedPlan(plan.id)}
            >
              {plan.isPopular && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-5 left-1/2 -translate-x-1/2"
                >
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L13.586 6H10a1 1 0 110-2h3.586l-1.293-1.293A1 1 0 0112 2z" clipRule="evenodd" />
                    </svg>
                    Most Popular
                  </span>
                </motion.div>
              )}

              <div className="mb-8">
                <span className="text-3xl mb-4 block">{plan.icon}</span>
                <h2 className="text-2xl font-bold text-white mb-4">{plan.name}</h2>
                <div className="flex items-baseline mb-4">
                  <span className={`text-5xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                    {plan.price}
                  </span>
                  <span className="ml-2 text-gray-400">/{plan.period}</span>
                </div>
                <p className="text-gray-400">
                  {plan.id === 'free' && 'Begin your learning adventure'}
                  {plan.id === 'premium' && 'Accelerate your growth'}
                  {plan.id === 'enterprise' && 'Transform your organization'}
                </p>
              </div>

              <AnimatePresence>
                {showFeatures && (
                  <ul className="mb-8 space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li 
                        key={feature}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * featureIndex }}
                        className="flex items-center text-gray-300"
                      >
                        <svg
                          className={`w-5 h-5 mr-3 ${plan.isPopular ? 'text-blue-400' : 'text-gray-500'}`}
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
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSubscribe(plan)}
                disabled={plan.disabled || loading}
                className={`w-full py-4 px-6 rounded-xl text-base font-semibold transition-all duration-300
                  ${
                    plan.disabled
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : plan.isPopular
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-blue-500/25'
                      : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700 hover:border-gray-600'
                  }
                  ${loading ? 'opacity-75 cursor-wait' : ''}
                `}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-current" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </div>
                ) : (
                  plan.buttonText
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-6xl mx-auto mt-32 relative"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-3xl opacity-10 -z-10" />
          
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-300 via-indigo-300 to-blue-300 text-transparent bg-clip-text">
            Why Choose Our Premium Plans?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300" />
              <div className="relative rounded-2xl bg-gradient-to-br from-gray-900/50 to-indigo-900/50 backdrop-blur-xl p-8 border border-gray-800 hover:border-gray-700 transition-all duration-300">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">Lightning Fast Progress</h3>
                <p className="text-gray-400">Experience accelerated learning with our AI-powered personalized paths and smart recommendations.</p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300" />
              <div className="relative rounded-2xl bg-gradient-to-br from-gray-900/50 to-purple-900/50 backdrop-blur-xl p-8 border border-gray-800 hover:border-gray-700 transition-all duration-300">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">Advanced Security</h3>
                <p className="text-gray-400">Your learning journey is protected with enterprise-grade security and data protection.</p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300" />
              <div className="relative rounded-2xl bg-gradient-to-br from-gray-900/50 to-purple-900/50 backdrop-blur-xl p-8 border border-gray-800 hover:border-gray-700 transition-all duration-300">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">Custom Learning</h3>
                <p className="text-gray-400">Tailor your learning experience with advanced customization and AI-driven insights.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="max-w-4xl mx-auto mt-32 text-center"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 mb-2">99%</div>
              <div className="text-gray-400">Satisfaction Rate</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600 mb-2">24/7</div>
              <div className="text-gray-400">Support Available</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 mb-2">10k+</div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-600 mb-2">500+</div>
              <div className="text-gray-400">Learning Paths</div>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="max-w-3xl mx-auto mt-32"
        >
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-300 via-indigo-300 to-blue-300 text-transparent bg-clip-text">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300" />
              <div className="relative rounded-2xl bg-gradient-to-br from-gray-900/50 to-indigo-900/50 backdrop-blur-xl p-8 border border-gray-800 hover:border-gray-700 transition-all duration-300">
                <h3 className="text-xl font-semibold mb-4 text-white">Can I switch plans anytime?</h3>
                <p className="text-gray-400">Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300" />
              <div className="relative rounded-2xl bg-gradient-to-br from-gray-900/50 to-purple-900/50 backdrop-blur-xl p-8 border border-gray-800 hover:border-gray-700 transition-all duration-300">
                <h3 className="text-xl font-semibold mb-4 text-white">What payment methods do you accept?</h3>
                <p className="text-gray-400">We accept all major credit cards through our secure payment processor, Stripe.</p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300" />
              <div className="relative rounded-2xl bg-gradient-to-br from-gray-900/50 to-purple-900/50 backdrop-blur-xl p-8 border border-gray-800 hover:border-gray-700 transition-all duration-300">
                <h3 className="text-xl font-semibold mb-4 text-white">Is there a refund policy?</h3>
                <p className="text-gray-400">Yes, we offer a 30-day money-back guarantee. If you're not satisfied, we'll provide a full refund.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="max-w-4xl mx-auto mt-32 text-center relative"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-3xl opacity-10 -z-10" />
          
          <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-300 via-indigo-300 to-blue-300 text-transparent bg-clip-text">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-gray-300 mb-12">Join thousands of satisfied users who have accelerated their learning journey</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-8 py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
          >
            Get Started Now
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
} 