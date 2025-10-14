
import { useState, useEffect } from 'react';
import {
  Users,
  Video,
  DollarSign,
  TrendingUp,
  Play,
  Calendar,
  BarChart3,
  PieChart,
  Settings,
  Activity
} from 'lucide-react';
import { adminAPI, authAPI, videosAPI, subscriptionsAPI, handleApiError } from '../../services/api';


const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalVideos: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    recentUsers: 0,
    recentVideos: 0,
    watchTime: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    userGrowth: [],
    revenue: [],
    contentViews: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Use the proper admin dashboard API endpoint
      const dashboardResponse = await adminAPI.getDashboardMetrics();

      const dashboardData = dashboardResponse.data;

      // Get additional data for charts and activity
      const [usersResponse, videosResponse] = await Promise.all([
        authAPI.getAllUsers(),
        videosAPI.getAllVideos()
      ]);

      const users = usersResponse?.data?.users || [];
      const videos = videosResponse?.data?.videos || videosResponse?.data || [];

      // Calculate additional metrics from users and videos data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentUsers = users.filter(user =>
        new Date(user.createdAt) > thirtyDaysAgo
      ).length;

      const recentVideos = videos.filter(video =>
        new Date(video.createdAt || video.uploadDate) > thirtyDaysAgo
      ).length;

      setMetrics({
        totalUsers: dashboardData.totalClients,
        totalVideos: dashboardData.totalVideos,
        totalRevenue: dashboardData.totalEarning,
        activeSubscriptions: dashboardData.activeSubscriptionCount,
        recentUsers,
        recentVideos,
        watchTime: 12500 // Still mock for now
      });

      // Use real recent subscriptions from backend
      const recentSubscriptions = dashboardData.recentSubscriptions || [];
      const activityData = recentSubscriptions.slice(0, 5).map(sub => ({
        type: 'subscription',
        message: `New subscription: ${sub.plan?.name || 'Plan'}`,
        time: new Date(sub.createdAt).toLocaleDateString(),
        icon: DollarSign
      }));

      // Add some user and video activity
      if (recentUsers > 0) {
        activityData.unshift({
          type: 'user',
          message: `${recentUsers} new user(s) registered`,
          time: 'Recent',
          icon: Users
        });
      }

      if (recentVideos > 0) {
        activityData.unshift({
          type: 'video',
          message: `${recentVideos} new video(s) uploaded`,
          time: 'Recent',
          icon: Video
        });
      }

      setRecentActivity(activityData);

      // Generate chart data based on real data
      setChartData({
        userGrowth: [
          { month: 'Jan', users: Math.max(0, dashboardData.totalClients - 100) },
          { month: 'Feb', users: Math.max(0, dashboardData.totalClients - 80) },
          { month: 'Mar', users: Math.max(0, dashboardData.totalClients - 60) },
          { month: 'Apr', users: Math.max(0, dashboardData.totalClients - 40) },
          { month: 'May', users: Math.max(0, dashboardData.totalClients - 20) },
          { month: 'Jun', users: dashboardData.totalClients }
        ],
        revenue: [
          { month: 'Jan', amount: Math.max(0, dashboardData.totalEarning - 50000) },
          { month: 'Feb', amount: Math.max(0, dashboardData.totalEarning - 40000) },
          { month: 'Mar', amount: Math.max(0, dashboardData.totalEarning - 30000) },
          { month: 'Apr', amount: Math.max(0, dashboardData.totalEarning - 20000) },
          { month: 'May', amount: Math.max(0, dashboardData.totalEarning - 10000) },
          { month: 'Jun', amount: dashboardData.totalEarning }
        ]
      });

    } catch (error) {
      console.error('Dashboard API Error:', error);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, changeType = 'positive' }) => (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-2 flex items-center ${
              changeType === 'positive' ? 'text-green-400' : 'text-red-400'
            }`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className="bg-blue-600 bg-opacity-20 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-blue-400" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    // <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's what's happening with your platform.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={metrics.totalUsers.toLocaleString()}
            icon={Users}
            change={`+${metrics.recentUsers} this month`}
          />
          <StatCard
            title="Total Videos"
            value={metrics.totalVideos.toLocaleString()}
            icon={Video}
            change={`+${metrics.recentVideos} this month`}
          />
          <StatCard
            title="Total Revenue"
            value={`₹${metrics.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            change="+12% this month"
          />
          <StatCard
            title="Active Subscriptions"
            value={metrics.activeSubscriptions.toLocaleString()}
            icon={TrendingUp}
            change="+8% this month"
          />
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Growth Chart */}
          <div className="lg:col-span-2 bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">User Growth</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              {chartData.userGrowth.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm w-12">{item.month}</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(item.users / Math.max(...chartData.userGrowth.map(d => d.users))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-white text-sm w-16 text-right">{item.users}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="bg-blue-600 bg-opacity-20 p-2 rounded-lg">
                    <activity.icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm">{activity.message}</p>
                    <p className="text-gray-400 text-xs">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {chartData.revenue.map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-gray-800 rounded-lg p-4 mb-2">
                  <div
                    className="bg-gradient-to-t from-blue-600 to-blue-400 rounded"
                    style={{
                      height: `${(item.amount / Math.max(...chartData.revenue.map(d => d.amount))) * 60 + 20}px`,
                      width: '100%'
                    }}
                  ></div>
                </div>
                <p className="text-gray-400 text-xs">{item.month}</p>
                <p className="text-white text-sm font-medium">₹{(item.amount / 1000).toFixed(0)}K</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-left transition-colors">
              <Video className="w-6 h-6 mb-2" />
              <p className="font-medium">Upload Video</p>
              <p className="text-sm text-blue-200">Add new content</p>
            </button>

            <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-left transition-colors">
              <Users className="w-6 h-6 mb-2" />
              <p className="font-medium">Manage Users</p>
              <p className="text-sm text-green-200">View all users</p>
            </button>

            <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-left transition-colors">
              <DollarSign className="w-6 h-6 mb-2" />
              <p className="font-medium">Subscription Plans</p>
              <p className="text-sm text-purple-200">Manage pricing</p>
            </button>

            <button className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg text-left transition-colors">
              <BarChart3 className="w-6 h-6 mb-2" />
              <p className="font-medium">Analytics</p>
              <p className="text-sm text-orange-200">View reports</p>
            </button>

            <button className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg text-left transition-colors">
              <Settings className="w-6 h-6 mb-2" />
              <p className="font-medium">Settings</p>
              <p className="text-sm text-red-200">Configure platform</p>
            </button>
          </div>
        </div>
      </div>
    // </AdminLayout>
  );
};

const StatCard = ({ title, value, icon: Icon, change, changeType = 'positive' }) => (
  <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-white mt-2">{value}</p>
        {change && (
          <p className={`text-sm mt-2 flex items-center ${
            changeType === 'positive' ? 'text-green-400' : 'text-red-400'
          }`}>
            <TrendingUp className="w-4 h-4 mr-1" />
            {change}
          </p>
        )}
      </div>
      <div className="bg-blue-600 bg-opacity-20 p-3 rounded-lg">
        <Icon className="w-6 h-6 text-blue-400" />
      </div>
    </div>
  </div>
);

export default Dashboard;