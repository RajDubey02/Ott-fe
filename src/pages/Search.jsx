import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter, X } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { videosAPI, categoriesAPI, handleApiError } from '../services/api';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    genre: '',
    year: '',
    rating: '',
    type: '',
    quality: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams, videos]);

  useEffect(() => {
    applyFilters();
  }, [filters, videos]);

  const fetchData = async () => {
    try {
      const [videosResponse, categoriesResponse] = await Promise.all([
        videosAPI.getAllVideos(),
        categoriesAPI.getCategories()
      ]);
      
      setVideos(videosResponse.data.videos || videosResponse.data || []);
      setCategories(categoriesResponse.data.categories || categoriesResponse.data || []);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = (query) => {
    if (!query.trim()) {
      setFilteredVideos(videos);
      return;
    }

    const searchTerm = query.toLowerCase();
    const results = videos.filter(video => 
      video.videoTitle?.toLowerCase().includes(searchTerm) ||
      video.description?.toLowerCase().includes(searchTerm) ||
      video.genre?.toLowerCase().includes(searchTerm) ||
      video.actors?.some(actor => actor.toLowerCase().includes(searchTerm)) ||
      video.writers?.some(writer => writer.toLowerCase().includes(searchTerm)) ||
      video.episodeName?.toLowerCase().includes(searchTerm)
    );
    
    setFilteredVideos(results);
  };

  const applyFilters = () => {
    let filtered = searchQuery ? 
      videos.filter(video => 
        video.videoTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.genre?.toLowerCase().includes(searchQuery.toLowerCase())
      ) : videos;

    // Apply genre filter
    if (filters.genre) {
      filtered = filtered.filter(video => 
        video.genre?.toLowerCase() === filters.genre.toLowerCase()
      );
    }

    // Apply year filter
    if (filters.year) {
      filtered = filtered.filter(video => {
        const videoYear = new Date(video.releaseDate).getFullYear();
        return videoYear.toString() === filters.year;
      });
    }

    // Apply rating filter
    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      filtered = filtered.filter(video => 
        parseFloat(video.imdbRating) >= minRating
      );
    }

    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter(video => 
        video.videoType === filters.type
      );
    }

    // Apply quality filter
    if (filters.quality) {
      filtered = filtered.filter(video => 
        video.quality === filters.quality
      );
    }

    setFilteredVideos(filtered);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      genre: '',
      year: '',
      rating: '',
      type: '',
      quality: ''
    });
  };

  const getUniqueValues = (key) => {
    const values = videos.map(video => {
      if (key === 'year') {
        return new Date(video.releaseDate).getFullYear();
      }
      return video[key];
    }).filter(Boolean);
    return [...new Set(values)].sort();
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">Search</h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative max-w-2xl">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search movies, series, episodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-lg"
              />
            </div>
          </form>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            
            {searchQuery && (
              <p className="text-gray-400">
                {filteredVideos.length} results for "{searchQuery}"
              </p>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Genre Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
                <select
                  value={filters.genre}
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Genres</option>
                  {getUniqueValues('genre').map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Years</option>
                  {getUniqueValues('year').map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Min Rating</label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Any Rating</option>
                  <option value="7">7.0+</option>
                  <option value="8">8.0+</option>
                  <option value="9">9.0+</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="movie">Movies</option>
                  <option value="episode">Episodes</option>
                  <option value="series">Series</option>
                </select>
              </div>

              {/* Quality Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Quality</label>
                <select
                  value={filters.quality}
                  onChange={(e) => handleFilterChange('quality', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Quality</option>
                  {getUniqueValues('quality').map(quality => (
                    <option key={quality} value={quality}>{quality}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div>
          {filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <SearchIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchQuery ? 'No results found' : 'Start searching'}
              </h3>
              <p className="text-gray-400">
                {searchQuery 
                  ? `Try adjusting your search or filters`
                  : 'Search for movies, series, and episodes'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {searchQuery ? `Results for "${searchQuery}"` : 'All Content'}
                </h2>
                <span className="text-gray-400">
                  {filteredVideos.length} {filteredVideos.length === 1 ? 'result' : 'results'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {filteredVideos.map((video) => (
                  <MovieCard
                    key={video._id}
                    video={video}
                    size="medium"
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
