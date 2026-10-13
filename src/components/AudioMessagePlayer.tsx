import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioMessagePlayerProps {
  audioUrl: string;
  duration?: number;
  isMe: boolean;
}

export const AudioMessagePlayer: React.FC<AudioMessagePlayerProps> = ({
  audioUrl,
  duration = 0,
  isMe
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setTotalDuration(Math.round(audio.duration));
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn('Audio play failed:', e);
      });
    }
  };

  const formatSeconds = (sec: number) => {
    const s = Math.floor(sec || 0);
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate simulated waveform heights for visual effect
  const barHeights = [30, 60, 45, 80, 50, 95, 70, 40, 85, 60, 100, 75, 50, 90, 65, 40, 70, 50, 30];
  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div
      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl shadow-xs min-w-[210px] sm:min-w-[240px] max-w-[280px] sm:max-w-[320px] select-none ${
        isMe
          ? 'bg-[#29528d] text-white rounded-br-xs'
          : 'bg-white text-slate-800 rounded-bl-xs border border-[#e4d2b7]'
      }`}
    >
      {/* Play / Pause button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer shadow-sm ${
          isMe
            ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold'
            : 'bg-[#29528d] hover:bg-[#1d3d6b] text-white'
        }`}
        title={isPlaying ? 'Pause audio' : 'Play voice message'}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>

      {/* Waveform & Progress */}
      <div className="flex-1 flex flex-col justify-center gap-1 overflow-hidden">
        <div
          className="flex items-center gap-[2.5px] h-6 cursor-pointer"
          onClick={(e) => {
            if (!audioRef.current || totalDuration <= 0) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            const newTime = clickPos * totalDuration;
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
          }}
        >
          {barHeights.map((h, idx) => {
            const barFraction = (idx / barHeights.length) * 100;
            const isPlayed = barFraction <= progressPercent;

            return (
              <span
                key={idx}
                style={{ height: `${h}%` }}
                className={`w-[3px] rounded-full transition-all duration-150 ${
                  isPlayed
                    ? isMe
                      ? 'bg-amber-300'
                      : 'bg-[#29528d]'
                    : isMe
                      ? 'bg-white/35'
                      : 'bg-slate-300'
                } ${isPlaying && isPlayed ? 'animate-pulse' : ''}`}
              />
            );
          })}
        </div>

        {/* Timers */}
        <div className="flex items-center justify-between text-[10px] font-mono leading-none opacity-80">
          <span>{isPlaying ? formatSeconds(currentTime) : '0:00'}</span>
          <span className="flex items-center gap-1">
            <Volume2 className="w-2.5 h-2.5 opacity-60" />
            <span>{formatSeconds(totalDuration)}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
