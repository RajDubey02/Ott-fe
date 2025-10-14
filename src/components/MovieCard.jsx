import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, Star, Clock } from 'lucide-react';

const MovieCard = ({ video, size = 'medium', showDetails = true }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    small: 'w-32 h-48',
    medium: 'w-48 h-72',
    large: 'w-64 h-96'
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatRating = (rating) => {
    return rating ? parseFloat(rating).toFixed(1) : 'N/A';
  };

  return (
    <div className="group relative cursor-pointer transition-transform duration-300 hover:scale-105">
      <Link to={`/watch/${video._id || video.id}`}>
        <div className={`${sizeClasses[size]} relative overflow-hidden rounded-lg bg-gray-800`}>
          {/* Poster Image */}
          {!imageError ? (
            <img
              src={video.thumb || video.poster || video.posterUrl || video.thumbUrl || '/api/placeholder/300/450'}
              alt={video.videoTitle || video.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700">
              <div className="text-center text-gray-400">
                <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Play className="w-8 h-8" />
                </div>
                <p className="text-sm font-medium">{video.videoTitle || video.title}</p>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-700 animate-pulse" />
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-2 mx-auto backdrop-blur-sm">
                <Play className="w-6 h-6 text-white ml-1" />
              </div>
              <p className="text-white text-sm font-medium">Play Now</p>
            </div>
          </div>

          {/* Quality Badge */}
          {video.quality && (
            <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
              {video.quality}
            </div>
          )}

          {/* Episode Badge */}
          {video.episodeName && (
            <div className="absolute top-2 left-2 bg-gray-900 bg-opacity-80 text-white text-xs px-2 py-1 rounded">
              {video.episodeName}
            </div>
          )}
        </div>
      </Link>

      {/* Movie Details */}
      {showDetails && (
        <div className="mt-3 space-y-1">
          <h3 className="text-white font-medium text-sm line-clamp-2 group-hover:text-blue-400 transition-colors">
            {video.videoTitle || video.title}
          </h3>
          
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            {video.imdbRating && (
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span>{formatRating(video.imdbRating)}</span>
              </div>
            )}
            
            {video.runtimeMinutes && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(video.runtimeMinutes)}</span>
              </div>
            )}
            
            {video.releaseDate && (
              <span>{new Date(video.releaseDate).getFullYear()}</span>
            )}
          </div>

          {video.genre && (
            <p className="text-xs text-gray-500">{video.genre}</p>
          )}

          {video.description && size === 'large' && (
            <p className="text-xs text-gray-400 line-clamp-2 mt-2">
              {video.description}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons (on hover) */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          className="w-8 h-8 bg-gray-900 bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center text-white transition-colors"
          onClick={(e) => {
            e.preventDefault();
            // Add to watchlist logic
          }}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MovieCard;
