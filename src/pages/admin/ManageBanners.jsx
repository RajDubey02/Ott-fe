
import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Eye,
  EyeOff,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  Edit,
} from 'lucide-react';
import { bannerAPI, handleApiError, handleApiSuccess } from '../../services/api';
import toast from 'react-hot-toast';

const ManageBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBanner, setEditBanner] = useState(null);
  const [editFile, setEditFile] = useState(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState('');
  const [bannerFiles, setBannerFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch banners
  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bannerAPI.getBanner();
      const bannersData = response.data?.banners || [];
      if (!Array.isArray(bannersData)) throw new Error('Invalid banners data');
      const sanitizedBanners = bannersData.map(banner => ({
        ...banner,
        _id: banner._id || '',
        imageUrl: banner.imageUrl || `http://103.180.212.106:9000/ott-vods/${banner.imageKey}`,
        altText: `Banner ${banner._id}`,
        status: banner.status || 'active',
        createdAt: banner.createdAt || new Date().toISOString(),
      }));
      setBanners(sanitizedBanners);
    } catch (error) {
      handleApiError(error, 'Failed to fetch banners');
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Handle upload file selection
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    if (bannerFiles.length + newFiles.length > 10) {
      toast.error('Maximum 10 banners can be uploaded at once');
      return;
    }
    // Append new files to existing bannerFiles
    setBannerFiles(prevFiles => [...prevFiles, ...newFiles]);
    // Append new preview URLs
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prevUrls => [...prevUrls, ...newUrls]);
  };

  // Trigger file input click
  const triggerFileInput = () => {
    const fileInput = document.getElementById('banner-files');
    if (fileInput) fileInput.click();
  };

  // Handle upload submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (bannerFiles.length === 0) {
      toast.error('Please select at least one banner image');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      // Add each banner file with 'banner' key to match edit format
      bannerFiles.forEach(file => {
        formData.append('banners', file);
      });

      await bannerAPI.uploadBanners(formData);
      handleApiSuccess(`${bannerFiles.length} banner(s) uploaded successfully`);

      setShowModal(false);
      resetForm();
      fetchBanners();
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  // Reset upload form
  const resetForm = () => {
    setBannerFiles([]);
    setPreviewUrls([]);
    const fileInput = document.getElementById('banner-files');
    if (fileInput) fileInput.value = '';
  };

  // Delete banner
  const handleDelete = async (bannerId) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await bannerAPI.deleteBanner(bannerId);
      handleApiSuccess('Banner deleted');
      fetchBanners();
    } catch (error) {
      handleApiError(error, 'Delete failed');
    }
  };

  // Edit banner
  const handleEdit = (bannerId) => {
    const banner = banners.find(b => b._id === bannerId);
    setEditBanner(banner);
    setEditPreviewUrl(banner.imageUrl || '');
    setShowEditModal(true);
  };

  // Handle edit submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editBanner || !editFile) {
      toast.error('Please select a new image');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      if (!(editFile instanceof File)) {
        throw new Error('Invalid file object');
      }
      formData.append('banner', editFile, editFile.name);

      const config = {
        onUploadProgress: (progress) => {
          const percent = Math.round((progress.loaded * 100) / progress.total);
          toast.loading(`Updating... ${percent}%`, { id: 'edit-progress' });
        },
        headers: { 'Content-Type': 'multipart/form-data' },
      };

      await bannerAPI.updateBanner(editBanner._id, formData, config);
      toast.dismiss('edit-progress');
      handleApiSuccess('Banner updated');
      setShowEditModal(false);
      setEditBanner(null);
      setEditFile(null);
      if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl);
      setEditPreviewUrl('');
      fetchBanners();
    } catch (error) {
      toast.dismiss('edit-progress');
      handleApiError(error, 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // Toggle banner status
  const toggleBannerStatus = async (bannerId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await bannerAPI.updateBannerStatus(bannerId, newStatus);
      handleApiSuccess(`Banner ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetchBanners();
    } catch (error) {
      handleApiError(error, 'Status update failed');
    }
  };

  // Filter banners
  const filteredBanners = banners.filter(banner =>
    (banner.imageKey?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (loading && !showModal && !showEditModal) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        <span className="text-white ml-3">Loading...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Manage Banners</h1>
            <p className="text-gray-400">Manage your promotional banners</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Banner</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by image key..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Banners Table */}
        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
          {filteredBanners.length === 0 ? (
            <div className="text-center p-8">
              <ImageIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold">No Banners Found</h3>
              <p className="text-gray-400 mt-2">
                {searchTerm ? 'No matching banners.' : 'Upload your first banner to get started.'}
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
              >
                Upload Banner
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700 text-gray-300">
                  <th className="p-3 text-left">Image</th>
                  <th className="p-3 text-left">Size</th>
                  <th className="p-3 text-left">Created At</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBanners.map(banner => (
                  <tr key={banner._id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="p-3">
                      <img
                        src={banner.imageUrl}
                        alt={banner.altText}
                        className="w-20 h-12 object-cover rounded"
                        onError={(e) => (e.target.src = '/api/placeholder/100/60')}
                      />
                    </td>
                    <td className="p-3">{(banner.imageSize / 1024).toFixed(2)} KB</td>
                    <td className="p-3">{new Date(banner.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleBannerStatus(banner._id, banner.status)}
                          className={`p-2 rounded-full ${
                            banner.status === 'active' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                          }`}
                          title={banner.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {banner.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(banner._id)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(banner._id)}
                          className="p-2 bg-red-600 hover:bg-red-700 rounded-full"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Upload Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    Upload Banners (Bulk)
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Banner Images * (Max 10 files)
                    </label>
                    <div className="flex space-x-4">
                      <input
                        id="banner-files"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add More</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Select multiple image files (JPEG, PNG, WebP). Maximum 10 files at once.
                    </p>
                  </div>

                  {/* Preview Section */}
                  {previewUrls.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-300 mb-3">
                        Preview ({bannerFiles.length} files selected)
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {previewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-700"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newFiles = bannerFiles.filter((_, i) => i !== index);
                                const newUrls = previewUrls.filter((_, i) => i !== index);
                                setBannerFiles(newFiles);
                                setPreviewUrls(newUrls);
                                const fileInput = document.getElementById('banner-files');
                                const dt = new DataTransfer();
                                newFiles.forEach(file => dt.items.add(file));
                                fileInput.files = dt.files;
                              }}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
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
                      disabled={loading || bannerFiles.length === 0}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span>
                        {loading
                          ? 'Uploading...'
                          : `Upload ${bannerFiles.length} Banner${bannerFiles.length !== 1 ? 's' : ''}`}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editBanner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Edit Banner</h2>
                <button onClick={() => { setShowEditModal(false); resetEditForm(); }} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Image</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl);
                        setEditFile(file);
                        setEditPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">JPEG, PNG, or WebP only.</p>
                </div>
                {editPreviewUrl && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Preview</h3>
                    <img src={editPreviewUrl} alt="Preview" className="w-full h-20 object-cover rounded" />
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => { setShowEditModal(false); resetEditForm(); }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !editFile}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Reset edit form
  function resetEditForm() {
    setEditBanner(null);
    setEditFile(null);
    if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl);
    setEditPreviewUrl('');
  }
};

export default ManageBanners;