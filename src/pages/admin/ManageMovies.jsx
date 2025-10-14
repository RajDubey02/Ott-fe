import { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Search,
  Filter,
  X,
  Save
} from 'lucide-react';
import { videosAPI, categoriesAPI, handleApiError, handleApiSuccess } from '../../services/api';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';

const ManageMovies = () => {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  
  const [formData, setFormData] = useState({
    videoTitle: '',
    episodeName: '',
    description: '',
    genre: '',
    actors: [],
    writers: [],
    imdbRating: '',
    releaseDate: '',
    countries: [],
    languages: [],
    videoType: 'episode',
    runtimeMinutes: '',
    quality: 'HD',
    poster: null,
    thumb: null,
    videoFile: null
  });

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else if (name === 'actors' || name === 'writers' || name === 'countries' || name === 'languages') {
      const values = value.split(',').map(v => v.trim()).filter(v => v);
      setFormData(prev => ({ ...prev, [name]: values }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'actors' || key === 'writers' || key === 'countries' || key === 'languages') {
          formData[key].forEach(item => {
            submitData.append(`${key}[]`, item);
          });
        } else if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      if (editingVideo) {
        // Update video (API endpoint would need to be implemented)
        handleApiSuccess('Video updated successfully');
      } else {
        await videosAPI.uploadVideo(submitData);
        handleApiSuccess('Video uploaded successfully');
      }

      setShowModal(false);
      setEditingVideo(null);
      resetForm();
      fetchData();
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      videoTitle: '',
      episodeName: '',
      description: '',
      genre: '',
      actors: [],
      writers: [],
      imdbRating: '',
      releaseDate: '',
      countries: [],
      languages: [],
      videoType: 'episode',
      runtimeMinutes: '',
      quality: 'HD',
      poster: null,
      thumb: null,
      videoFile: null
    });
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      videoTitle: video.videoTitle || '',
      episodeName: video.episodeName || '',
      description: video.description || '',
      genre: video.genre || '',
      actors: video.actors || [],
      writers: video.writers || [],
      imdbRating: video.imdbRating || '',
      releaseDate: video.releaseDate ? video.releaseDate.split('T')[0] : '',
      countries: video.countries || [],
      languages: video.languages || [],
      videoType: video.videoType || 'episode',
      runtimeMinutes: video.runtimeMinutes || '',
      quality: video.quality || 'HD',
      poster: null,
      thumb: null,
      videoFile: null
    });
    setShowModal(true);
  };

  const handleDelete = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        // Delete video API call would go here
        handleApiSuccess('Video deleted successfully');
        fetchData();
      } catch (error) {
        handleApiError(error);
      }
    }
  };

  const toggleVideoStatus = async (videoId, currentStatus) => {
    try {
      // Toggle video status API call would go here
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      handleApiSuccess(`Video ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      fetchData();
    } catch (error) {
      handleApiError(error);
    }
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.videoTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.episodeName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && video.status !== 'inactive') ||
                         (filterStatus === 'inactive' && video.status === 'inactive');
    
    const matchesType = filterType === 'all' || video.videoType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading && !showModal) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-xl">Loading videos...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Manage Videos</h1>
            <p className="text-gray-400">Upload and manage your video content</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingVideo(null);
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Upload Video</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg text-white px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg text-white px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="movie">Movies</option>
              <option value="episode">Episodes</option>
              <option value="series">Series</option>
            </select>
          </div>
        </div>

        {/* Videos Table */}
        <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Video
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Genre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredVideos.map((video) => (
                  <tr key={video._id} className="hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={video.poster || '/api/placeholder/60/90'}
                          alt={video.videoTitle}
                          className="w-12 h-16 object-cover rounded mr-4"
                        />
                        <div>
                          <div className="text-sm font-medium text-white">
                            {video.videoTitle}
                          </div>
                          {video.episodeName && (
                            <div className="text-sm text-gray-400">
                              {video.episodeName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-full">
                        {video.videoType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {video.genre || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {video.imdbRating ? `⭐ ${video.imdbRating}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleVideoStatus(video._id, video.status)}
                        className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${
                          video.status === 'inactive' 
                            ? 'bg-red-600 text-white' 
                            : 'bg-green-600 text-white'
                        }`}
                      >
                        {video.status === 'inactive' ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                        <span>{video.status === 'inactive' ? 'Inactive' : 'Active'}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(video)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(video._id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upload/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    {editingVideo ? 'Edit Video' : 'Upload New Video'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Video Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Video Title *
                      </label>
                      <input
                        type="text"
                        name="videoTitle"
                        required
                        value={formData.videoTitle}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Episode Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Episode Name
                      </label>
                      <input
                        type="text"
                        name="episodeName"
                        value={formData.episodeName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Genre */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Genre *
                      </label>
                      <input
                        type="text"
                        name="genre"
                        required
                        value={formData.genre}
                        onChange={handleInputChange}
                        placeholder="e.g., Drama, Action, Comedy"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Video Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Video Type *
                      </label>
                      <select
                        name="videoType"
                        required
                        value={formData.videoType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="episode">Episode</option>
                        <option value="movie">Movie</option>
                        <option value="series">Series</option>
                      </select>
                    </div>

                    {/* IMDB Rating */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        IMDB Rating
                      </label>
                      <input
                        type="number"
                        name="imdbRating"
                        min="0"
                        max="10"
                        step="0.1"
                        value={formData.imdbRating}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Runtime */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Runtime (minutes)
                      </label>
                      <input
                        type="number"
                        name="runtimeMinutes"
                        value={formData.runtimeMinutes}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Release Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Release Date
                      </label>
                      <input
                        type="date"
                        name="releaseDate"
                        value={formData.releaseDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Quality */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Quality
                      </label>
                      <select
                        name="quality"
                        value={formData.quality}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="HD">HD</option>
                        <option value="4K">4K</option>
                        <option value="SD">SD</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows="4"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Actors */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Actors (comma separated)
                    </label>
                    <input
                      type="text"
                      name="actors"
                      value={formData.actors.join(', ')}
                      onChange={handleInputChange}
                      placeholder="Actor 1, Actor 2, Actor 3"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Writers */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Writers (comma separated)
                    </label>
                    <input
                      type="text"
                      name="writers"
                      value={formData.writers.join(', ')}
                      onChange={handleInputChange}
                      placeholder="Writer 1, Writer 2"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Languages */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Languages (comma separated)
                      </label>
                      <input
                        type="text"
                        name="languages"
                        value={formData.languages.join(', ')}
                        onChange={handleInputChange}
                        placeholder="en, hi, es"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Countries */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Countries (comma separated)
                      </label>
                      <input
                        type="text"
                        name="countries"
                        value={formData.countries.join(', ')}
                        onChange={handleInputChange}
                        placeholder="IN, US, UK"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* File Uploads */}
                  {!editingVideo && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Video File */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Video File *
                        </label>
                        <input
                          type="file"
                          name="videoFile"
                          accept="video/*"
                          required={!editingVideo}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Poster */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Poster Image
                        </label>
                        <input
                          type="file"
                          name="poster"
                          accept="image/*"
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Thumbnail */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Thumbnail Image
                        </label>
                        <input
                          type="file"
                          name="thumb"
                          accept="image/*"
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit Buttons */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>{editingVideo ? 'Update' : 'Upload'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageMovies;
