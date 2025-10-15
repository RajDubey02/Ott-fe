import { subscriptionsAPI, authAPI, handleApiError } from '../services/api';

/**
 * Check if user has an active subscription
 * @returns {Promise<boolean>} - true if user has active subscription
 */
export const checkSubscriptionStatus = async () => {
  try {
    console.log('Checking subscription status...');
    // Get user subscriptions
    const subscriptionsResponse = await subscriptionsAPI.getMySubscriptions();
    console.log('Subscriptions API response:', subscriptionsResponse);

    const subscriptions = subscriptionsResponse?.data?.subscriptions || subscriptionsResponse?.data || [];

    console.log('Subscriptions array:', subscriptions);

    if (subscriptions && subscriptions.length > 0) {
      // Check if any subscription is active
      const activeSubscription = subscriptions.find(sub => {
        const isActive = sub.status === 'active' && new Date(sub.endAt || sub.endDate) > new Date();
        console.log('Checking subscription:', sub._id, 'Status:', sub.status, 'End date:', sub.endAt || sub.endDate, 'Is active:', isActive);
        return isActive;
      });

      console.log('Active subscription found:', activeSubscription);
      return !!activeSubscription;
    }

    console.log('No active subscriptions found');
    return false;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
};

/**
 * Get user's subscription details
 * @returns {Promise<Object|null>} - subscription details or null
 */
export const getSubscriptionDetails = async () => {
  try {
    console.log('Getting subscription details...');
    const subscriptionsResponse = await subscriptionsAPI.getMySubscriptions();
    console.log('Subscriptions API response:', subscriptionsResponse);

    const subscriptions = subscriptionsResponse?.data?.subscriptions || subscriptionsResponse?.data || [];

    if (subscriptions && subscriptions.length > 0) {
      // Find active subscription
      const activeSubscription = subscriptions.find(sub => {
        const isActive = sub.status === 'active' && new Date(sub.endAt || sub.endDate) > new Date();
        console.log('Checking subscription for details:', sub._id, 'Is active:', isActive);
        return isActive;
      });

      console.log('Active subscription details:', activeSubscription);
      return activeSubscription || null;
    }

    console.log('No active subscription details found');
    return null;
  } catch (error) {
    console.error('Error getting subscription details:', error);
    return null;
  }
};

/**
 * Check if user is logged in
 * @returns {boolean} - true if user is logged in
 */
export const isUserLoggedIn = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

/**
 * Get current user info
 * @returns {Object|null} - user info or null
 */
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Check if user has access to a specific episode
 * @param {string} episodeId - The episode ID to check access for
 * @param {string} episodeName - The episode name to check access for
 * @returns {Promise<boolean>} - true if user has access to the episode
 */
export const checkEpisodeAccess = async (episodeId, episodeName) => {
  try {
    console.log('Checking episode access for:', { episodeId, episodeName });

    const subscriptionsResponse = await subscriptionsAPI.getMySubscriptions();
    console.log('Subscriptions response for episode access:', subscriptionsResponse);

    const subscriptions = subscriptionsResponse?.data?.subscriptions || subscriptionsResponse?.data || [];

    if (subscriptions && subscriptions.length > 0) {
      // Check for all-access subscription
      const allAccessSub = subscriptions.find(sub =>
        sub.status === 'active' &&
        new Date(sub.endAt || sub.endDate) > new Date() &&
        sub.plan?.scope === 'all'
      );

      if (allAccessSub) {
        console.log('User has all-access subscription');
        return true;
      }

      // Check for episode-specific subscription
      const episodeSub = subscriptions.find(sub => {
        const isActive = sub.status === 'active' && new Date(sub.endAt || sub.endDate) > new Date();
        const hasAccess = sub.plan?.scope === 'episode' && (
          sub.episodeId === episodeId ||
          sub.episodeName === episodeId ||
          sub.episodeName === episodeName
        );

        console.log('Checking episode sub:', {
          subId: sub._id,
          subEpisodeId: sub.episodeId,
          subEpisodeName: sub.episodeName,
          targetEpisodeId: episodeId,
          targetEpisodeName: episodeName,
          isActive,
          hasAccess
        });

        return isActive && hasAccess;
      });

      if (episodeSub) {
        console.log('User has episode-specific subscription for:', { episodeId, episodeName });
        return true;
      }

      console.log('No subscription found for episode:', { episodeId, episodeName });
      return false;
    }

    console.log('No subscriptions found at all');
    return false;
  } catch (error) {
    console.error('Error checking episode access:', error);
    return false;
  }
};
