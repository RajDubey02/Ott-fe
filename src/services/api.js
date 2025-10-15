import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = 'https://spottt.codifyinstitute.org/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Clean the token by removing quotes if present
      const cleanToken = token.replace(/"/g, '');
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  verifyOTP: (data) => api.post('/auth/verify-signup-otp', data),
  resendOTP: (data) => api.post('/auth/resend-signup-otp', data),
  signin: (data) => api.post('/auth/signin', data),
  getProfile: () => api.get('/auth/me'),
  getAllUsers: () => api.get('/auth/users'),
  updateUserStatus: (userId, status) => api.put(`/auth/user-status/${userId}`, { status }),
  createAdmin: (data) => api.post('/auth/create-admin', data),
};

// Videos API calls
export const videosAPI = {
  getAllVideos: async () => {
    try {
      const response = await api.get('/videos/episodes/all');
      // Handle the nested structure from the API
      const data = response.data;

      // If data is an array of episodes with parts, flatten it
      if (Array.isArray(data)) {
        const flattenedVideos = data.flatMap(episode =>
          episode.parts?.map(part => {
            const video = {
              ...part,
              episodeName: episode.episodeName,
              _id: part.id, // Use the part ID as the main ID
              videoTitle: part.title,
              poster: part.posterUrl,
              thumb: part.thumbUrl,
              videoUrl: part.videoUrl,
              streamUrl: part.streamUrl,
              videoType: 'episode'
            };

            // Debug logging for thumbnail URLs
            console.log('Video thumbnail URLs:', {
              id: video._id,
              title: video.videoTitle,
              thumb: video.thumb,
              poster: video.poster,
              thumbUrl: video.thumbUrl,
              posterUrl: video.posterUrl
            });

            return video;
          }) || []
        );
        return { ...response, data: { videos: flattenedVideos } };
      }

      return response;
    } catch (error) {
      throw error;
    }
  },
  getReadyVideos: () => api.get('/videos'),
  getVideoById: async (videoId) => {
    try {
      const response = await api.get(`/videos/${videoId}`);
      return response;
    } catch (error) {
      // If video not found by ID, try to get it from episodes
      const allVideosResponse = await videosAPI.getAllVideos();
      const videos = allVideosResponse.data.videos || [];
      const video = videos.find(v => v._id === videoId || v.id === videoId);

      if (video) {
        return { data: { video } };
      }
      throw error;
    }
  },
  getVideoByEpisodeName: (episodeName) => api.get(`/videos/episodes/by-name/${episodeName}`),
  uploadVideo: (formData) => api.post('/videos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Categories API calls
export const categoriesAPI = {
  getCategories: () => api.get('/categories'),
  createCategory: (data) => api.post('/categories', data),
  updateCategoryStatus: (categoryId, status) => api.post(`/categories/${categoryId}/status`, { status }),
};

// Subscriptions API calls
export const subscriptionsAPI = {
  getPlans: () => api.get('/subscriptions/plans'),
  seedPlans: () => api.post('/subscriptions/seed'),
  createOrder: (data) => api.post('/subscriptions/order', data),
  createOrderByEpisodeName: (data) => api.post('/subscriptions/order/by-episode-name', data),
  getMySubscriptions: () => api.get('/subscriptions/mine'),
  createCustomPlan: (data) => api.post('/subscriptions/plans', data),
  updatePlanStatus: (planCode, active) => api.patch(`/subscriptions/plans/${planCode}/active`, { active }),
  webhook: (data) => api.post('/subscriptions/webhook', data),
};

// Notifications API calls
export const notificationsAPI = {
  getNotifications: () => api.get('/notifications'),
  createNotification: (data) => api.post('/notifications', data),
  markViewed: (notificationId) => api.post(`/notifications/${notificationId}/view`),
  markRead: (notificationId) => api.post(`/notifications/${notificationId}/read`),
};

// Queries API calls
export const queriesAPI = {
  createQuery: (data) => api.post('/queries', data),
  getQueries: () => api.get('/queries'),
  replyToQuery: (queryId, message) => api.post(`/queries/${queryId}/reply`, { message }),
  updateQueryStatus: (queryId, status) => api.post(`/queries/${queryId}/status`, { status }),
};

// Admin API calls
export const adminAPI = {
  getDashboardMetrics: () => api.get('/admin/dashboard'),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

// Helper functions
export const handleApiError = (error) => {
  const message = error.response?.data?.message || error.message || 'Something went wrong';
  toast.error(message);
  console.error('API Error:', error);
};

export const handleApiSuccess = (message) => {
  toast.success(message);
};

export default api;
