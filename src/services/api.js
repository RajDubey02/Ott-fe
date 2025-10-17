import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = 'https://spottt.codifyinstitute.org/api/v1';

// Image proxy transformation for production
const transformImageUrls = (data) => {
  if (!data) return data;

  // Handle array of objects
  if (Array.isArray(data)) {
    return data.map(item => transformImageUrls(item));
  }

  // Handle single object
  if (typeof data === 'object') {
    const transformed = { ...data };

    // Transform common image URL fields
    const urlFields = [
      'seriesPosterUrl', 'seriesThumbUrl', 'seriesTrailerUrl',
      'posterUrl', 'thumbUrl', 'trailerUrl', 'poster', 'thumb',
      'imageUrl', 'coverUrl', 'bannerUrl', 'banner', 'bannerImage',
      // Video URL fields
      'videoUrl', 'streamUrl', 'videoSrc', 'sourceUrl',
      // Trailer fields
      'trailerVideoUrl', 'trailerSrc', 'previewUrl', 'promoUrl',
      // Additional video fields
      'video', 'src', 'url', 'fileUrl', 'mediaUrl', 'contentUrl',
      'defaultUrl'
    ];

    urlFields.forEach(field => {
      if (transformed[field] && typeof transformed[field] === 'string' && transformed[field].startsWith('http://')) {
        // Use a working proxy service for immediate production deployment
        const originalUrl = transformed[field];

        // For videos (.mp4, .webm, .m3u8)
        if (originalUrl.includes('.mp4') || originalUrl.includes('.webm') || originalUrl.includes('.m3u8')) {
          // Use working proxy services for videos
          const videoProxies = [
            `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(originalUrl)}`,
            `https://corsproxy.io/?${originalUrl}`,
            `https://proxy.cors.sh/${originalUrl}`
          ];

          // Use the first proxy service (most reliable)
          transformed[field] = videoProxies[0];
        } else {
          // Use image proxy for images
          transformed[field] = `https://images.weserv.nl/?url=${encodeURIComponent(originalUrl)}`;
        }

        console.log(`🔄 Proxy URL: ${originalUrl} → ${transformed[field]}`);
      }
    });

    // Handle nested objects (like videos array)
    if (transformed.videos && Array.isArray(transformed.videos)) {
      transformed.videos = transformed.videos.map(video => transformImageUrls(video));
    }

    // Handle parts array in episodes
    if (transformed.parts && Array.isArray(transformed.parts)) {
      transformed.parts = transformed.parts.map(part => transformImageUrls(part));
    }

    // Handle sources array in video objects
    if (transformed.sources && Array.isArray(transformed.sources)) {
      transformed.sources = transformed.sources.map(source => {
        if (source.url && typeof source.url === 'string' && source.url.startsWith('http://')) {
          if (source.url.includes('.mp4') || source.url.includes('.webm') || source.url.includes('.m3u8')) {
            // Use working proxy services for videos
            const videoProxies = [
              `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(source.url)}`,
              `https://corsproxy.io/?${source.url}`,
              `https://proxy.cors.sh/${source.url}`
            ];

            // Use the first proxy service (most reliable)
            source.url = videoProxies[0];
          } else {
            source.url = `https://images.weserv.nl/?url=${encodeURIComponent(source.url)}`;
          }
        }
        return source;
      });
    }

    return transformed;
  }

  return data;
};
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

// Response interceptor for error handling and URL transformation
api.interceptors.response.use(
  (response) => {
    // Apply image proxy transformation to all responses
    response.data = transformImageUrls(response.data);
    return response;
  },
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
            console.log('Video data:', {
              id: video._id,
              title: video.videoTitle,
              thumb: video.thumb,
              poster: video.poster,
              videoUrl: video.videoUrl,
              streamUrl: video.streamUrl
            });

            return video;
          }) || []
        );

        // Apply image proxy transformation to flattened videos
        const transformedVideos = flattenedVideos.map(video => {
          console.log(`🔄 Processing video for transformation - NODE_ENV: ${import.meta.env.NODE_ENV}`);
          return transformImageUrls(video);
        });

        return { ...response, data: { videos: transformedVideos } };
      }

      return response;
    } catch (error) {
      throw error;
    }
  },
  getVideosAll: () => api.get('/videos/all'),
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


// Banners API calls
export const bannerAPI = {
  getBanner: async () => {
    try {
      const response = await api.get('/banners');

      console.log('🎬 Raw banner response:', response.data);

      // Ensure banners array exists
      if (!response.data) {
        response.data = { banners: [] };
      }

      if (!Array.isArray(response.data.banners)) {
        response.data.banners = [];
      }

      console.log('🎬 Banner array length:', response.data.banners.length);

      // Process each banner
      response.data.banners = response.data.banners.map(banner => {
        console.log('🎬 Processing banner:', banner);

        // Ensure imageUrl exists and is HTTP
        let imageUrl = banner.imageUrl;
        if (!imageUrl && banner.imageKey) {
          imageUrl = `http://103.180.212.106:9000/ott-vods/${banner.imageKey}`;
        }

        if (imageUrl && imageUrl.startsWith('http://')) {
          // Transform to HTTPS proxy
          const transformedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}`;
          console.log(`✅ Banner transformed: ${imageUrl} → ${transformedUrl}`);

          return {
            ...banner,
            imageUrl: transformedUrl,
            altText: `Banner ${banner._id || ''}`,
            status: banner.status || 'active',
            createdAt: banner.createdAt || new Date().toISOString(),
          };
        }

        return banner;
      });

      console.log('🎬 Final transformed banners:', response.data.banners);
      return response;

    } catch (error) {
      console.error('❌ Banner API error:', error);
      throw error;
    }
  },
  createBanner: (bannerData) => api.post('/banners', bannerData),
  uploadBanners: (bannersData) => api.post('admin/banners', bannersData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteBanner: (bannerId) => api.delete(`/admin/banners/${bannerId}`),
  updateBannerStatus: (bannerId, status) => api.patch(`/banners/${bannerId}/status`, { status }),
  // updateBanner : (bannerId) => api.patch(`/admin/banners/${bannerId}`)
  updateBanner: (id, formData, config) => api.patch(`/admin/banners/${id}`, formData, config)
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
