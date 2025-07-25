import React, { forwardRef, useEffect, useRef } from 'react';

interface VideoPlayerProps {
  stream: MediaStream | null;
  isLocal: boolean;
  username: string;
  muted: boolean;
  className?: string;
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ stream, isLocal, username, muted, className = '' }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }
    }, [stream]);

    return (
      <div className={`relative bg-gray-800 rounded-lg overflow-hidden ${className}`}>
        <video
          ref={ref || videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay con información del usuario */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <div className="flex items-center gap-2">
            {isLocal && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                Tú
              </span>
            )}
            <span className="text-white text-sm font-medium truncate">
              {username}
            </span>
          </div>
        </div>

        {/* Indicador de micrófono/video desactivado */}
        {stream && (
          <div className="absolute top-3 right-3 flex gap-2">
            {!stream.getAudioTracks()[0]?.enabled && (
              <div className="bg-red-500 text-white p-1 rounded-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            {!stream.getVideoTracks()[0]?.enabled && (
              <div className="bg-red-500 text-white p-1 rounded-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer; 