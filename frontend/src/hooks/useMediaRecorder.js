import { useState, useRef, useCallback, useEffect } from 'react';

const useMediaRecorder = () => {
  const [stream, setStream] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const videoRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      setPermissionDenied(false);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      return true;
    } catch (err) {
      console.error('Camera access denied:', err);
      setPermissionDenied(true);
      return false;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const toggleMute = useCallback(() => {
    if (stream) {
      stream.getAudioTracks().forEach(track => { track.enabled = !track.enabled; });
      setIsMuted(prev => !prev);
    }
  }, [stream]);

  const toggleCamera = useCallback(() => {
    if (stream) {
      stream.getVideoTracks().forEach(track => { track.enabled = !track.enabled; });
      setIsCameraOff(prev => !prev);
    }
  }, [stream]);

  useEffect(() => {
    if (!stream || isMuted) {
      setAudioLevel(0);
      return;
    }

    let audioContext;
    let source;
    let analyser;
    let animationFrameId;

    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      source = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!stream || stream.getAudioTracks().length === 0 || !stream.getAudioTracks()[0].enabled) {
          setAudioLevel(0);
          return;
        }
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        // Normalize: average typically values between 0 and 80 for speech
        const normalized = Math.min(100, Math.round((average / 60) * 100));
        setAudioLevel(normalized);
        animationFrameId = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.error('Audio analyzer error:', err);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (audioContext) {
        audioContext.close().catch(() => {});
      }
    };
  }, [stream, isMuted]);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

  return { stream, permissionDenied, isMuted, isCameraOff, audioLevel, videoRef, startCamera, stopCamera, toggleMute, toggleCamera };
};

export default useMediaRecorder;
