import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Trash2, Pause, Play, Send, Mic } from 'lucide-react';

interface VoiceRecorderBarProps {
  onSendAudio: (audioDataUrl: string, duration: number) => void;
  onCancel: () => void;
  partnerName: string;
}

export const VoiceRecorderBar: React.FC<VoiceRecorderBarProps> = ({
  onSendAudio,
  onCancel,
  partnerName
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0); // in seconds
  const [waveLevels, setWaveLevels] = useState<number[]>(new Array(20).fill(15));
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const shouldSendRef = useRef<boolean>(false);
  const durationRef = useRef<number>(0);

  // Clean up all resources
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Start real-time audio visualization
  const startVisualizer = useCallback((stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.65;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const renderWave = () => {
        if (!analyserRef.current) return;

        if (mediaRecorderRef.current?.state === 'recording') {
          analyserRef.current.getByteFrequencyData(dataArray);
          // Pick 20 representative frequency bands
          const levels: number[] = [];
          const step = Math.max(1, Math.floor(bufferLength / 20));
          for (let i = 0; i < 20; i++) {
            const val = dataArray[i * step] || 0;
            // Map 0-255 to percentage 12% - 100%
            const heightPct = Math.min(100, Math.max(14, Math.round((val / 255) * 100)));
            levels.push(heightPct);
          }
          setWaveLevels(levels);
        } else {
          // If paused, keep subtle resting idle wave
          setWaveLevels((prev) => prev.map((h) => Math.max(12, Math.round(h * 0.9))));
        }

        animationFrameRef.current = requestAnimationFrame(renderWave);
      };

      renderWave();
    } catch (e) {
      console.warn('Audio visualization unavailable:', e);
    }
  }, []);

  // Initialize MediaRecorder and start recording immediately
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      audioChunksRef.current = [];
      durationRef.current = 0;
      setDuration(0);
      shouldSendRef.current = false;

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support microphone recording.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      streamRef.current = stream;

      // Choose supported mimeType
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
        else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
        else mimeType = '';
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        cleanup();
        setIsRecording(false);

        if (shouldSendRef.current) {
          const finalDuration = Math.max(1, durationRef.current);
          const finalBlob = new Blob(audioChunksRef.current, {
            type: recorder.mimeType || 'audio/webm'
          });

          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            if (dataUrl) {
              onSendAudio(dataUrl, finalDuration);
            }
          };
          reader.readAsDataURL(finalBlob);
        }
      };

      recorder.start(200); // chunk every 200ms
      setIsRecording(true);
      setIsPaused(false);

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        durationRef.current += 1;
        setDuration(durationRef.current);
      }, 1000);

      // Start visualizer
      startVisualizer(stream);
    } catch (err: any) {
      console.warn('Microphone access notice:', err?.message || err);
      let msg = 'Microphone permission has not been granted.';
      if (err.name === 'NotAllowedError' || err.message?.toLowerCase().includes('permission')) {
        msg = 'Microphone permission denied. Please click the lock icon in the address bar to Allow microphone.';
      } else if (err.name === 'NotFoundError') {
        msg = 'No microphone device found.';
      }
      setError(msg);
    }
  }, [cleanup, onSendAudio, startVisualizer]);

  // Handle fallback audio file selection if mic is blocked
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (dataUrl) {
        // Estimate duration or default to 5 seconds
        onSendAudio(dataUrl, 5);
        cleanup();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Start recording on mount
  useEffect(() => {
    startRecording();
    return () => {
      cleanup();
    };
  }, []);

  // Handle Pause / Resume toggle
  const handleTogglePause = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    if (recorder.state === 'recording') {
      recorder.pause();
      setIsPaused(true);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    } else if (recorder.state === 'paused') {
      recorder.resume();
      setIsPaused(false);
      timerIntervalRef.current = setInterval(() => {
        durationRef.current += 1;
        setDuration(durationRef.current);
      }, 1000);
    }
  };

  // Handle Delete (Thùng rác bên trái soundwave)
  const handleDelete = () => {
    shouldSendRef.current = false;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    cleanup();
    // Restart fresh recording
    startRecording();
  };

  // Handle Exit ("X" icon button)
  const handleExit = () => {
    shouldSendRef.current = false;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    cleanup();
    onCancel();
  };

  // Handle Send button (Bên phải nút Pause/Resume)
  const handleSend = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;
    shouldSendRef.current = true;
    mediaRecorderRef.current.stop();
  };

  return (
    <div className="w-full flex items-center gap-2 p-2 sm:p-2.5 bg-[#f5e5cc] rounded-2xl border border-[#dec9ab] shadow-inner select-none transition-all">
      {/* 1. Icon Button "X" to exit voice recording */}
      <button
        type="button"
        onClick={handleExit}
        title="Exit voice recorder"
        className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-black/10 transition-colors shrink-0 cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      {/* 2. Delete Button (Trash2) */}
      <button
        type="button"
        onClick={handleDelete}
        title="Delete and restart from beginning"
        className="p-2 rounded-full text-rose-600 hover:text-rose-800 hover:bg-rose-100 transition-colors shrink-0 cursor-pointer"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      {/* Error notification if mic blocked */}
      {error ? (
        <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-3 py-2 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
          <span className="truncate max-w-full font-medium">{error}</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => startRecording()}
              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] cursor-pointer transition-colors"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 font-semibold text-[11px] cursor-pointer transition-colors"
            >
              Choose audio file
            </button>
          </div>
        </div>
      ) : (
        /* 3. Soundwave & Timer */
        <div className="flex-1 flex items-center gap-2.5 px-3 py-1.5 bg-white/80 rounded-xl border border-amber-200/80 shadow-xs min-w-0 overflow-hidden">
          {/* Recording / Paused status indicator dot */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isPaused
                  ? 'bg-amber-500'
                  : 'bg-rose-500 animate-ping'
              }`}
            />
            <span className="text-xs font-mono font-bold text-slate-800 tabular-nums min-w-[38px]">
              {formatTime(duration)}
            </span>
          </div>

          {/* Soundwave animation bars */}
          <div className="flex-1 flex items-center justify-center gap-[2.5px] h-6 overflow-hidden">
            {waveLevels.map((lvl, index) => (
              <span
                key={index}
                style={{ height: `${lvl}%` }}
                className={`w-[3px] rounded-full transition-all duration-75 ${
                  isPaused
                    ? 'bg-amber-400 opacity-60'
                    : 'bg-gradient-to-t from-rose-500 via-amber-500 to-amber-400'
                }`}
              />
            ))}
          </div>

          <span className="text-[10px] text-amber-900/60 font-medium shrink-0 hidden sm:inline">
            {isPaused ? 'Paused' : 'Recording...'}
          </span>
        </div>
      )}

      {/* 4. Pause / Resume Button */}
      <button
        type="button"
        onClick={handleTogglePause}
        disabled={Boolean(error)}
        title={isPaused ? 'Resume recording' : 'Pause recording'}
        className={`p-2.5 rounded-full transition-all shrink-0 cursor-pointer ${
          isPaused
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
            : 'bg-amber-200 hover:bg-amber-300 text-amber-950'
        } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {isPaused ? (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        ) : (
          <Pause className="w-4 h-4 fill-current" />
        )}
      </button>

      {/* 5. Send Voice Button */}
      <button
        type="button"
        onClick={handleSend}
        disabled={Boolean(error)}
        title={`Send voice note to ${partnerName}`}
        className="p-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Send className="w-4 h-4 fill-slate-950" />
      </button>

      {/* Hidden file input for audio fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
