import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Trash2, Send, Zap, ZapOff, RefreshCw, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendPhoto: (imageDataUrl: string, caption?: string) => void;
  partnerName: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onSendPhoto,
  partnerName
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Synthesize soft shutter sound
  const playShutterSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.09);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Audio playback fails gracefully if unpermitted
    }
  }, []);

  // Stop current stream tracks
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Start camera stream
  const startCamera = useCallback(async (mode: 'user' | 'environment') => {
    try {
      setIsStartingCamera(true);
      setError(null);

      // Stop previous stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your device or browser does not support camera access.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      let errMsg = 'Unable to access camera. Please allow camera permissions in your browser.';
      if (err.name === 'NotAllowedError') {
        errMsg = 'Camera permission denied. Please click the camera icon in your address bar to allow.';
      } else if (err.name === 'NotFoundError') {
        errMsg = 'No camera found on this device.';
      }
      setError(errMsg);
    } finally {
      setIsStartingCamera(false);
    }
  }, [stream]);

  // When modal is opened, start camera
  useEffect(() => {
    if (isOpen && !capturedPhoto) {
      startCamera(facingMode);
    } else if (!isOpen) {
      stopStream();
      setCapturedPhoto(null);
      setCaption('');
      setError(null);
      setIsFlashing(false);
    }
    return () => {
      if (!isOpen) {
        stopStream();
      }
    };
  }, [isOpen]);

  // When switching facingMode
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture frame from video stream
  const captureFrame = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Front-facing camera mirror effect
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedPhoto(dataUrl);

    // Stop camera stream while reviewing photo to save power/battery
    stopStream();
  };

  // Handle capture button press with optional screen flash
  const handleCapture = async () => {
    if (!videoRef.current) return;

    if (isFlashOn) {
      // Screen flash effect: White screen lights up subject
      setIsFlashing(true);

      // Attempt device hardware torch if supported
      try {
        const track = stream?.getVideoTracks()[0];
        const capabilities: any = track?.getCapabilities ? track.getCapabilities() : null;
        if (capabilities && capabilities.torch) {
          await (track as any).applyConstraints({ advanced: [{ torch: true }] });
        }
      } catch {
        // Torch constraint not supported, screen flash handles lighting
      }

      playShutterSound();

      // Delay to let screen light bounce onto the subject
      setTimeout(() => {
        captureFrame();

        // Turn off torch if enabled
        try {
          const track = stream?.getVideoTracks()[0];
          (track as any)?.applyConstraints?.({ advanced: [{ torch: false }] });
        } catch {}

        // Fade out screen flash
        setTimeout(() => {
          setIsFlashing(false);
        }, 120);
      }, 160);
    } else {
      playShutterSound();
      captureFrame();
    }
  };

  // Discard photo and retake
  const handleDeletePhoto = () => {
    setCapturedPhoto(null);
    setCaption('');
    startCamera(facingMode);
  };

  // Send photo
  const handleSend = () => {
    if (!capturedPhoto) return;
    onSendPhoto(capturedPhoto, caption.trim() || undefined);
    onClose();
  };

  // Handle fallback file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCapturedPhoto(dataUrl);
        stopStream();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Screen Flash Overlay: Bright screen flash to illuminate subject in dark environments */}
      {isFlashing && (
        <div
          className="fixed inset-0 z-[100] bg-white pointer-events-none transition-opacity duration-150 animate-pulse"
          style={{ opacity: 0.98 }}
        />
      )}

      {/* Main Modal Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
        <div className="relative w-full max-w-lg bg-[#142033] border border-amber-400/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92vh]">
          {/* Header */}
          <div className="px-5 py-3.5 bg-[#1b2b44] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-amber-400/20 text-amber-300">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-['Quicksand']">
                  {capturedPhoto ? 'Review Photo' : 'Take Live Photo'}
                </h3>
                <p className="text-[11px] text-blue-200/70">
                  {capturedPhoto ? `Ready to send to ${partnerName}` : `Send instantly to ${partnerName} 🐾`}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close camera"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Viewport Area */}
          <div className="relative bg-black flex-1 min-h-[340px] flex items-center justify-center overflow-hidden">
            {!capturedPhoto ? (
              /* LIVE CAMERA VIEW */
              <div className="relative w-full h-full flex items-center justify-center">
                {error ? (
                  /* Error or Permission Blocked state */
                  <div className="p-6 text-center max-w-sm space-y-4">
                    <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <AlertCircle className="w-7 h-7" />
                    </div>
                    <p className="text-xs text-rose-200 leading-relaxed font-medium">
                      {error}
                    </p>
                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        onClick={() => startCamera(facingMode)}
                        className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Retry Camera
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors cursor-pointer flex items-center justify-center gap-2"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Choose photo from device
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Live Video Element */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full max-h-[58vh] object-cover ${
                        facingMode === 'user' ? '-scale-x-100' : ''
                      }`}
                    />

                    {isStartingCamera && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 text-xs text-amber-200">
                        <div className="w-4 h-4 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                        Connecting to camera...
                      </div>
                    )}

                    {/* Top status indicator in Camera view */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-md border ${
                          isFlashOn
                            ? 'bg-amber-400/30 text-amber-200 border-amber-400/50 shadow-sm shadow-amber-400/40'
                            : 'bg-black/50 text-slate-300 border-white/10'
                        }`}
                      >
                        {isFlashOn ? '⚡ Flash: ON' : 'Flash: OFF'}
                      </span>

                      <span className="text-[10px] text-white/70 px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-xs font-mono">
                        {facingMode === 'user' ? 'Front camera' : 'Rear camera'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* CAPTURED PHOTO REVIEW MODE */
              <div className="relative w-full h-full flex flex-col items-center justify-center p-2 bg-[#0d1624]">
                <img
                  src={capturedPhoto}
                  alt="Captured moment"
                  className="max-h-[50vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/15"
                />

                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-amber-300 font-semibold border border-white/10">
                  ✨ Captured Photo
                </div>
              </div>
            )}
          </div>

          {/* Controls Footer */}
          <div className="p-4 bg-[#18273f] border-t border-white/10 space-y-3">
            {!capturedPhoto ? (
              /* Camera Shooting Controls */
              <div className="flex items-center justify-around py-1">
                {/* 1. Flash Toggle */}
                <button
                  type="button"
                  onClick={() => setIsFlashOn((prev) => !prev)}
                  title={isFlashOn ? 'Turn off flash' : 'Turn on flash'}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl transition-all cursor-pointer ${
                    isFlashOn
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-400/30 scale-105'
                      : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {isFlashOn ? <Zap className="w-5 h-5 fill-slate-950" /> : <ZapOff className="w-5 h-5" />}
                  <span className="text-[10px]">{isFlashOn ? 'Flash On' : 'Flash Off'}</span>
                </button>

                {/* 2. Shutter Capture Button */}
                <button
                  type="button"
                  onClick={handleCapture}
                  disabled={Boolean(error) || isStartingCamera}
                  title="Take photo"
                  className={`relative w-18 h-18 rounded-full border-4 border-white flex items-center justify-center transition-all cursor-pointer ${
                    error || isStartingCamera
                      ? 'opacity-40 cursor-not-allowed'
                      : 'hover:scale-105 active:scale-95 shadow-xl shadow-amber-500/20'
                  }`}
                >
                  <div className="w-13 h-13 rounded-full bg-white transition-colors hover:bg-amber-200" />
                  <span className="sr-only">Capture</span>
                </button>

                {/* 3. Switch Camera */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={handleToggleFacingMode}
                    disabled={Boolean(error) || isStartingCamera}
                    title="Switch camera"
                    className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer disabled:opacity-40"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                  <span className="text-[10px] text-slate-300">Switch</span>
                </div>
              </div>
            ) : (
              /* Review Mode Controls */
              <div className="space-y-3">
                {/* Optional Caption */}
                <div className="relative">
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder={`Write a sweet caption for ${partnerName}... (optional)`}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-white/15 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDeletePhoto}
                    title="Delete and retake"
                    className="flex-1 py-3 px-4 rounded-2xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 border border-rose-600/40 font-semibold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-md"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>Delete & Retake</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSend}
                    title={`Send photo to ${partnerName}`}
                    className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-lg shadow-amber-500/25"
                  >
                    <Send className="w-4 h-4 fill-slate-950" />
                    <span>Send Photo</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hidden file input for fallback device selection */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </>
  );
};
