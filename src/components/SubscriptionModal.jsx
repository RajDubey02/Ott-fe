import { useState, useEffect } from 'react';
import { X, Crown, CheckCircle, Star, Loader, CreditCard } from 'lucide-react';
import { subscriptionsAPI, videosAPI, handleApiError, handleApiSuccess } from '../services/api';

// Razorpay integration
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const SubscriptionModal = ({ isOpen, onClose, onSubscriptionSuccess, episodeName = null }) => {
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(true);
  const [episodesLoading, setEpisodesLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(episodeName || '');
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
      fetchEpisodes();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      setPlansLoading(true);
      console.log('Fetching subscription plans...');
      const response = await subscriptionsAPI.getPlans();
      console.log('Plans response:', response.data);
      setPlans(response.data.plans || response.data || []);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      handleApiError(error);
    } finally {
      setPlansLoading(false);
    }
  };

  const fetchEpisodes = async () => {
    try {
      setEpisodesLoading(true);
      console.log('Fetching episodes for dropdown...');
      const response = await videosAPI.getAllVideos();
      console.log('Episodes response:', response.data);

      // Extract unique episode names from videos
      const videos = response.data.videos || response.data || [];
      const episodeNames = ['All', ...new Set(videos.map(video => video.episodeName || video.videoTitle || 'Unknown').filter(Boolean))];

      console.log('Episode names:', episodeNames);
      setEpisodes(episodeNames);
    } catch (error) {
      console.error('Error fetching episodes:', error);
      handleApiError(error);
    } finally {
      setEpisodesLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    if (plan.scope === 'episode' && !selectedEpisode) {
      handleApiError({ message: 'Please select an episode' });
      return;
    }

    setLoading(true);
    try {
      console.log('Creating subscription order for plan:', plan);
      console.log('Episode name:', selectedEpisode);

      // Use selected episode name, fallback to "all" for all-access plans
      const orderData = {
        planCode: plan.code,
        episodeName: selectedEpisode || (plan.scope === 'all' ? 'all' : 'Episode 1')
      };

      console.log('Order data:', orderData);

      const orderResponse = await subscriptionsAPI.createOrderByEpisodeName(orderData);
      console.log('Order response:', orderResponse);

      if (orderResponse?.data?.alreadyActive) {
        // User already has active subscription
        handleApiSuccess(`You already have an active subscription!`);
        setSelectedPlan(plan);
        onSubscriptionSuccess && onSubscriptionSuccess(plan);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else if (orderResponse?.data?.order?.id) {
        // Order created successfully
        const orderId = orderResponse.data.order.id;
        const amount = orderResponse.data.displayAmountRupees;

        console.log('Order created successfully:', orderId, 'Amount:', amount);
        setOrderId(orderId);
        setOrderCreated(true);

        // For now, simulate payment process
        handlePayment(orderId, amount, plan);
      } else {
        throw new Error('Invalid order response');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (orderId, amount, plan) => {
    setPaymentLoading(true);
    try {
      console.log('Processing payment for order:', orderId);

      // Load Razorpay script
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Get Razorpay key from environment
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error('Razorpay key not configured');
      }

      // Razorpay options
      const options = {
        key: razorpayKey,
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        name: 'OTT Platform',
        description: `Subscription to ${plan.title}`,
        order_id: orderId,
        handler: async function (response) {
          console.log('Payment successful:', response);

          try {
            // Call webhook with payment details
            const webhookData = {
              event: "payment.captured",
              payload: {
                payment: {
                  entity: {
                    id: response.razorpay_payment_id,
                    order_id: response.razorpay_order_id,
                    amount: amount * 100,
                    currency: "INR"
                  }
                }
              }
            };

            console.log('Calling webhook with:', webhookData);
            await subscriptionsAPI.webhook(webhookData);

            console.log('Payment successful!');
            handleApiSuccess(`Successfully subscribed to ${plan.title}!`);
            setSelectedPlan(plan);
            onSubscriptionSuccess && onSubscriptionSuccess(plan);

            setTimeout(() => {
              onClose();
            }, 2000);

          } catch (webhookError) {
            console.error('Webhook error:', webhookError);
            handleApiError(webhookError);
          } finally {
            setPaymentLoading(false);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#F59E0B' // Yellow theme to match your UI
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            setPaymentLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Payment error:', error);
      handleApiError(error);
      setPaymentLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-screen overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="w-8 h-8 text-yellow-500" />
            <div>
              <h2 className="text-2xl font-bold text-white">Choose Your Plan</h2>
              <p className="text-gray-400">Unlock unlimited entertainment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Success Message */}
        {selectedPlan && (
          <div className="p-4 bg-green-600 bg-opacity-20 border-l-4 border-green-500">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-green-400 font-medium">
                Successfully subscribed to {selectedPlan.title}!
              </p>
            </div>
          </div>
        )}

        {/* Payment Processing */}
        {paymentLoading && (
          <div className="p-4 bg-blue-600 bg-opacity-20 border-l-4 border-blue-500">
            <div className="flex items-center space-x-2">
              <Loader className="w-5 h-5 text-blue-400 animate-spin" />
              <p className="text-blue-400 font-medium">
                Processing payment... Please wait
              </p>
            </div>
          </div>
        )}

        {/* Order Created */}
        {orderCreated && !paymentLoading && (
          <div className="p-4 bg-yellow-600 bg-opacity-20 border-l-4 border-yellow-500">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-yellow-400" />
              <p className="text-yellow-400 font-medium">
                Order created! Processing payment...
              </p>
            </div>
          </div>
        )}

        {/* Episode Selection for Episode Plans */}
        <div className="p-6 border-b border-gray-700">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Episode (for Episode Plans)
            </label>
            <div className="relative">
              <select
                value={selectedEpisode}
                onChange={(e) => setSelectedEpisode(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                disabled={episodesLoading}
              >
                <option value="">Select an episode...</option>
                {episodes.map((episode) => (
                  <option key={episode} value={episode}>
                    {episode}
                  </option>
                ))}
              </select>
              {episodesLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Select the episode you want to subscribe to. "All" is for all-access plans.
            </p>
          </div>
        </div>

        {/* Plans */}
        <div className="p-6 flex-1 overflow-y-auto">
          {plansLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-blue-400 animate-spin" />
              <span className="ml-3 text-white">Loading subscription plans...</span>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No subscription plans available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.code}
                  className={`relative bg-gray-800 rounded-lg p-6 border-2 transition-all duration-300 ${
                    plan.popular
                      ? 'border-yellow-500 bg-gray-800'
                      : 'border-gray-700 hover:border-gray-600'
                  } ${loading || paymentLoading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">{plan.title}</h3>
                    <div className="flex items-center justify-center space-x-1 mb-2">
                      <span className="text-3xl font-bold text-white">₹{plan.price}</span>
                      <span className="text-gray-400">/{plan.durationDays} days</span>
                    </div>
                    {plan.popular && (
                      <div className="flex items-center justify-center space-x-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">Best Value</span>
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">
                        {plan.scope === 'episode' ? 'Watch specific episodes' : 'Watch all content'}
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">HD quality streaming</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">Cancel anytime</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">Secure payment</span>
                    </li>
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={loading || paymentLoading || (plan.scope === 'episode' && !selectedEpisode)}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                      plan.popular
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } ${loading || paymentLoading || (plan.scope === 'episode' && !selectedEpisode) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Order...</span>
                      </div>
                    ) : paymentLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Processing Payment...</span>
                      </div>
                    ) : (
                      `Subscribe to ${plan.title}`
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Note */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              All plans include unlimited streaming and can be cancelled anytime.
              <br />
              Payment is secure and encrypted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
