import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share, Download, Plus, Check } from 'lucide-react';
import Player from '../components/Player';
import MovieCard from '../components/MovieCard';
import { videosAPI, subscriptionsAPI, handleApiError, handleApiSuccess } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Watch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [watchProgress, setWatchProgress] = useState(0);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    if (id) {
      fetchVideo();
      if (isAuthenticated) {
        checkAccess();
        fetchSubscriptions();
      }
    }
  }, [id, isAuthenticated]);

  const fetchVideo = async () => {
    try {
      const response = await videosAPI.getVideoById(id);
      const videoData = response.data.video || response.data;

      setVideo(videoData);

      // Get video stream URL - construct based on the video ID and quality
      if (videoData && videoData._id) {
        // For demo purposes, we'll use a placeholder URL since we don't have the actual streaming endpoint
        // In production, this would be: `/api/v1/videos/stream/${videoData._id}`
        setVideoUrl(`https://spottt.codifyinstitute.org/api/v1/videos/${videoData._id}`);
      }

      // Fetch related videos
      const allVideosResponse = await videosAPI.getAllVideos();
      const allVideos = allVideosResponse.data.videos || [];
      const related = allVideos
        .filter(v => v._id !== id && v.genre === videoData.genre)
        .slice(0, 10);
      setRelatedVideos(related);
    } catch (error) {
      handleApiError(error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const checkAccess = async () => {
    // For demo purposes, we'll assume user has access
    // In real implementation, check user's subscription status
    setHasAccess(true);
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
    // Save progress to backend
    // progressAPI.saveProgress(id, progress.playedSeconds);
  };

  const handleVideoEnd = () => {
    toast.success('Video completed!');
    // Mark as watched
    // progressAPI.markAsWatched(id);
  };

  const toggleWatchlist = () => {
    setInWatchlist(!inWatchlist);
    if (!inWatchlist) {
      handleApiSuccess('Added to watchlist');
    } else {
      handleApiSuccess('Removed from watchlist');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: video.videoTitle,
        text: video.description,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
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
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => navigate(-1)}
          className="bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Video Player */}
      <div className="relative">
        <Player
          url={video.streamUrl || video.videoUrl || '/api/placeholder/video'}
          poster={video.poster}
          title={video.videoTitle}
          onProgress={handleProgress}
          onEnded={handleVideoEnd}
          startTime={watchProgress * (video.runtimeMinutes * 60 || 0)}
        />
      </div>

      {/* Video Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {video.videoTitle}
                </h1>
                {video.episodeName && (
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
                
                <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Video Details */}
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

            {/* Description */}
            {video.description && (
              <div>
                <h3 className="text-white text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-300 leading-relaxed">{video.description}</p>
              </div>
            )}

            {/* Cast and Crew */}
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

            {/* Languages and Countries */}
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Videos */}
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

        {/* More Related Videos */}
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
