
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Share, Download, Plus, Check } from 'lucide-react';
import Player from '../components/Player';
import MovieCard from '../components/MovieCard';
import { videosAPI, subscriptionsAPI, handleApiError, handleApiSuccess } from '../services/api';
import { checkEpisodeAccess, isUserLoggedIn } from '../utils/subscriptionUtils';
import { useAuth } from '../contexts/AuthContext';

const Watch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [watchProgress, setWatchProgress] = useState(0);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedQuality, setSelectedQuality] = useState('auto');
  const [availableQualities, setAvailableQualities] = useState([]);

  useEffect(() => {
    if (id) {
      fetchVideo();
      if (isAuthenticated) {
        checkAccess();
        fetchSubscriptions();
      }
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (video && isAuthenticated) {
      checkAccess();
    }
  }, [video]);

  // Log URL change without truncation
  useEffect(() => {
    if (videoUrl) {
      console.log('🎬 Final video URL set for player:', videoUrl);
    } else {
      console.log('⚠️ No video URL available for player');
    }
  }, [videoUrl]);

const fetchVideo = async () => {
  try {
    console.log('Fetching video for ID:', id);
    const response = await videosAPI.getVideoById(id);
    const videoData = response.data.video || response.data;

    console.log('Video data received:', videoData);
    console.log('Video sources available:', videoData?.sources);
    console.log('Default URL:', videoData?.defaultUrl);
    console.log('Expires In:', videoData?.expiresIn);

    setVideo(videoData);

    if (videoData?.sources) {
      const videoSources = videoData.sources.filter(source => source.type === 'video');
      const qualities = videoSources.map(source => ({
        quality: source.quality,
        url: source.url,
        label: source.quality.toUpperCase()
      }));
      setAvailableQualities(qualities);
      if (qualities.length > 0) {
        setSelectedQuality('auto');
      }
    }

    if (videoData && (videoData._id || videoData.id)) {
      if (videoData.defaultUrl) {
        console.log('✅ Using backend default URL:', videoData.defaultUrl);
        setVideoUrl(videoData.defaultUrl);
      } else if (videoData.sources && videoData.sources.length > 0) {
        const videoSources = videoData.sources.filter(source => source.type === 'video');
        const sortedSources = [...videoSources].sort((a, b) => {
          const qualityA = parseInt(a.quality) || 0;
          const qualityB = parseInt(b.quality) || 0;
          return qualityB - qualityA;
        });
        const bestQuality = sortedSources[0];
        console.log('🏆 Best quality found:', bestQuality.quality, 'at', bestQuality.url);
        setVideoUrl(bestQuality.url);
      } else {
        console.error('❌ No video sources or defaultUrl found');
        setVideoUrl('');
      }
    }

    // Check expiry and schedule refresh
    const expiresInMinutes = parseInt(videoData.expiresIn.split(' ')[0]);
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + expiresInMinutes);
    console.log('URL expiry time:', expiryTime);

    if (expiryTime < new Date(Date.now() + 5 * 60 * 1000)) { // Refresh if < 5 minutes left
      console.log('🔄 URL expiring soon, re-fetching video...');
      setTimeout(fetchVideo, 1000); // Re-fetch after 1 second to get a new URL
    }

    const allVideosResponse = await videosAPI.getAllVideos();
    const allVideos = allVideosResponse.data.videos || [];
    const related = allVideos
      .filter(v => (v._id || v.id) !== (videoData._id || videoData.id) && v.genre === videoData.genre)
      .slice(0, 10);
    setRelatedVideos(related);
  } catch (error) {
    handleApiError(error);
    navigate('/');
  } finally {
    setLoading(false);
  };
};

  const checkAccess = async () => {
    if (!isUserLoggedIn()) {
      setHasAccess(false);
      return;
    }

    try {
      const episodeId = video?._id || video?.id || id;
      const episodeName = video?.episodeName || video?.videoTitle || video?.title;

      console.log('Checking access for video:', { episodeId, episodeName });

      const hasAccessToVideo = await checkEpisodeAccess(episodeId, episodeName);
      console.log('Access result:', hasAccessToVideo);

      setHasAccess(hasAccessToVideo);
    } catch (error) {
      console.error('Error checking access:', error);
      setHasAccess(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await subscriptionsAPI.getMySubscriptions();
      setSubscriptions(response.data.subscriptions || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const handleProgress = (progress) => {
    setWatchProgress(progress.played);
  };

  const handleVideoEnd = () => {
    // toast.success('Video completed!');
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: video?.videoTitle || video?.title || 'Video',
        text: video?.description || 'Check out this video!',
        url: window.location.href,
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
      // toast.success('Link copied to clipboard!');
    }
  };

  const toggleWatchlist = () => {
    setInWatchlist(!inWatchlist);
    if (!inWatchlist) {
      handleApiSuccess('Added to watchlist');
    } else {
      handleApiSuccess('Removed from watchlist');
    }
  };

  const handleQualityChange = (newQuality) => {
    console.log('🔄 Quality change requested:', newQuality);
    setSelectedQuality(newQuality);

    if (video && video.sources) {
      const videoSources = video.sources.filter(source => source.type === 'video');

      if (newQuality === 'auto') {
        const sortedSources = [...videoSources].sort((a, b) => {
          const qualityA = parseInt(a.quality) || 0;
          const qualityB = parseInt(b.quality) || 0;
          return qualityB - qualityA;
        });

        if (sortedSources.length > 0) {
          const bestQuality = sortedSources[0];
          console.log('🏆 Switching to auto (highest quality):', bestQuality.quality, bestQuality.url);
          setVideoUrl(bestQuality.url);
        }
      } else {
        const selectedSource = videoSources.find(source => source.quality === newQuality);
        if (selectedSource) {
          console.log('🎯 Switching to specific quality:', newQuality, selectedSource.url);
          setVideoUrl(selectedSource.url);
        } else {
          console.error('❌ Quality not found:', newQuality);
        }
      }
    } else {
      console.error('❌ No video sources available for quality change');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading video...</div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Video not found</h2>
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <h2 className="text-2xl font-bold mb-4">Sign in required</h2>
          <p className="text-gray-400 mb-6">Please sign in to watch this video</p>
          <button
            onClick={() => navigate('/login', { state: { from: location } })}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <h2 className="text-2xl font-bold mb-4">Subscription required</h2>
          <p className="text-gray-400 mb-6">
            You need an active subscription to watch this content
          </p>
          <button
            onClick={() => navigate('/subscriptions')}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors"
          >
            View Plans
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

      <div className="relative">
        <Player
          url={videoUrl}
          poster={video?.posterUrl || video?.thumbUrl || video?.poster}
          title={video?.videoTitle || video?.title || video?.episodeName || 'Video'}
          onProgress={handleProgress}
          onEnded={handleVideoEnd}
          startTime={watchProgress * (video?.runtimeMinutes * 60 || 0)}
          autoPlay={true}
          key={videoUrl} // ✅ Re-added to force re-mount on URL change
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {video?.videoTitle || video?.title || video?.episodeName || 'Untitled Video'}
                </h1>
                {video?.episodeName && (
                  <p className="text-lg text-gray-400">{video.episodeName}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleWatchlist}
                  className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Share className="w-4 h-4" />
                  <span>Share</span>
                </button>

                {availableQualities.length > 1 && (
                  <div className="relative">
                    <select
                      value={selectedQuality}
                      onChange={(e) => handleQualityChange(e.target.value)}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors text-sm border border-gray-600"
                    >
                      {availableQualities.map((quality) => (
                        <option key={quality.quality} value={quality.quality}>
                          {quality.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              {video.releaseDate && (
                <span>{new Date(video.releaseDate).getFullYear()}</span>
              )}
              {video.runtimeMinutes && (
                <span>{Math.floor(video.runtimeMinutes / 60)}h {video.runtimeMinutes % 60}m</span>
              )}
              {video.quality && (
                <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                  {video.quality}
                </span>
              )}
              {video.imdbRating && (
                <span className="flex items-center">
                  ⭐ {video.imdbRating}
                </span>
              )}
              {video.genre && (
                <span>{video.genre}</span>
              )}
            </div>

            {video.description && (
              <div>
                <h3 className="text-white text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-300 leading-relaxed">{video.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {video.actors && video.actors.length > 0 && (
                <div>
                  <h3 className="text-white text-lg font-semibold mb-2">Cast</h3>
                  <div className="space-y-1">
                    {video.actors.map((actor, index) => (
                      <p key={index} className="text-gray-300">{actor}</p>
                    ))}
                  </div>
                </div>
              )}
              
              {video.writers && video.writers.length > 0 && (
                <div>
                  <h3 className="text-white text-lg font-semibold mb-2">Writers</h3>
                  <div className="space-y-1">
                    {video.writers.map((writer, index) => (
                      <p key={index} className="text-gray-300">{writer}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {video.languages && video.languages.length > 0 && (
                <div>
                  <h3 className="text-white text-lg font-semibold mb-2">Languages</h3>
                  <p className="text-gray-300">{video.languages.join(', ')}</p>
                </div>
              )}
              
              {video.countries && video.countries.length > 0 && (
                <div>
                  <h3 className="text-white text-lg font-semibold mb-2">Countries</h3>
                  <p className="text-gray-300">{video.countries.join(', ')}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {relatedVideos.length > 0 && (
              <div>
                <h3 className="text-white text-lg font-semibold mb-4">More Like This</h3>
                <div className="space-y-4">
                  {relatedVideos.slice(0, 5).map((relatedVideo) => (
                    <div key={relatedVideo._id} className="flex space-x-3">
                      <div className="flex-shrink-0 w-24 h-16">
                        <img
                          src={relatedVideo.thumb || relatedVideo.poster || '/api/placeholder/150/100'}
                          alt={relatedVideo.videoTitle}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white text-sm font-medium line-clamp-2 mb-1">
                          {relatedVideo.videoTitle}
                        </h4>
                        <p className="text-gray-400 text-xs">
                          {relatedVideo.runtimeMinutes && `${relatedVideo.runtimeMinutes}m`}
                          {relatedVideo.imdbRating && ` • ⭐ ${relatedVideo.imdbRating}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {relatedVideos.length > 5 && (
          <div className="mt-12">
            <h3 className="text-white text-xl font-semibold mb-6">You might also like</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {relatedVideos.slice(5).map((relatedVideo) => (
                <MovieCard
                  key={relatedVideo._id}
                  video={relatedVideo}
                  size="small"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Watch;