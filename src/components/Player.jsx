
import { useRef, useState, useEffect, useCallback } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Volume1,
  SkipBack,
  SkipForward
} from "lucide-react";

const Player = ({ url, poster, title }) => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  // Reset controls visibility timeout
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  // Mouse move handler
  const handleMouseMove = useCallback(() => {
    if (playing) resetControlsTimeout();
  }, [playing, resetControlsTimeout]);

  // Loaded metadata
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (video?.duration && isFinite(video.duration)) {
      setDuration(video.duration);
      setLoading(false);
    }
  }, []);

  // Time update
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
      setProgress(video.currentTime / video.duration);
    }
  }, []);

  // Play/Pause
  const handlePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      video.play()
        .then(() => {
          setPlaying(true);
          resetControlsTimeout();
        })
        .catch((err) => {
          console.warn("Playback error:", err);
          setError(true);
        });
    } else {
      video.pause();
      setPlaying(false);
    }
  }, [resetControlsTimeout]);

  // Seek
  const handleSeek = useCallback((e) => {
    const video = videoRef.current;
    if (video && duration) {
      const newTime = parseFloat(e.target.value) * duration;
      video.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(newTime / duration);
    }
  }, [duration]);

  // Volume change
  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    const video = videoRef.current;
    if (video) {
      video.volume = newVolume;
      setVolume(newVolume);
      setMuted(newVolume === 0);
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setMuted(video.muted);
      setVolume(video.muted ? 0 : 1);
    }
  }, []);

  // Skip 10 seconds
  const skip = useCallback((forward = true) => {
    const video = videoRef.current;
    if (video && duration) {
      const skipAmount = forward ? 10 : -10;
      const newTime = Math.max(0, Math.min(duration, video.currentTime + skipAmount));
      video.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(newTime / duration);
    }
  }, [duration]);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    const videoContainer = videoRef.current?.parentElement;
    if (!videoContainer) return;

    if (!document.fullscreenElement) {
      videoContainer
        .requestFullscreen()
        .then(() => setFullscreen(true))
        .catch(err => console.warn("Fullscreen error:", err));
    } else {
      document.exitFullscreen().then(() => setFullscreen(false));
    }
  }, []);

  // Format time
  const formatTime = useCallback((time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Loaded data
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      setLoading(true);
      const handleLoadedData = () => setLoading(false);
      video.addEventListener('loadeddata', handleLoadedData);
      return () => video.removeEventListener('loadeddata', handleLoadedData);
    }
  }, [url]);

  // Fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (error) {
    return (
      <div className="relative bg-black w-full aspect-video flex items-center justify-center">
        <div className="text-white text-center p-4">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-lg">Error loading video</p>
          <p className="text-sm opacity-75">Check URL or network connection</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative bg-black w-full aspect-video flex flex-col overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={url}
        poster={poster}
        controls={false}
        preload="metadata"
        playsInline
        crossOrigin="anonymous"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={() => setLoading(false)}
        onEnded={() => setPlaying(false)}
        onError={(e) => {
          console.error("Video Error:", e);
          setError(true);
          setLoading(false);
        }}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />

      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Custom Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${
          showControls ? 'p-4 bg-gradient-to-t from-black/90 via-black/20 to-transparent' : 'p-0'
        }`}
        style={{ zIndex: 10 }}
      >
        {showControls && (
          <>
            {/* Progress Bar */}
            <div className="w-full mb-3">
              <input
                type="range"
                min="0"
                max="1"
                step="any"
                value={progress}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 ${progress * 100}%, #374151 ${progress * 100}%)`
                }}
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between text-white">
              {/* Left Controls */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePlayPause}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  {playing ? <Pause size={20} /> : <Play size={20} />}
                </button>
                
                <button
                  onClick={() => skip(false)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <SkipBack size={16} />
                </button>
                
                <button
                  onClick={() => skip(true)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <SkipForward size={16} />
                </button>
              </div>

              {/* Time */}
              <div className="text-sm opacity-90">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>

              {/* Right Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  {muted || volume === 0 ? <VolumeX size={20} /> : volume > 0.5 ? <Volume2 size={20} /> : <Volume1 size={20} />}
                </button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 ${volume * 100}%, #374151 ${volume * 100}%)`
                  }}
                />
                
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  {fullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Title Overlay */}
      {showControls && title && (
        <div className="absolute top-4 left-4 text-white text-lg font-semibold bg-black/50 px-2 py-1 rounded">
          {title}
        </div>
      )}
    </div>
  );
};

export default Player;