

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Info, ChevronLeft, ChevronRight, Calendar, Star } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { videosAPI, handleApiError } from '../services/api';
import { checkSubscriptionStatus, checkEpisodeAccess, isUserLoggedIn } from '../utils/subscriptionUtils';
import toast from 'react-hot-toast';
import SubscriptionModal from '../components/SubscriptionModal';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [featuredVideo, setFeaturedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState(null); // Added to store video ID
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await videosAPI.getAllVideos();
      const videoData = response.data.videos || response.data || [];
      setVideos(videoData);

      if (videoData.length > 0) {
        setFeaturedVideo(videoData[0]);
      }

      const episodeGroups = {};
      videoData.forEach(video => {
        const episodeName = video.episodeName || video.videoTitle || 'Unknown Episode';
        if (!episodeGroups[episodeName]) {
          episodeGroups[episodeName] = {
            episodeName,
            videos: [],
            latestRelease: null,
            totalEpisodes: 0,
            poster: null,
            thumb: null
          };
        }

        episodeGroups[episodeName].videos.push(video);
        episodeGroups[episodeName].totalEpisodes++;

        const releaseDate = new Date(video.releaseDate || video.createdAt);
        if (!episodeGroups[episodeName].latestRelease ||
            releaseDate > new Date(episodeGroups[episodeName].latestRelease)) {
          episodeGroups[episodeName].latestRelease = video.releaseDate || video.createdAt;
        }

        if (!episodeGroups[episodeName].poster && (video.poster || video.posterUrl)) {
          episodeGroups[episodeName].poster = video.poster || video.posterUrl;
        }
        if (!episodeGroups[episodeName].thumb && (video.thumb || video.thumbUrl)) {
          episodeGroups[episodeName].thumb = video.thumb || video.thumbUrl;
        }
      });

      const episodesArray = Object.values(episodeGroups).sort((a, b) =>
        new Date(b.latestRelease) - new Date(a.latestRelease)
      );

      setEpisodes(episodesArray);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayClick = async () => {
    if (!isUserLoggedIn()) {
      toast.error('Please login to watch videos');
      navigate('/login');
      return;
    }

    if (!featuredVideo?._id) {
      toast.error('No video selected');
      return;
    }

    try {
      const hasAccess = await checkEpisodeAccess(featuredVideo._id, featuredVideo.videoTitle);
      if (!hasAccess) {
        setSelectedVideoId(featuredVideo._id);
        setShowSubscriptionModal(true);
        return;
      }
      navigate(`/watch/${featuredVideo._id}`);
    } catch (error) {
      toast.error('Error checking access. Please try again.');
      console.error('Access check error:', error);
    }
  };

  const handleEpisodeClick = async (episode) => {
    if (!isUserLoggedIn()) {
      toast.error('Please login to watch episodes');
      navigate('/login');
      return;
    }

    const firstVideoId = episode.videos[0]?._id;
    if (!firstVideoId) {
      toast.error('No videos available for this episode');
      return;
    }

    try {
      const hasAccess = await checkEpisodeAccess(firstVideoId, episode.episodeName);
      if (!hasAccess) {
        setSelectedVideoId(firstVideoId);
        setShowSubscriptionModal(true);
        return;
      }
      navigate(`/watch/${episode.episodeName}`);
    } catch (error) {
      toast.error('Error checking access. Please try again.');
      console.error('Access check error:', error);
    }
  };

  const handleSubscriptionSuccess = () => {
    setShowSubscriptionModal(false);
    if (selectedVideoId) {
      navigate(`/watch/${selectedVideoId}`);
    } else {
      toast.success('Subscription successful! Browse content to watch.');
    }
  };

  const getVideosByCategory = (category) => {
    return videos.filter(video =>
      video.genre?.toLowerCase().includes(category.toLowerCase()) ||
      video.videoType === category
    );
  };

  const getTrendingVideos = () => {
    return videos.slice(0, 10);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).getFullYear();
  };

  const EpisodeGrid = ({ episodes, viewAllLink }) => {
    if (!episodes || episodes.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-semibold">Episodes</h2>
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              View All
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {episodes.slice(0, 12).map((episode) => (
            <div
              key={episode.episodeName}
              onClick={() => handleEpisodeClick(episode)}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-lg bg-gray-800 transition-transform duration-300 group-hover:scale-105">
                <div className="aspect-[3/4] relative">
                  <img
                    src={episode.poster || episode.thumb || '/api/placeholder/300/400'}
                    alt={episode.episodeName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/300/400';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    {episode.totalEpisodes} parts
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {episode.episodeName}
                  </h3>
                  <div className="space-y-1 text-xs text-gray-400">
                    {episode.latestRelease && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(episode.latestRelease)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span>{episode.totalEpisodes} Episodes</span>
                      {episode.videos[0]?.imdbRating && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span>{parseFloat(episode.videos[0].imdbRating).toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    {episode.videos[0]?.genre && (
                      <p className="text-xs text-gray-500">{episode.videos[0].genre}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ScrollableRow = ({ title, videos, viewAllLink }) => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const containerRef = useRef(null);

    const scroll = (direction) => {
      const container = containerRef.current;
      if (container) {
        const scrollAmount = 300;
        const newPosition = direction === 'left'
          ? Math.max(0, scrollPosition - scrollAmount)
          : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount);
        container.scrollTo({ left: newPosition, behavior: 'smooth' });
        setScrollPosition(newPosition);
      }
    };

    if (!videos || videos.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-semibold">{title}</h2>
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              View All
            </Link>
          )}
        </div>
        <div className="relative group">
          <div
            ref={containerRef}
            className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {videos.map((video, index) => (
              <div key={video._id || index} className="flex-shrink-0">
                <MovieCard video={video} size="medium" />
              </div>
            ))}
          </div>
          {videos.length > 5 && (
            <>
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-r-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {featuredVideo && (
        <div className="relative h-screen">
          <div className="absolute inset-0">
            <img
              src={featuredVideo.poster || '/api/placeholder/1920/1080'}
              alt={featuredVideo.videoTitle}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>
          <div className="relative z-10 flex items-center h-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                  {featuredVideo.videoTitle}
                </h1>
                {featuredVideo.description && (
                  <p className="text-lg text-gray-300 mb-6 line-clamp-3">
                    {featuredVideo.description}
                  </p>
                )}
                <div className="flex items-center space-x-4 mb-8">
                  {featuredVideo.imdbRating && (
                    <span className="bg-yellow-500 text-black px-2 py-1 rounded text-sm font-semibold">
                      ⭐ {featuredVideo.imdbRating}
                    </span>
                  )}
                  {featuredVideo.releaseDate && (
                    <span className="text-gray-300">
                      {new Date(featuredVideo.releaseDate).getFullYear()}
                    </span>
                  )}
                  {featuredVideo.genre && (
                    <span className="text-gray-300">{featuredVideo.genre}</span>
                  )}
                  {featuredVideo.runtimeMinutes && (
                    <span className="text-gray-300">
                      {Math.floor(featuredVideo.runtimeMinutes / 60)}h {featuredVideo.runtimeMinutes % 60}m
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handlePlayClick}
                    className="bg-white hover:bg-gray-200 text-black px-8 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    <span>Play</span>
                  </button>
                  <Link
                    to={`/movie/${featuredVideo._id}`}
                    className="bg-gray-600 bg-opacity-70 hover:bg-opacity-90 text-white px-8 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
                  >
                    <Info className="w-5 h-5" />
                    <span>More Info</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <EpisodeGrid
          episodes={episodes}
          viewAllLink="/episodes"
        />
      </div>
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscriptionSuccess={handleSubscriptionSuccess}
      />
    </div>
  );
};

export default Home;