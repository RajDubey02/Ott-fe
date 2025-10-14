import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Eye,
  Reply,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Send,
  X
} from 'lucide-react';
import { queriesAPI, handleApiError, handleApiSuccess } from '../../services/api';
import toast from 'react-hot-toast';

const ManageQueries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const response = await queriesAPI.getQueries();
      setQueries(response?.data?.queries || response?.data || []);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = (query) => {
    setSelectedQuery(query);
    setReplyMessage('');
    setShowReplyModal(true);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    setReplyLoading(true);
    try {
      await queriesAPI.replyToQuery(selectedQuery._id, replyMessage);
      handleApiSuccess('Reply sent successfully');
      setShowReplyModal(false);
      fetchQueries(); // Refresh queries to show new reply
    } catch (error) {
      handleApiError(error);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleStatusUpdate = async (queryId, newStatus) => {
    try {
      await queriesAPI.updateQueryStatus(queryId, newStatus);
      handleApiSuccess(`Query ${newStatus} successfully`);
      fetchQueries(); // Refresh queries to show updated status
    } catch (error) {
      handleApiError(error);
    }
  };

  const filteredQueries = queries.filter(query => {
    const matchesSearch = (query.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (query.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (query.subject?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (query.message?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || query.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-600 text-white';
      case 'in_progress':
        return 'bg-blue-600 text-white';
      case 'closed':
        return 'bg-gray-600 text-white';
      case 'resolved':
        return 'bg-green-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Loading queries...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Manage Queries</h1>
          <p className="text-gray-400">Handle user queries and support requests</p>
        </div>
        <div className="mt-4 sm:mt-0 text-sm text-gray-400">
          Total Queries: {queries.length}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search queries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg text-white px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Queries Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Query Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredQueries.map((query) => (
                <tr key={query._id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-white">{query.name || 'N/A'}</span>
                      </div>
                      <div className="text-sm text-gray-400">{query.email || 'N/A'}</div>
                      <div className="text-sm font-medium text-white">{query.subject || 'N/A'}</div>
                      <div className="text-sm text-gray-400 max-w-md truncate">
                        {query.message || 'N/A'}
                      </div>
                      {query.replies && query.replies.length > 0 && (
                        <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-300">
                          <div className="font-medium text-blue-400 mb-1">
                            Latest Reply ({query.replies.length} total):
                          </div>
                          <div className="truncate">
                            {query.replies[query.replies.length - 1].message}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(query.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(query.status)}`}>
                        {query.status || 'Open'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(query.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleReply(query)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Reply to Query"
                      >
                        <Reply className="w-4 h-4" />
                      </button>

                      <select
                        value={query.status || 'open'}
                        onChange={(e) => handleStatusUpdate(query._id, e.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredQueries.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No queries found</h3>
            <p className="text-gray-400">
              {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search criteria' : 'No queries available'}
            </p>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Reply to Query</h2>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Original Query */}
              <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-white">{selectedQuery.name}</span>
                  <span className="text-gray-400">({selectedQuery.email})</span>
                </div>
                <div className="text-sm font-medium text-white mb-2">{selectedQuery.subject}</div>
                <div className="text-sm text-gray-300">{selectedQuery.message}</div>
                <div className="text-xs text-gray-400 mt-2">
                  {formatDate(selectedQuery.createdAt)}
                </div>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleReplySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your Reply *
                  </label>
                  <textarea
                    rows="4"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply here..."
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowReplyModal(false)}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={replyLoading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
                  >
                    {replyLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>{replyLoading ? 'Sending...' : 'Send Reply'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageQueries;
