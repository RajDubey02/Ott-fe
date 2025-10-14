
import { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  DollarSign,
  Users,
  Search,
  X,
  Save
} from 'lucide-react';
import { subscriptionsAPI, handleApiError, handleApiSuccess } from '../../services/api';
import toast from 'react-hot-toast';

const ManageSubscriptions = () => {
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('plans');

  const [planFormData, setPlanFormData] = useState({
    code: '',
    title: '',
    price: '',
    durationDays: '',
    scope: 'episode',
    description: '',
    active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansResponse, subscriptionsResponse] = await Promise.all([
        subscriptionsAPI.getPlans(),
        subscriptionsAPI.getMySubscriptions().catch(() => ({ data: { subscriptions: [] } }))
      ]);

      setPlans(plansResponse?.data?.plans || plansResponse?.data || []);
      setSubscriptions(subscriptionsResponse?.data?.subscriptions || []);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPlanFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    if (!planFormData.code || !planFormData.title || !planFormData.price || !planFormData.durationDays) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Validate scope
    if (!['episode', 'all'].includes(planFormData.scope)) {
      toast.error('Scope must be either "episode" or "all"');
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting plan:', planFormData); // Debug log
      if (editingPlan) {
        await subscriptionsAPI.updatePlan(editingPlan.code, planFormData);
        handleApiSuccess('Plan updated successfully');
      } else {
        await subscriptionsAPI.createCustomPlan(planFormData);
        handleApiSuccess('Plan created successfully');
      }

      setShowPlanModal(false);
      setEditingPlan(null);
      resetPlanForm();
      fetchData();
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const resetPlanForm = () => {
    setPlanFormData({
      code: '',
      title: '',
      price: '',
      durationDays: '',
      scope: 'episode',
      description: '',
      active: true
    });
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setPlanFormData({
      code: plan.code || '',
      title: plan.title || '',
      price: plan.price || '',
      durationDays: plan.durationDays || '',
      scope: ['episode', 'all'].includes(plan.scope) ? plan.scope : 'episode',
      description: plan.description || '',
      active: plan.active !== false
    });
    setShowPlanModal(true);
  };

  const handleTogglePlanStatus = async (planCode, currentStatus) => {
    try {
      await subscriptionsAPI.updatePlanStatus(planCode, { active: !currentStatus });
      handleApiSuccess(`Plan ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchData();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDeletePlan = async (planCode) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await subscriptionsAPI.deletePlan(planCode);
        handleApiSuccess('Plan deleted successfully');
        fetchData();
      } catch (error) {
        handleApiError(error);
      }
    }
  };

  const handleSeedPlans = async () => {
    try {
      await subscriptionsAPI.seedPlans();
      handleApiSuccess('Default plans created successfully');
      fetchData();
    } catch (error) {
      handleApiError(error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getSubscriptionStats = () => {
    const totalRevenue = subscriptions.reduce((sum, sub) => sum + (sub.price || 0), 0);
    const activeSubscriptions = subscriptions.filter(sub => {
      const expiryDate = new Date(sub.expiryDate);
      return expiryDate > new Date();
    }).length;

    return {
      totalPlans: plans.length,
      activePlans: plans.filter(plan => plan.active !== false).length,
      totalSubscriptions: subscriptions.length,
      activeSubscriptions,
      totalRevenue
    };
  };

  const stats = getSubscriptionStats();

  const filteredPlans = plans.filter(plan =>
    (plan.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (plan.code?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const filteredSubscriptions = subscriptions.filter(sub =>
    (sub.planTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (sub.planCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (sub.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (sub.userEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (loading && !showPlanModal) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Loading subscriptions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Manage Subscriptions</h1>
          <p className="text-gray-400">Manage subscription plans and user subscriptions</p>
        </div>
        <div className="flex space-x-4 mt-4 sm:mt-0">
          <button
            onClick={handleSeedPlans}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Seed Default Plans
          </button>
          <button
            onClick={() => {
              resetPlanForm();
              setEditingPlan(null);
              setShowPlanModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Plan</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Plans</p>
              <p className="text-2xl font-bold text-white">{stats.totalPlans}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Plans</p>
              <p className="text-2xl font-bold text-white">{stats.activePlans}</p>
            </div>
            <Eye className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Subscriptions</p>
              <p className="text-2xl font-bold text-white">{stats.totalSubscriptions}</p>
            </div>
            <Users className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Subscriptions</p>
              <p className="text-2xl font-bold text-white">{stats.activeSubscriptions}</p>
            </div>
            <Users className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8">
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'plans'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          Subscription Plans
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'subscriptions'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          User Subscriptions
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'plans' ? (
        /* Plans Table */
        <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Plan Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Scope
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredPlans.map((plan) => (
                  <tr key={plan.code} className="hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{plan.title || 'N/A'}</div>
                        <div className="text-sm text-gray-400">{plan.code || 'N/A'}</div>
                        {plan.description && (
                          <div className="text-xs text-gray-500 mt-1">{plan.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {formatCurrency(plan.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {plan.durationDays ? `${plan.durationDays} days` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          plan.scope === 'all' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                        }`}
                      >
                        {plan.scope || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePlanStatus(plan.code, plan.active)}
                        className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${
                          plan.active === false
                            ? 'bg-red-600 text-white'
                            : 'bg-green-600 text-white'
                        }`}
                      >
                        {plan.active === false ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                        <span>{plan.active === false ? 'Inactive' : 'Active'}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditPlan(plan)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan.code)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Subscriptions Table */
        <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredSubscriptions.map((subscription) => {
                  const isActive = new Date(subscription.expiryDate) > new Date();
                  return (
                    <tr
                      key={subscription._id || subscription.planCode + subscription.userEmail}
                      className="hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {subscription.userName || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-400">
                          {subscription.userEmail || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {subscription.planTitle || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-400">
                          {subscription.planCode || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {formatCurrency(subscription.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {formatDate(subscription.startDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {formatDate(subscription.expiryDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                          }`}
                        >
                          {isActive ? 'Active' : 'Expired'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Plan Creation/Edit Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {editingPlan ? 'Edit Plan' : 'Create New Plan'}
                </h2>
                <button
                  onClick={() => setShowPlanModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handlePlanSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Plan Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Plan Code *
                    </label>
                    <input
                      type="text"
                      name="code"
                      required
                      value={planFormData.code}
                      onChange={handlePlanInputChange}
                      placeholder="e.g., EPISODE_14DAY"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Plan Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Plan Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={planFormData.title}
                      onChange={handlePlanInputChange}
                      placeholder="e.g., Per Episode / 14 Days"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      required
                      min="0"
                      step="0.01"
                      value={planFormData.price}
                      onChange={handlePlanInputChange}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Duration (Days) *
                    </label>
                    <input
                      type="number"
                      name="durationDays"
                      required
                      min="1"
                      value={planFormData.durationDays}
                      onChange={handlePlanInputChange}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Scope */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Scope *
                    </label>
                    <select
                      name="scope"
                      required
                      value={planFormData.scope}
                      onChange={handlePlanInputChange}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="episode">Per Episode</option>
                      <option value="all">Full Access</option>
                    </select>
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="active"
                      checked={planFormData.active}
                      onChange={handlePlanInputChange}
                      className="h-4 w-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label className="ml-2 block text-sm text-gray-300">
                      Active Plan
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    value={planFormData.description}
                    onChange={handlePlanInputChange}
                    placeholder="Plan description..."
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowPlanModal(false)}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{editingPlan ? 'Update' : 'Create'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSubscriptions;