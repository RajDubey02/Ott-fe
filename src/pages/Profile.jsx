import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Edit, Save, X, Play, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscriptionsAPI, handleApiError, handleApiSuccess } from '../services/api';
import MovieCard from '../components/MovieCard';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Fetch subscriptions
      const subsResponse = await subscriptionsAPI.getMySubscriptions();
      setSubscriptions(subsResponse.data.subscriptions || []);
      
      // Mock data for watchlist and history (replace with actual API calls)
      setWatchlist([]);
      setWatchHistory([]);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
      mobile: user?.mobile || ''
    });
  };

  const handleSave = async () => {
    try {
      // Update profile API call would go here
      handleApiSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
      mobile: user?.mobile || ''
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSubscriptionStatus = (subscription) => {
    const now = new Date();
    const expiryDate = new Date(subscription.expiryDate);
    
    if (expiryDate > now) {
      return { status: 'active', color: 'text-green-400' };
    } else {
      return { status: 'expired', color: 'text-red-400' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-gray-300" />
            </div>
            
            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">{user?.name}</h1>
              <p className="text-gray-300 mb-4">{user?.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-400">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Joined {formatDate(user?.createdAt || new Date())}
                </span>
                <span className="flex items-center">
                  <Play className="w-4 h-4 mr-1" />
                  {watchHistory.length} videos watched
                </span>
              </div>
            </div>
            
            {/* Edit Button */}
            <div className="flex space-x-2">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          {[
            { id: 'profile', label: 'Profile Details' },
            { id: 'subscriptions', label: 'Subscriptions' },
            { id: 'watchlist', label: 'Watchlist' },
            { id: 'history', label: 'Watch History' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Profile Details Tab */}
          {activeTab === 'profile' && (
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-white">{user?.name}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-white">{user?.email}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mobile Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.mobile}
                      onChange={(e) => setEditData(prev => ({ ...prev, mobile: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-white">{user?.mobile}</span>
                    </div>
                  )}
                </div>

                {/* Account Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Account Status
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${user?.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className="text-white capitalize">{user?.status || 'Active'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subscriptions Tab */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">My Subscriptions</h2>
              
              {subscriptions.length === 0 ? (
                <div className="bg-gray-900 rounded-lg p-8 text-center">
                  <h3 className="text-lg font-medium text-white mb-2">No Active Subscriptions</h3>
                  <p className="text-gray-400 mb-4">Subscribe to a plan to start watching premium content</p>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                    View Plans
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {subscriptions.map((subscription, index) => {
                    const { status, color } = getSubscriptionStatus(subscription);
                    return (
                      <div key={index} className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-white">{subscription.planTitle}</h3>
                          <span className={`text-sm font-medium ${color} capitalize`}>{status}</span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Plan Code:</span>
                            <span className="text-white">{subscription.planCode}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Price:</span>
                            <span className="text-white">₹{subscription.price}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Started:</span>
                            <span className="text-white">{formatDate(subscription.startDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Expires:</span>
                            <span className="text-white">{formatDate(subscription.expiryDate)}</span>
                          </div>
                        </div>
                        
                        {status === 'expired' && (
                          <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors">
                            Renew Subscription
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Watchlist Tab */}
          {activeTab === 'watchlist' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">My Watchlist</h2>
              
              {watchlist.length === 0 ? (
                <div className="bg-gray-900 rounded-lg p-8 text-center">
                  <h3 className="text-lg font-medium text-white mb-2">Your watchlist is empty</h3>
                  <p className="text-gray-400">Add movies and series to your watchlist to watch them later</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {watchlist.map((video) => (
                    <MovieCard key={video._id} video={video} size="medium" />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Watch History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Watch History</h2>
              
              {watchHistory.length === 0 ? (
                <div className="bg-gray-900 rounded-lg p-8 text-center">
                  <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No watch history</h3>
                  <p className="text-gray-400">Start watching content to see your history here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {watchHistory.map((item, index) => (
                    <div key={index} className="bg-gray-900 rounded-lg p-4 flex items-center space-x-4">
                      <img
                        src={item.poster || '/api/placeholder/100/150'}
                        alt={item.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{item.title}</h3>
                        <p className="text-gray-400 text-sm">Watched on {formatDate(item.watchedAt)}</p>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                        Continue
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
