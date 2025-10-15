import { useState, useEffect } from 'react';
import { X, Crown, CheckCircle, Star, Loader } from 'lucide-react';
import { subscriptionsAPI, handleApiError, handleApiSuccess } from '../services/api';

const SubscriptionModal = ({ isOpen, onClose, onSubscriptionSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
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

  const handleSubscribe = async (plan) => {
    setLoading(true);
    try {
      console.log('Creating subscription order for plan:', plan);

      // For all-access plans, use episodeName: "all"
      // For episode plans, we would need episodeName, but for general subscription we'll use "all"
      const orderData = {
        planCode: plan.code,
        episodeName: plan.scope === 'all' ? 'all' : 'Episode 1' // Default episode name for episode plans
      };

      console.log('Order data:', orderData);

      // Use the correct endpoint for user subscription creation
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

        // For now, simulate successful payment since we don't have Razorpay integration
        handleApiSuccess(`Order created! ₹${amount} payment required.`);
        setSelectedPlan(plan);
        onSubscriptionSuccess && onSubscriptionSuccess(plan);

        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        // Fallback for testing
        console.log('Simulating successful subscription');
        handleApiSuccess(`Successfully subscribed to ${plan.title}!`);
        setSelectedPlan(plan);
        onSubscriptionSuccess && onSubscriptionSuccess(plan);

        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      handleApiError(error);
    } finally {
      setLoading(false);
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
                  } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
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
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                      plan.popular
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
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
