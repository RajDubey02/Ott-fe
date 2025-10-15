









import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import SubscriptionModal from '../components/SubscriptionModal';
import { videosAPI, handleApiError } from '../services/api';
import { checkEpisodeAccess, isUserLoggedIn } from '../utils/subscriptionUtils';
import { useAuth } from '../contexts/AuthContext';

const Watch = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [episodeData, setEpisodeData] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEpisodeMode, setIsEpisodeMode] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    if (name) {
      fetchData();
    }
  }, [name]);

  const fetchData = async () => {
    try {
      console.log('🔍 Starting fetchData for:', name);
      console.log('🔍 isVideoId check:', /^[a-fA-F0-9]{24}$/.test(name));

      // Try to detect if name is an episode name or video ID
      // MongoDB ObjectIds are 24 hex characters
      const isVideoId = /^[a-fA-F0-9]{24}$/.test(name);
      console.log('🔍 isVideoId result:', isVideoId);

      if (isVideoId) {
        console.log('🔍 Taking video ID path for:', name);
        // It's a video ID, fetch individual video
        await fetchVideoData(name);
        setIsEpisodeMode(false);
      } else {
        console.log('🔍 Taking episode name path for:', name);
        // It's likely an episode name, fetch episode data
        await fetchEpisodeData(name);
        setIsEpisodeMode(true);
      }

      console.log('✅ fetchData completed successfully');
      console.log('📊 Episode data state:', episodeData);
      console.log('📊 Selected video state:', selectedVideo);
      console.log('📊 isEpisodeMode:', isEpisodeMode);

    } catch (error) {
      console.log('❌ Initial fetch error:', error);
      console.log('❌ Error response:', error.response);

      // If initial detection failed, try the other approach
      if (!isVideoId) {
        console.log('🔄 Trying video ID approach for:', name);
        await fetchVideoData(name);
        setIsEpisodeMode(false);
      } else {
        console.log('🔄 Trying episode name approach for:', name);
        await fetchEpisodeData(name);
        setIsEpisodeMode(true);
      }
    } finally {
      console.log('🏁 Setting loading to false');
      console.log('📊 Final states - episodeData:', !!episodeData, 'selectedVideo:', !!selectedVideo);
      setLoading(false);
    }
  };

  const fetchEpisodeData = async (episodeName) => {
    try {
      console.log('🚀 Starting fetchEpisodeData for:', episodeName);

      try {
        console.log('📡 Calling getVideoByEpisodeName API for:', episodeName);
        const response = await videosAPI.getVideoByEpisodeName(episodeName);
        const episodeData = response.data;

        console.log('✅ Episode data received:', episodeData);
        console.log('📊 Episode data structure:', {
          episodeName: episodeData.episodeName,
          count: episodeData.count,
          parts: episodeData.parts?.length || 0
        });

        setEpisodeData(episodeData);

        if (episodeData?.parts && episodeData.parts.length > 0) {
          console.log('🎬 Setting first video as selected:', episodeData.parts[0]);
          setSelectedVideo(episodeData.parts[0]);
        } else {
          console.warn('⚠️ No parts found in episode data');
        }

      } catch (episodeError) {
        console.log('❌ Episode API failed, trying video ID API');
        console.log('❌ Episode error:', episodeError.response?.data);

        const videoResponse = await videosAPI.getVideoById(episodeName);
        const videoData = videoResponse.data.video || videoResponse.data;

        console.log('✅ Video data received:', videoData);
        const mockEpisodeData = {
          episodeName: videoData.episodeName || videoData.videoTitle || videoData.title,
          count: 1,
          parts: [videoData]
        };

        setEpisodeData(mockEpisodeData);
        setSelectedVideo(videoData);
      }

    } catch (error) {
      console.log('🔥 API Error in fetchEpisodeData:', error);
      console.log('🔥 Error response:', error.response?.data);

      // Check if it's a subscription required error
      if (error.response?.data?.message?.includes('Subscription required')) {
        console.log('🎫 Subscription required for episode:', episodeName);
        setShowSubscriptionModal(true);
        return;
      }

      // Check if it's ObjectId cast error (episode name vs video ID)
      if (error.response?.data?.message?.includes('Cast to ObjectId failed')) {
        console.log('🔄 This is an episode name, not video ID. Trying episode API...');
        try {
          const response = await videosAPI.getVideoByEpisodeName(episodeName);
          const episodeData = response.data;

          console.log('✅ Episode data received:', episodeData);
          setEpisodeData(episodeData);

          if (episodeData?.parts && episodeData.parts.length > 0) {
            setSelectedVideo(episodeData.parts[0]);
          }
        } catch (episodeAPIError) {
          console.log('❌ Episode API also failed:', episodeAPIError.response?.data);
          if (episodeAPIError.response?.data?.message?.includes('Subscription required')) {
            console.log('🎫 Subscription required for episode:', episodeName);
            setShowSubscriptionModal(true);
            return;
          }
          handleApiError(episodeAPIError);
          navigate('/');
        }
        return;
      }

      handleApiError(error);
      navigate('/');
    }
  };

  const fetchVideoData = async (videoId) => {
    try {
      console.log('📡 Calling getVideoById API for:', videoId);
      const response = await videosAPI.getVideoById(videoId);
      const videoData = response.data.video || response.data;

      console.log('✅ Video data received:', videoData);

      const mockEpisodeData = {
        episodeName: videoData.episodeName || videoData.videoTitle || videoData.title,
        count: 1,
        parts: [videoData]
      };

      setEpisodeData(mockEpisodeData);
      setSelectedVideo(videoData);

    } catch (error) {
      console.log('❌ Video API Error:', error);
      console.log('❌ Video error response:', error.response?.data);

      // Check if it's a subscription required error
      if (error.response?.data?.message?.includes('Subscription required')) {
        console.log('🎫 Subscription required for video:', videoId);
        setShowSubscriptionModal(true);
        return;
      }

      handleApiError(error);
      navigate('/');
    }
  };

  const handleVideoSelect = (video) => {
    console.log('🎬 Video selected:', video);
    setSelectedVideo(video);
  };

  const handlePlayVideo = async () => {
    if (!selectedVideo) {
      console.warn('⚠️ No video selected');
      return;
    }

    if (!isUserLoggedIn()) {
      console.log('🔒 User not logged in, redirecting to login');
      toast.error('Please login to watch videos');
      navigate('/login');
      return;
    }

    try {
      const hasAccess = await checkEpisodeAccess(selectedVideo.id || selectedVideo._id);
      if (!hasAccess) {
        console.log('🎫 Subscription required for video:', selectedVideo.id || selectedVideo._id);
        setShowSubscriptionModal(true);
        return;
      }

      console.log('▶️ Playing video:', selectedVideo);
      navigate(`/play/${selectedVideo.id || selectedVideo._id}`);
    } catch (error) {
      console.log('❌ Error checking episode access:', error);
      handleApiError(error);
      // Don't navigate on error, stay on the same page
    }
  };

  const handleSubscriptionSuccess = () => {
    console.log('🎉 Subscription successful');
    setShowSubscriptionModal(false);
    // Re-fetch data to ensure access is granted
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!episodeData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Content not found</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => navigate(-1)}
          className="bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-4">
                {episodeData.episodeName}
              </h1>

              {isEpisodeMode ? (
                <p className="text-lg text-gray-400 mb-6">
                  {episodeData.count} parts available
                </p>
              ) : (
                <p className="text-lg text-gray-400 mb-6">
                  Single video
                </p>
              )}
            </div>

            {isEpisodeMode && (
              <div className="space-y-3 mb-8">
                <h3 className="text-white text-lg font-semibold mb-3">Episode Parts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {episodeData.parts?.map((part, index) => (
                    <div
                      key={part.id || part._id}
                      onClick={() => handleVideoSelect(part)}
                      className={`relative cursor-pointer rounded-lg overflow-hidden transition-all hover:scale-105 ${
                        selectedVideo?.id === part.id || selectedVideo?._id === part._id ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <div className="aspect-video bg-gray-800 relative">
                        <img
                          src={part.thumbUrl || part.posterUrl || part.poster || '/api/placeholder/300/200'}
                          alt={part.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/api/placeholder/300/200';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                          <div className="text-white text-center">
                            <div className="text-2xl font-bold mb-1">{part.episodeSeq || index + 1}</div>
                            <div className="text-sm opacity-90">Part {part.episodeSeq || index + 1}</div>
                          </div>
                        </div>
                        {(selectedVideo?.id === part.id || selectedVideo?._id === part._id) && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Selected
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-gray-900">
                        <h4 className="text-white font-medium text-sm line-clamp-2 mb-1">
                          {part.title || `Episode ${part.episodeSeq || index + 1}`}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedVideo && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {selectedVideo.title || `Episode ${selectedVideo.episodeSeq}`}
                    </h2>
                    <p className="text-gray-400">
                      {isEpisodeMode ? `Part ${selectedVideo.episodeSeq}` : 'Single Video'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePlayVideo}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Play Video
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  {selectedVideo.releaseDate && (
                    <span>{new Date(selectedVideo.releaseDate).getFullYear()}</span>
                  )}
                  {selectedVideo.runtimeMinutes && (
                    <span>{Math.floor(selectedVideo.runtimeMinutes / 60)}h {selectedVideo.runtimeMinutes % 60}m</span>
                  )}
                  {selectedVideo.quality && (
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                      {selectedVideo.quality}
                    </span>
                  )}
                  {selectedVideo.imdbRating && (
                    <span className="flex items-center">
                      ⭐ {selectedVideo.imdbRating}
                    </span>
                  )}
                </div>

                {selectedVideo.description && (
                  <div>
                    <h3 className="text-white text-lg font-semibold mb-2">Description</h3>
                    <p className="text-gray-300 leading-relaxed">{selectedVideo.description}</p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">
                {isEpisodeMode ? 'Episode Info' : 'Video Info'}
              </h3>
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white">{isEpisodeMode ? 'Episode' : 'Single Video'}</span>
                  </div>
                  {isEpisodeMode && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Parts:</span>
                      <span className="text-white">{episodeData.count}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Title:</span>
                    <span className="text-white">{episodeData.episodeName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscriptionSuccess={handleSubscriptionSuccess}
      />
    </div>
  );
};

export default Watch;



















