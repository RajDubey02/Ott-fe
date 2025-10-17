
// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import { ArrowLeft, Play, Clock, Star, Info } from 'lucide-react';
// import SubscriptionModal from '../components/SubscriptionModal';
// import { videosAPI, handleApiError } from '../services/api';
// import { checkEpisodeAccess, isUserLoggedIn } from '../utils/subscriptionUtils';
// import { useAuth } from '../contexts/AuthContext';

// const Watch = () => {
//   const { name } = useParams();
//   const navigate = useNavigate();
//   const { user, isAuthenticated } = useAuth();

//   const [episodeData, setEpisodeData] = useState(null);
//   const [selectedVideo, setSelectedVideo] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isEpisodeMode, setIsEpisodeMode] = useState(false);
//   const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
//   const [seriesData, setSeriesData] = useState(null);

//   useEffect(() => {
//     if (name) {
//       fetchData();
//     }
//   }, [name]);

//   const fetchData = async () => {
//     try {
//       console.log('🔍 Starting fetchData for:', name);
//       console.log('🔍 isVideoId check:', /^[a-fA-F0-9]{24}$/.test(name));

//       const isVideoId = /^[a-fA-F0-9]{24}$/.test(name);
//       console.log('🔍 isVideoId result:', isVideoId);

//       if (isVideoId) {
//         console.log('🔍 Taking video ID path for:', name);
//         await fetchVideoData(name);
//         setIsEpisodeMode(false);
//       } else {
//         console.log('🔍 Taking episode name path for:', name);
//         await fetchEpisodeData(name);
//         setIsEpisodeMode(true);
//       }

//       // Also fetch series data for trailer information
//       await fetchSeriesData();

//       console.log('✅ fetchData completed successfully');
//       console.log('📊 Episode data state:', episodeData);
//       console.log('📊 Selected video state:', selectedVideo);
//       console.log('📊 isEpisodeMode:', isEpisodeMode);

//     } catch (error) {
//       console.log('❌ Initial fetch error:', error);
//       console.log('❌ Error response:', error.response);

//       if (!isVideoId) {
//         console.log('🔄 Trying video ID approach for:', name);
//         await fetchVideoData(name);
//         setIsEpisodeMode(false);
//       } else {
//         console.log('🔄 Trying episode name approach for:', name);
//         await fetchEpisodeData(name);
//         setIsEpisodeMode(true);
//       }

//       // Try to fetch series data even if main fetch fails
//       await fetchSeriesData();
//     } finally {
//       console.log('🏁 Setting loading to false');
//       console.log('📊 Final states - episodeData:', !!episodeData, 'selectedVideo:', !!selectedVideo);
//       setLoading(false);
//     }
//   };

//   const fetchSeriesData = async () => {
//     try {
//       console.log('📡 Fetching series data from /videos/all');
//       const response = await videosAPI.getVideosAll();
//       const seriesList = response.data;

//       // Find the series that matches our current episode
//       if (seriesList && Array.isArray(seriesList)) {
//         const currentSeries = seriesList.find(series =>
//           series.episodeName === episodeData?.episodeName ||
//           series.episodeName === selectedVideo?.episodeName ||
//           series.episodeName === name
//         );

//         if (currentSeries) {
//           console.log('✅ Series data found:', currentSeries);
//           setSeriesData(currentSeries);
//         } else {
//           console.log('⚠️ No matching series found');
//         }
//       }
//     } catch (error) {
//       console.log('❌ Error fetching series data:', error);
//     }
//   };

//   const fetchEpisodeData = async (episodeName) => {
//     try {
//       console.log('🚀 Starting fetchEpisodeData for:', episodeName);

//       try {
//         console.log('📡 Calling getVideoByEpisodeName API for:', episodeName);
//         const response = await videosAPI.getVideoByEpisodeName(episodeName);
//         const episodeData = response.data;

//         console.log('✅ Episode data received:', episodeData);
//         console.log('📊 Episode data structure:', {
//           episodeName: episodeData.episodeName,
//           count: episodeData.count,
//           parts: episodeData.parts?.length || 0
//         });

//         setEpisodeData(episodeData);

//         if (episodeData?.parts && episodeData.parts.length > 0) {
//           console.log('🎬 Setting first video as selected:', episodeData.parts[0]);
//           setSelectedVideo(episodeData.parts[0]);
//         } else {
//           console.warn('⚠️ No parts found in episode data');
//         }

//       } catch (episodeError) {
//         console.log('❌ Episode API failed, trying video ID API');
//         console.log('❌ Episode error:', episodeError.response?.data);

//         const videoResponse = await videosAPI.getVideoById(episodeName);
//         const videoData = videoResponse.data.video || videoResponse.data;

//         console.log('✅ Video data received:', videoData);
//         const mockEpisodeData = {
//           episodeName: videoData.episodeName || videoData.videoTitle || videoData.title,
//           count: 1,
//           parts: [videoData]
//         };

//         setEpisodeData(mockEpisodeData);
//         setSelectedVideo(videoData);
//       }

//     } catch (error) {
//       console.log('🔥 API Error in fetchEpisodeData:', error);
//       console.log('🔥 Error response:', error.response?.data);

//       if (error.response?.data?.message?.includes('Subscription required')) {
//         console.log('🎫 Subscription required for episode:', episodeName);
//         setShowSubscriptionModal(true);
//         return;
//       }

//       if (error.response?.data?.message?.includes('Cast to ObjectId failed')) {
//         console.log('🔄 This is an episode name, not video ID. Trying episode API...');
//         try {
//           const response = await videosAPI.getVideoByEpisodeName(episodeName);
//           const episodeData = response.data;

//           console.log('✅ Episode data received:', episodeData);
//           setEpisodeData(episodeData);

//           if (episodeData?.parts && episodeData.parts.length > 0) {
//             setSelectedVideo(episodeData.parts[0]);
//           }
//         } catch (episodeAPIError) {
//           console.log('❌ Episode API also failed:', episodeAPIError.response?.data);
//           if (episodeAPIError.response?.data?.message?.includes('Subscription required')) {
//             console.log('🎫 Subscription required for episode:', episodeName);
//             setShowSubscriptionModal(true);
//             return;
//           }
//           handleApiError(episodeAPIError);
//           navigate('/');
//         }
//         return;
//       }

//       handleApiError(error);
//       navigate('/');
//     }
//   };

//   const fetchVideoData = async (videoId) => {
//     try {
//       console.log('📡 Calling getVideoById API for:', videoId);
//       const response = await videosAPI.getVideoById(videoId);
//       const videoData = response.data.video || response.data;

//       console.log('✅ Video data received:', videoData);

//       const mockEpisodeData = {
//         episodeName: videoData.episodeName || videoData.videoTitle || videoData.title,
//         count: 1,
//         parts: [videoData]
//       };

//       setEpisodeData(mockEpisodeData);
//       setSelectedVideo(videoData);

//     } catch (error) {
//       console.log('❌ Video API Error:', error);
//       console.log('❌ Video error response:', error.response?.data);

//       if (error.response?.data?.message?.includes('Subscription required')) {
//         console.log('🎫 Subscription required for video:', videoId);
//         setShowSubscriptionModal(true);
//         return;
//       }

//       handleApiError(error);
//       navigate('/');
//     }
//   };

//   const handleVideoSelect = (video) => {
//     console.log('🎬 Video selected:', video);
//     setSelectedVideo(video);
//   };

//   const handlePlayVideo = async () => {
//     if (!selectedVideo) {
//       console.warn('⚠️ No video selected');
//       return;
//     }

//     if (!isUserLoggedIn()) {
//       console.log('🔒 User not logged in, redirecting to login');
//       toast.error('Please login to watch videos');
//       navigate('/login');
//       return;
//     }

//     try {
//       const hasAccess = await checkEpisodeAccess(selectedVideo.id || selectedVideo._id);
//       if (!hasAccess) {
//         console.log('🎫 Subscription required for video:', selectedVideo.id || selectedVideo._id);
//         setShowSubscriptionModal(true);
//         return;
//       }

//       console.log('▶️ Playing video:', selectedVideo);
//       navigate(`/play/${selectedVideo.id || selectedVideo._id}`);
//     } catch (error) {
//       console.log('❌ Error checking episode access:', error);
//       handleApiError(error);
//     }
//   };

//   const handleSubscriptionSuccess = () => {
//     console.log('🎉 Subscription successful');
//     setShowSubscriptionModal(false);
//     fetchData();
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black flex items-center justify-center">
//         <div className="flex flex-col items-center space-y-4">
//           <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//           <div className="text-gray-400 text-lg">Loading content...</div>
//         </div>
//       </div>
//     );
//   }

//   if (!episodeData) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black flex items-center justify-center">
//         <div className="text-center text-white max-w-md px-4">
//           <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
//             <Info className="w-10 h-10 text-gray-500" />
//           </div>
//           <h2 className="text-3xl font-bold mb-3">Content Not Found</h2>
//           <p className="text-gray-400 mb-8">The content you're looking for doesn't exist or has been removed.</p>
//           <button
//             onClick={() => navigate('/')}
//             className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg transition-colors font-medium"
//           >
//             Back to Home
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black">
//       {/* Header with Back Button */}
//       <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <button
//             onClick={() => navigate(-1)}
//             className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors group"
//           >
//             <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
//               <ArrowLeft className="w-5 h-5" />
//             </div>
//             <span className="font-medium">Back</span>
//           </button>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="pt-20 pb-12">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

//           {/* Trailer Section */}
//           {seriesData && seriesData.seriesTrailerUrl && (
//             <div className="mb-8">
//               <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
//                 <div className="relative">
//                   <video
//                     src={seriesData.seriesTrailerUrl}
//                     poster={seriesData.seriesPosterUrl || seriesData.seriesThumbUrl}
//                     controls
//                     className="w-full aspect-video object-cover"
//                     preload="metadata"
//                   >
//                     Your browser does not support the video tag.
//                   </video>

//                   {/* Trailer Overlay */}
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

//                   {/* Trailer Title */}
//                   <div className="absolute bottom-6 left-6 right-6">
//                     <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
//                       {seriesData.episodeName} - Trailer
//                     </h2>
//                     <p className="text-gray-200 text-sm opacity-90">
//                       Watch the official trailer
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Hero Section with Selected Video */}
//           {selectedVideo && (
//             <div className="mb-12">
//               <div className="relative rounded-2xl overflow-hidden bg-gray-900 shadow-2xl">
//                 <div className="aspect-video relative">
//                   <img
//                     src={selectedVideo.thumbUrl || selectedVideo.posterUrl || selectedVideo.poster || '/api/placeholder/1200/675'}
//                     alt={selectedVideo.title || episodeData.episodeName}
//                     className="w-full h-full object-cover"
//                     onError={(e) => {
//                       e.target.src = '/api/placeholder/1200/675';
//                     }}
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                  
//                   {/* Content Overlay */}
//                   <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
//                     <div className="max-w-3xl">
//                       <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
//                         {selectedVideo.title || episodeData.episodeName}
//                       </h1>
                      
//                       {/* Metadata */}
//                       <div className="flex flex-wrap items-center gap-3 mb-6">
//                         {selectedVideo.imdbRating && (
//                           <div className="flex items-center space-x-1 bg-yellow-500/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-yellow-500/30">
//                             <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
//                             <span className="text-white font-semibold">{selectedVideo.imdbRating}</span>
//                           </div>
//                         )}
//                         {selectedVideo.runtimeMinutes && (
//                           <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
//                             <Clock className="w-4 h-4 text-white" />
//                             <span className="text-white font-medium">
//                               {Math.floor(selectedVideo.runtimeMinutes / 60)}h {selectedVideo.runtimeMinutes % 60}m
//                             </span>
//                           </div>
//                         )}
//                         {selectedVideo.quality && (
//                           <div className="bg-blue-500/20 backdrop-blur-md text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/30 font-semibold text-sm">
//                             {selectedVideo.quality}
//                           </div>
//                         )}
//                         {selectedVideo.genre && (
//                           <div className="bg-white/10 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-white/20 font-medium text-sm">
//                             {selectedVideo.genre}
//                           </div>
//                         )}
//                         {isEpisodeMode && (
//                           <div className="bg-white/10 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-white/20 font-medium text-sm">
//                             Part {selectedVideo.episodeSeq}
//                           </div>
//                         )}
//                       </div>

//                       {/* Description */}
//                       {selectedVideo.description && (
//                         <p className="text-gray-200 text-lg mb-6 line-clamp-3 drop-shadow-md">
//                           {selectedVideo.description}
//                         </p>
//                       )}

//                       {/* Play Button */}
//                       <button
//                         onClick={handlePlayVideo}
//                         className="group bg-white hover:bg-blue-500 text-black hover:text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center space-x-3 shadow-2xl hover:shadow-blue-500/50 hover:scale-105"
//                       >
//                         <Play className="w-6 h-6 fill-current" />
//                         <span>Play Now</span>
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Episodes Grid */}
//           {isEpisodeMode && episodeData.parts && episodeData.parts.length > 1 && (
//             <div className="mb-12">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-2xl md:text-3xl font-bold text-white">
//                   Episodes
//                 </h2>
//                 <span className="text-gray-400 text-sm">
//                   {episodeData.count} {episodeData.count === 1 ? 'episode' : 'episodes'}
//                 </span>
//               </div>

//               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
//                 {episodeData.parts.map((part, index) => (
//                   <div
//                     key={part.id || part._id}
//                     onClick={() => handleVideoSelect(part)}
//                     className={`group cursor-pointer rounded-xl overflow-hidden bg-gray-900 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
//                       selectedVideo?.id === part.id || selectedVideo?._id === part._id
//                         ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/50'
//                         : ''
//                     }`}
//                   >
//                     <div className="aspect-video relative overflow-hidden bg-gray-800">
//                       <img
//                         src={part.thumbUrl || part.posterUrl || '/api/placeholder/400/225'}
//                         alt={part.title || `Episode ${part.episodeSeq || index + 1}`}
//                         className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
//                         loading="lazy"
//                         onError={(e) => {
//                           e.target.src = '/api/placeholder/400/225';
//                         }}
//                       />
                      
//                       {/* Overlay */}
//                       <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                         <div className="absolute inset-0 flex items-center justify-center">
//                           <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50">
//                             <Play className="w-6 h-6 text-white fill-white ml-1" />
//                           </div>
//                         </div>
//                       </div>

//                       {/* Episode Number */}
//                       <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded">
//                         EP {part.episodeSeq || index + 1}
//                       </div>

//                       {/* Duration */}
//                       {part.runtimeMinutes && (
//                         <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
//                           {Math.floor(part.runtimeMinutes / 60)}:{String(part.runtimeMinutes % 60).padStart(2, '0')}
//                         </div>
//                       )}

//                       {/* Selected Badge */}
//                       {(selectedVideo?.id === part.id || selectedVideo?._id === part._id) && (
//                         <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
//                           NOW PLAYING
//                         </div>
//                       )}
//                     </div>

//                     <div className="p-3">
//                       <h4 className="text-white font-semibold text-sm line-clamp-2 mb-1 group-hover:text-blue-400 transition-colors">
//                         {part.title || `Episode ${part.episodeSeq || index + 1}`}
//                       </h4>
                      
//                       {part.imdbRating && (
//                         <div className="flex items-center space-x-1 text-xs text-gray-400">
//                           <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
//                           <span>{part.imdbRating}</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Info Section */}
//           <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-800">
//             <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
//               <Info className="w-5 h-5 text-blue-500" />
//               <span>About This {isEpisodeMode ? 'Series' : 'Video'}</span>
//             </h3>
            
//             <div className="grid md:grid-cols-2 gap-6">
//               <div className="space-y-3">
//                 <div className="flex justify-between items-center py-2 border-b border-gray-800">
//                   <span className="text-gray-400">Title</span>
//                   <span className="text-white font-medium">{episodeData.episodeName}</span>
//                 </div>
//                 <div className="flex justify-between items-center py-2 border-b border-gray-800">
//                   <span className="text-gray-400">Type</span>
//                   <span className="text-white font-medium">{isEpisodeMode ? 'Series' : 'Movie'}</span>
//                 </div>
//                 {isEpisodeMode && (
//                   <div className="flex justify-between items-center py-2 border-b border-gray-800">
//                     <span className="text-gray-400">Total Episodes</span>
//                     <span className="text-white font-medium">{episodeData.count}</span>
//                   </div>
//                 )}
//               </div>
              
//               {selectedVideo && (
//                 <div className="space-y-3">
//                   {selectedVideo.genre && (
//                     <div className="flex justify-between items-center py-2 border-b border-gray-800">
//                       <span className="text-gray-400">Genre</span>
//                       <span className="text-white font-medium">{selectedVideo.genre}</span>
//                     </div>
//                   )}
//                   {selectedVideo.releaseDate && (
//                     <div className="flex justify-between items-center py-2 border-b border-gray-800">
//                       <span className="text-gray-400">Release Year</span>
//                       <span className="text-white font-medium">
//                         {new Date(selectedVideo.releaseDate).getFullYear()}
//                       </span>
//                     </div>
//                   )}
//                   {selectedVideo.quality && (
//                     <div className="flex justify-between items-center py-2 border-b border-gray-800">
//                       <span className="text-gray-400">Quality</span>
//                       <span className="text-white font-medium">{selectedVideo.quality}</span>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
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

// export default Watch;
















import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Play, Clock, Star, Info } from 'lucide-react';
import SubscriptionModal from '../components/SubscriptionModal';
import { videosAPI, handleApiError } from '../services/api';
import { checkEpisodeAccess, isUserLoggedIn } from '../utils/subscriptionUtils';
import { useAuth } from '../contexts/AuthContext';

const Watch = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [episodeData, setEpisodeData] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEpisodeMode, setIsEpisodeMode] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [seriesData, setSeriesData] = useState(null);

  useEffect(() => {
    if (name) {
      fetchData();
    }
  }, [name]);

  const fetchData = async () => {
    try {
      console.log('🔍 Starting fetchData for:', name);
      console.log('🔍 isVideoId check:', /^[a-fA-F0-9]{24}$/.test(name));

      const isVideoId = /^[a-fA-F0-9]{24}$/.test(name);
      console.log('🔍 isVideoId result:', isVideoId);

      if (isVideoId) {
        console.log('🔍 Taking video ID path for:', name);
        await fetchVideoData(name);
        setIsEpisodeMode(false);
      } else {
        console.log('🔍 Taking episode name path for:', name);
        await fetchEpisodeData(name);
        setIsEpisodeMode(true);
      }

      // Fetch series data for trailer information
      await fetchSeriesData();

      console.log('✅ fetchData completed successfully');
      console.log('📊 Episode data state:', episodeData);
      console.log('📊 Selected video state:', selectedVideo);
      console.log('📊 isEpisodeMode:', isEpisodeMode);

    } catch (error) {
      console.log('❌ Initial fetch error:', error);
      console.log('❌ Error response:', error.response);

      if (!isVideoId) {
        console.log('🔄 Trying video ID approach for:', name);
        await fetchVideoData(name);
        setIsEpisodeMode(false);
      } else {
        console.log('🔄 Trying episode name approach for:', name);
        await fetchEpisodeData(name);
        setIsEpisodeMode(true);
      }

      // Try to fetch series data even if main fetch fails
      await fetchSeriesData();
    } finally {
      console.log('🏁 Setting loading to false');
      console.log('📊 Final states - episodeData:', !!episodeData, 'selectedVideo:', !!selectedVideo);
      setLoading(false);
    }
  };

  const fetchSeriesData = async () => {
    try {
      console.log('📡 Fetching series data from /videos/all');
      const response = await videosAPI.getVideosAll();
      const seriesList = response.data;

      // Find the series that matches our current episode or video
      if (seriesList && Array.isArray(seriesList)) {
        const currentSeries = seriesList.find(series => {
          const matchEpisodeName = series.episodeName === episodeData?.episodeName ||
                                   series.episodeName === selectedVideo?.episodeName ||
                                   series.episodeName === selectedVideo?.videoTitle ||
                                   series.episodeName === selectedVideo?.title ||
                                   series.episodeName === name;
          const matchVideoId = series._id === selectedVideo?._id || series.id === selectedVideo?.id;
          return matchEpisodeName || matchVideoId;
        });

        if (currentSeries) {
          console.log('✅ Series data found:', currentSeries);
          // Use the series trailer URL or fall back to the selected video's trailer if available
          setSeriesData({
            ...currentSeries,
            seriesTrailerUrl: currentSeries.seriesTrailerUrl || selectedVideo?.trailer || currentSeries.trailer,
            seriesPosterUrl: currentSeries.seriesPosterUrl || selectedVideo?.posterUrl || selectedVideo?.poster,
            seriesThumbUrl: currentSeries.seriesThumbUrl || selectedVideo?.thumbUrl || selectedVideo?.thumb
          });
        } else {
          // For video ID route, use selectedVideo data if no series match is found
          if (selectedVideo && !isEpisodeMode) {
            console.log('✅ Using selectedVideo for seriesData:', selectedVideo);
            setSeriesData({
              episodeName: selectedVideo.episodeName || selectedVideo.videoTitle || selectedVideo.title,
              seriesTrailerUrl: selectedVideo.trailer || selectedVideo.seriesTrailerUrl,
              seriesPosterUrl: selectedVideo.posterUrl || selectedVideo.poster,
              seriesThumbUrl: selectedVideo.thumbUrl || selectedVideo.thumb
            });
          } else {
            console.log('⚠️ No matching series found');
          }
        }
      }
    } catch (error) {
      console.log('❌ Error fetching series data:', error);
      // Fallback to selectedVideo's trailer data if available
      if (selectedVideo && !isEpisodeMode) {
        console.log('✅ Fallback to selectedVideo for seriesData:', selectedVideo);
        setSeriesData({
          episodeName: selectedVideo.episodeName || selectedVideo.videoTitle || selectedVideo.title,
          seriesTrailerUrl: selectedVideo.trailer || selectedVideo.seriesTrailerUrl,
          seriesPosterUrl: selectedVideo.posterUrl || selectedVideo.poster,
          seriesThumbUrl: selectedVideo.thumbUrl || selectedVideo.thumb
        });
      }
    }
  };

  const fetchEpisodeData = async (episodeName) => {
    try {
      console.log('🚀 Starting fetchEpisodeData for:', episodeName);

      try {
        console.log('📡 Calling getVideoByEpisodeName API for:', episodeName);
        const response = await videosAPI.getVideoByEpisodeName(episodeName);
        const episodeData = response.data;

        console.log('✅ Episode data received:', episodeData);
        console.log('📊 Episode data structure:', {
          episodeName: episodeData.episodeName,
          count: episodeData.count,
          parts: episodeData.parts?.length || 0
        });

        setEpisodeData(episodeData);

        if (episodeData?.parts && episodeData.parts.length > 0) {
          console.log('🎬 Setting first video as selected:', episodeData.parts[0]);
          setSelectedVideo(episodeData.parts[0]);
        } else {
          console.warn('⚠️ No parts found in episode data');
        }

      } catch (episodeError) {
        console.log('❌ Episode API failed, trying video ID API');
        console.log('❌ Episode error:', episodeError.response?.data);

        const videoResponse = await videosAPI.getVideoById(episodeName);
        const videoData = videoResponse.data.video || videoResponse.data;

        console.log('✅ Video data received:', videoData);
        const mockEpisodeData = {
          episodeName: videoData.episodeName || videoData.videoTitle || videoData.title,
          count: 1,
          parts: [videoData]
        };

        setEpisodeData(mockEpisodeData);
        setSelectedVideo(videoData);
      }

    } catch (error) {
      console.log('🔥 API Error in fetchEpisodeData:', error);
      console.log('🔥 Error response:', error.response?.data);

      if (error.response?.data?.message?.includes('Subscription required')) {
        console.log('🎫 Subscription required for episode:', episodeName);
        setShowSubscriptionModal(true);
        return;
      }

      if (error.response?.data?.message?.includes('Cast to ObjectId failed')) {
        console.log('🔄 This is an episode name, not video ID. Trying episode API...');
        try {
          const response = await videosAPI.getVideoByEpisodeName(episodeName);
          const episodeData = response.data;

          console.log('✅ Episode data received:', episodeData);
          setEpisodeData(episodeData);

          if (episodeData?.parts && episodeData.parts.length > 0) {
            setSelectedVideo(episodeData.parts[0]);
          }
        } catch (episodeAPIError) {
          console.log('❌ Episode API also failed:', episodeAPIError.response?.data);
          if (episodeAPIError.response?.data?.message?.includes('Subscription required')) {
            console.log('🎫 Subscription required for episode:', episodeName);
            setShowSubscriptionModal(true);
            return;
          }
          handleApiError(episodeAPIError);
          navigate('/');
        }
        return;
      }

      handleApiError(error);
      navigate('/');
    }
  };

  const fetchVideoData = async (videoId) => {
    try {
      console.log('📡 Calling getVideoById API for:', videoId);
      const response = await videosAPI.getVideoById(videoId);
      const videoData = response.data.video || response.data;

      console.log('✅ Video data received:', videoData);

      const mockEpisodeData = {
        episodeName: videoData.episodeName || videoData.videoTitle || videoData.title,
        count: 1,
        parts: [videoData]
      };

      setEpisodeData(mockEpisodeData);
      setSelectedVideo(videoData);

    } catch (error) {
      console.log('❌ Video API Error:', error);
      console.log('❌ Video error response:', error.response?.data);

      if (error.response?.data?.message?.includes('Subscription required')) {
        console.log('🎫 Subscription required for video:', videoId);
        setShowSubscriptionModal(true);
        return;
      }

      handleApiError(error);
      navigate('/');
    }
  };

  const handleVideoSelect = (video) => {
    console.log('🎬 Video selected:', video);
    setSelectedVideo(video);
  };

  const handlePlayVideo = async () => {
    if (!selectedVideo) {
      console.warn('⚠️ No video selected');
      return;
    }

    if (!isUserLoggedIn()) {
      console.log('🔒 User not logged in, redirecting to login');
      toast.error('Please login to watch videos');
      navigate('/login');
      return;
    }

    try {
      const hasAccess = await checkEpisodeAccess(selectedVideo.id || selectedVideo._id);
      if (!hasAccess) {
        console.log('🎫 Subscription required for video:', selectedVideo.id || selectedVideo._id);
        setShowSubscriptionModal(true);
        return;
      }

      console.log('▶️ Playing video:', selectedVideo);
      navigate(`/play/${selectedVideo.id || selectedVideo._id}`);
    } catch (error) {
      console.log('❌ Error checking episode access:', error);
      handleApiError(error);
    }
  };

  const handleSubscriptionSuccess = () => {
    console.log('🎉 Subscription successful');
    setShowSubscriptionModal(false);
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-400 text-lg">Loading content...</div>
        </div>
      </div>
    );
  }

  if (!episodeData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black flex items-center justify-center">
        <div className="text-center text-white max-w-md px-4">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info className="w-10 h-10 text-gray-500" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Content Not Found</h2>
          <p className="text-gray-400 mb-8">The content you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg transition-colors font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black">
      {/* Header with Back Button */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors group"
          >
            <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Trailer Section */}
          {seriesData && seriesData.seriesTrailerUrl && (
            <div className="mb-8">
              <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                <div className="relative">
                  <video
                    src={seriesData.seriesTrailerUrl}
                    poster={seriesData.seriesPosterUrl || seriesData.seriesThumbUrl}
                    controls
                    className="w-full aspect-video object-cover"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>

                  {/* Trailer Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

                  {/* Trailer Title */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
                      {seriesData.episodeName || episodeData.episodeName} - Trailer
                    </h2>
                    <p className="text-gray-200 text-sm opacity-90">
                      Watch the official trailer
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hero Section with Selected Video */}
          {selectedVideo && (
            <div className="mb-12">
              <div className="relative rounded-2xl overflow-hidden bg-gray-900 shadow-2xl">
                <div className="aspect-video relative">
                  <img
                    src={selectedVideo.thumbUrl || selectedVideo.posterUrl || selectedVideo.poster || '/api/placeholder/1200/675'}
                    alt={selectedVideo.title || episodeData.episodeName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/1200/675';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                  
                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <div className="max-w-3xl">
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                        {selectedVideo.title || episodeData.episodeName}
                      </h1>
                      
                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-3 mb-6">
                        {selectedVideo.imdbRating && (
                          <div className="flex items-center space-x-1 bg-yellow-500/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-yellow-500/30">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-white font-semibold">{selectedVideo.imdbRating}</span>
                          </div>
                        )}
                        {selectedVideo.runtimeMinutes && (
                          <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                            <Clock className="w-4 h-4 text-white" />
                            <span className="text-white font-medium">
                              {Math.floor(selectedVideo.runtimeMinutes / 60)}h {selectedVideo.runtimeMinutes % 60}m
                            </span>
                          </div>
                        )}
                        {selectedVideo.quality && (
                          <div className="bg-blue-500/20 backdrop-blur-md text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/30 font-semibold text-sm">
                            {selectedVideo.quality}
                          </div>
                        )}
                        {selectedVideo.genre && (
                          <div className="bg-white/10 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-white/20 font-medium text-sm">
                            {selectedVideo.genre}
                          </div>
                        )}
                        {isEpisodeMode && (
                          <div className="bg-white/10 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-white/20 font-medium text-sm">
                            Part {selectedVideo.episodeSeq}
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {selectedVideo.description && (
                        <p className="text-gray-200 text-lg mb-6 line-clamp-3 drop-shadow-md">
                          {selectedVideo.description}
                        </p>
                      )}

                      {/* Play Button */}
                      <button
                        onClick={handlePlayVideo}
                        className="group bg-white hover:bg-blue-500 text-black hover:text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center space-x-3 shadow-2xl hover:shadow-blue-500/50 hover:scale-105"
                      >
                        <Play className="w-6 h-6 fill-current" />
                        <span>Play Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Episodes Grid */}
          {isEpisodeMode && episodeData.parts && episodeData.parts.length > 1 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Episodes
                </h2>
                <span className="text-gray-400 text-sm">
                  {episodeData.count} {episodeData.count === 1 ? 'episode' : 'episodes'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {episodeData.parts.map((part, index) => (
                  <div
                    key={part.id || part._id}
                    onClick={() => handleVideoSelect(part)}
                    className={`group cursor-pointer rounded-xl overflow-hidden bg-gray-900 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                      selectedVideo?.id === part.id || selectedVideo?._id === part._id
                        ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/50'
                        : ''
                    }`}
                  >
                    <div className="aspect-video relative overflow-hidden bg-gray-800">
                      <img
                        src={part.thumbUrl || part.posterUrl || '/api/placeholder/400/225'}
                        alt={part.title || `Episode ${part.episodeSeq || index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/400/225';
                        }}
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50">
                            <Play className="w-6 h-6 text-white fill-white ml-1" />
                          </div>
                        </div>
                      </div>

                      {/* Episode Number */}
                      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded">
                        EP {part.episodeSeq || index + 1}
                      </div>

                      {/* Duration */}
                      {part.runtimeMinutes && (
                        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                          {Math.floor(part.runtimeMinutes / 60)}:{String(part.runtimeMinutes % 60).padStart(2, '0')}
                        </div>
                      )}

                      {/* Selected Badge */}
                      {(selectedVideo?.id === part.id || selectedVideo?._id === part._id) && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                          NOW PLAYING
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <h4 className="text-white font-semibold text-sm line-clamp-2 mb-1 group-hover:text-blue-400 transition-colors">
                        {part.title || `Episode ${part.episodeSeq || index + 1}`}
                      </h4>
                      
                      {part.imdbRating && (
                        <div className="flex items-center space-x-1 text-xs text-gray-400">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span>{part.imdbRating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <Info className="w-5 h-5 text-blue-500" />
              <span>About This {isEpisodeMode ? 'Series' : 'Video'}</span>
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">Title</span>
                  <span className="text-white font-medium">{episodeData.episodeName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">Type</span>
                  <span className="text-white font-medium">{isEpisodeMode ? 'Series' : 'Movie'}</span>
                </div>
                {isEpisodeMode && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-800">
                    <span className="text-gray-400">Total Episodes</span>
                    <span className="text-white font-medium">{episodeData.count}</span>
                  </div>
                )}
              </div>
              
              {selectedVideo && (
                <div className="space-y-3">
                  {selectedVideo.genre && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-800">
                      <span className="text-gray-400">Genre</span>
                      <span className="text-white font-medium">{selectedVideo.genre}</span>
                    </div>
                  )}
                  {selectedVideo.releaseDate && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-800">
                      <span className="text-gray-400">Release Year</span>
                      <span className="text-white font-medium">
                        {new Date(selectedVideo.releaseDate).getFullYear()}
                      </span>
                    </div>
                  )}
                  {selectedVideo.quality && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-800">
                      <span className="text-gray-400">Quality</span>
                      <span className="text-white font-medium">{selectedVideo.quality}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
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

export default Watch;