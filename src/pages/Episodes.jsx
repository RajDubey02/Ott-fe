// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Play, Calendar, Clock, Star } from 'lucide-react';
// import { videosAPI, handleApiError } from '../services/api';
// import { checkSubscriptionStatus, checkEpisodeAccess, isUserLoggedIn } from '../utils/subscriptionUtils';
// import toast from 'react-hot-toast';
// import SubscriptionModal from '../components/SubscriptionModal';

// const Episodes = () => {
//   const [episodes, setEpisodes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
//   const [selectedEpisode, setSelectedEpisode] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchEpisodes();
//   }, []);

//   const fetchEpisodes = async () => {
//     try {
//       const response = await videosAPI.getAllVideos();
//       const videoData = response.data.videos || response.data || [];

//       // Group videos by episodeName
//       const episodeGroups = {};

//       videoData.forEach(video => {
//         const episodeName = video.episodeName || video.videoTitle || 'Unknown Episode';
//         if (!episodeGroups[episodeName]) {
//           episodeGroups[episodeName] = {
//             episodeName,
//             videos: [],
//             latestRelease: null,
//             totalEpisodes: 0,
//             poster: null,
//             thumb: null
//           };
//         }

//         episodeGroups[episodeName].videos.push(video);
//         episodeGroups[episodeName].totalEpisodes++;

//         // Update latest release date
//         const releaseDate = new Date(video.releaseDate || video.createdAt);
//         if (!episodeGroups[episodeName].latestRelease ||
//             releaseDate > new Date(episodeGroups[episodeName].latestRelease)) {
//           episodeGroups[episodeName].latestRelease = video.releaseDate || video.createdAt;
//         }

//         // Set poster and thumb from first video or best available
//         if (!episodeGroups[episodeName].poster && (video.poster || video.posterUrl)) {
//           episodeGroups[episodeName].poster = video.poster || video.posterUrl;
//         }
//         if (!episodeGroups[episodeName].thumb && (video.thumb || video.thumbUrl)) {
//           episodeGroups[episodeName].thumb = video.thumb || video.thumbUrl;
//         }
//       });

//       // Convert to array and sort by latest release
//       const episodesArray = Object.values(episodeGroups).sort((a, b) =>
//         new Date(b.latestRelease) - new Date(a.latestRelease)
//       );

//       setEpisodes(episodesArray);
//     } catch (error) {
//       handleApiError(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEpisodeClick = async (episode) => {
//     if (!isUserLoggedIn()) {
//       toast.error('Please login to watch episodes');
//       navigate('/login');
//       return;
//     }

//     const hasSubscription = await checkSubscriptionStatus();

//     if (!hasSubscription) {
//       setSelectedEpisode(episode);
//       setShowSubscriptionModal(true);
//       return;
//     }

//     navigate(`/watch/${episode.episodeName}`);
//   };

//   const handleSubscriptionSuccess = () => {
//     setShowSubscriptionModal(false);
//     if (selectedEpisode) {
//       navigate(`/watch/${selectedEpisode.episodeName}`);
//     }
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).getFullYear();
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-black flex items-center justify-center">
//         <div className="text-white text-xl">Loading episodes...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-black">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-white mb-2">All Episodes</h1>
//           <p className="text-gray-400">Browse all available episodes and series</p>
//         </div>

//         {episodes.length === 0 ? (
//           <div className="text-center text-white py-12">
//             <p className="text-xl mb-4">No episodes available</p>
//             <p className="text-gray-400">Check back later for new content</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {episodes.map((episode) => (
//               <div
//                 key={episode.episodeName}
//                 onClick={() => handleEpisodeClick(episode)}
//                 className="group cursor-pointer"
//               >
//                 <div className="relative overflow-hidden rounded-lg bg-gray-800 transition-transform duration-300 group-hover:scale-105">
//                   {/* Episode Poster */}
//                   <div className="aspect-[3/4] relative">
//                     <img
//                       src={episode.poster || episode.thumb || '/api/placeholder/300/400'}
//                       alt={episode.episodeName}
//                       className="w-full h-full object-cover"
//                       onError={(e) => {
//                         e.target.src = '/api/placeholder/300/400';
//                       }}
//                     />

//                     {/* Overlay */}
//                     <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

//                     {/* Play Button */}
//                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                       <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
//                         <Play className="w-8 h-8 text-white ml-1" />
//                       </div>
//                     </div>

//                     {/* Episode Count Badge */}
//                     <div className="absolute top-3 right-3 bg-blue-600 text-white text-sm px-2 py-1 rounded">
//                       {episode.totalEpisodes} parts
//                     </div>
//                   </div>

//                   {/* Episode Info */}
//                   <div className="p-4">
//                     <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
//                       {episode.episodeName}
//                     </h3>

//                     <div className="space-y-2 text-sm text-gray-400">
//                       {episode.latestRelease && (
//                         <div className="flex items-center space-x-2">
//                           <Calendar className="w-4 h-4" />
//                           <span>{formatDate(episode.latestRelease)}</span>
//                         </div>
//                       )}

//                       <div className="flex items-center justify-between">
//                         <span>{episode.totalEpisodes} Episodes</span>
//                         {episode.videos[0]?.imdbRating && (
//                           <div className="flex items-center space-x-1">
//                             <Star className="w-4 h-4 text-yellow-500 fill-current" />
//                             <span>{parseFloat(episode.videos[0].imdbRating).toFixed(1)}</span>
//                           </div>
//                         )}
//                       </div>

//                       {episode.videos[0]?.genre && (
//                         <p className="text-xs text-gray-500">{episode.videos[0].genre}</p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Subscription Modal */}
//       <SubscriptionModal
//         isOpen={showSubscriptionModal}
//         onClose={() => setShowSubscriptionModal(false)}
//         onSubscriptionSuccess={handleSubscriptionSuccess}
//       />
//     </div>
//   );
// };

// export default Episodes;







import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Calendar, Clock, Star } from 'lucide-react';
import { videosAPI, handleApiError } from '../services/api';
import { checkSubscriptionStatus, checkEpisodeAccess, isUserLoggedIn } from '../utils/subscriptionUtils';
import toast from 'react-hot-toast';
import SubscriptionModal from '../components/SubscriptionModal';

const Episodes = () => {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState(null); // Store video ID instead of episode
  const navigate = useNavigate();

  useEffect(() => {
    fetchEpisodes();
  }, []);

  const fetchEpisodes = async () => {
    try {
      const response = await videosAPI.getAllVideos();
      const videoData = response.data.videos || response.data || [];

      // Group videos by episodeName
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

        // Update latest release date
        const releaseDate = new Date(video.releaseDate || video.createdAt);
        if (!episodeGroups[episodeName].latestRelease ||
            releaseDate > new Date(episodeGroups[episodeName].latestRelease)) {
          episodeGroups[episodeName].latestRelease = video.releaseDate || video.createdAt;
        }

        // Set poster and thumb from first video or best available
        if (!episodeGroups[episodeName].poster && (video.poster || video.posterUrl)) {
          episodeGroups[episodeName].poster = video.poster || video.posterUrl;
        }
        if (!episodeGroups[episodeName].thumb && (video.thumb || video.thumbUrl)) {
          episodeGroups[episodeName].thumb = video.thumb || video.thumbUrl;
        }
      });

      // Convert to array and sort by latest release
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

  const handleEpisodeClick = async (episode) => {
    if (!isUserLoggedIn()) {
      toast.error('Please login to watch episodes');
      navigate('/login');
      return;
    }

    // Check if user has access to this specific episode
    const firstVideoId = episode.videos[0]?._id;
    const hasAccess = await checkEpisodeAccess(firstVideoId, episode.episodeName);

    if (!hasAccess) {
      // Select the first video in the episode group for subscription modal
      if (firstVideoId) {
        setSelectedVideoId(firstVideoId);
        setShowSubscriptionModal(true);
      } else {
        toast.error('No videos available for this episode');
      }
      return;
    }

    // Navigate using episode name (as requested by user)
    navigate(`/watch/${episode.episodeName}`);
  };

  const handleSubscriptionSuccess = () => {
    setShowSubscriptionModal(false);
    if (selectedVideoId) {
      navigate(`/watch/${selectedVideoId}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).getFullYear();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading episodes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">All Episodes</h1>
          <p className="text-gray-400">Browse all available episodes and series</p>
        </div>

        {episodes.length === 0 ? (
          <div className="text-center text-white py-12">
            <p className="text-xl mb-4">No episodes available</p>
            <p className="text-gray-400">Check back later for new content</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {episodes.map((episode) => (
              <div
                key={episode.episodeName}
                onClick={() => handleEpisodeClick(episode)}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-lg bg-gray-800 transition-transform duration-300 group-hover:scale-105">
                  {/* Episode Poster */}
                  <div className="aspect-[3/4] relative">
                    <img
                      src={episode.poster || episode.thumb || '/api/placeholder/300/400'}
                      alt={episode.episodeName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/300/400';
                      }}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>

                    {/* Episode Count Badge */}
                    <div className="absolute top-3 right-3 bg-blue-600 text-white text-sm px-2 py-1 rounded">
                      {episode.totalEpisodes} parts
                    </div>
                  </div>

                  {/* Episode Info */}
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {episode.episodeName}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-400">
                      {episode.latestRelease && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(episode.latestRelease)}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span>{episode.totalEpisodes} Episodes</span>
                        {episode.videos[0]?.imdbRating && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
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
        )}
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

export default Episodes;