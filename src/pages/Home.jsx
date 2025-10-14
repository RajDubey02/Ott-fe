import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { videosAPI, handleApiError } from '../services/api';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [featuredVideo, setFeaturedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await videosAPI.getAllVideos();
      const videoData = response.data.videos || response.data || [];
      setVideos(videoData);
      
      // Set featured video (first video or random)
      if (videoData.length > 0) {
        setFeaturedVideo(videoData[0]);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
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

  const getRecentVideos = () => {
    return videos
      .sort((a, b) => new Date(b.createdAt || b.releaseDate) - new Date(a.createdAt || a.releaseDate))
      .slice(0, 10);
  };

  const ScrollableRow = ({ title, videos, viewAllLink }) => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const containerRef = useState(null);

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
      {/* Hero Section */}
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
                  <Link
                    to={`/watch/${featuredVideo._id}`}
                    className="bg-white hover:bg-gray-200 text-black px-8 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    <span>Play</span>
                  </Link>
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

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Trending Now */}
        <ScrollableRow 
          title="Trending Now" 
          videos={getTrendingVideos()} 
          viewAllLink="/trending"
        />

        {/* Recently Added */}
        <ScrollableRow 
          title="Recently Added" 
          videos={getRecentVideos()} 
          viewAllLink="/recent"
        />

        {/* Drama Series */}
        <ScrollableRow 
          title="Drama Series" 
          videos={getVideosByCategory('drama')} 
          viewAllLink="/genre/drama"
        />

        {/* Action Movies */}
        <ScrollableRow 
          title="Action" 
          videos={getVideosByCategory('action')} 
          viewAllLink="/genre/action"
        />

        {/* Comedy */}
        <ScrollableRow 
          title="Comedy" 
          videos={getVideosByCategory('comedy')} 
          viewAllLink="/genre/comedy"
        />

        {/* Episodes */}
        <ScrollableRow 
          title="Episodes" 
          videos={videos.filter(v => v.videoType === 'episode')} 
          viewAllLink="/episodes"
        />
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Home;
