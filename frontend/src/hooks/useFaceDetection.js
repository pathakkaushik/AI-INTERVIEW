import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';

// NOTE: Models need to be downloaded to frontend/public/models/
// Download from: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
// Required: tiny_face_detector_model-weights_manifest.json, tiny_face_detector_model-shard1, face_landmark_68_tiny_model-weights_manifest.json, face_landmark_68_tiny_model-shard1

export const useFaceDetection = (videoRef) => {
  const [faceDetected, setFaceDetected] = useState(false);
  const [eyeContactScore, setEyeContactScore] = useState(0);
  const [isEyeOpen, setIsEyeOpen] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [error, setError] = useState(null);

  const requestRef = useRef();
  const framesRef = useRef(0);
  const eyesOpenFramesRef = useRef(0);
  const lastRunRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models')
        ]);
        if (isMounted) setModelsLoaded(true);
      } catch (err) {
        console.warn('Face-api models failed to load. Please ensure models are placed in /public/models directory.', err);
        if (isMounted) setError(err);
      }
    };
    loadModels();
    return () => { isMounted = false; };
  }, []);

  const calculateEAR = (eye) => {
    // eye is an array of 6 points: [p1, p2, p3, p4, p5, p6]
    const dist = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    
    // ||p2-p6||
    const v1 = dist(eye[1], eye[5]);
    // ||p3-p5||
    const v2 = dist(eye[2], eye[4]);
    // ||p1-p4||
    const h = dist(eye[0], eye[3]);
    
    return (v1 + v2) / (2.0 * h);
  };

  useEffect(() => {
    if (!modelsLoaded || !videoRef?.current || error) return;

    const detect = async (time) => {
      if (time - lastRunRef.current >= 500) {
        lastRunRef.current = time;
        const video = videoRef.current;
        
        if (video.readyState === 4) { // HAVE_ENOUGH_DATA
          try {
            const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(true);
            
            if (detection) {
              setFaceDetected(true);
              const landmarks = detection.landmarks;
              const leftEye = landmarks.getLeftEye();
              const rightEye = landmarks.getRightEye();
              
              const leftEAR = calculateEAR(leftEye);
              const rightEAR = calculateEAR(rightEye);
              
              const avgEAR = (leftEAR + rightEAR) / 2;
              const open = avgEAR > 0.2;
              setIsEyeOpen(open);
              
              framesRef.current += 1;
              if (open) eyesOpenFramesRef.current += 1;
              
              setEyeContactScore(Math.round((eyesOpenFramesRef.current / framesRef.current) * 100));
            } else {
              setFaceDetected(false);
              setIsEyeOpen(false);
            }
          } catch (err) {
            console.error("Face detection error:", err);
          }
        }
      }
      requestRef.current = requestAnimationFrame(detect);
    };

    requestRef.current = requestAnimationFrame(detect);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [modelsLoaded, videoRef, error]);

  return { faceDetected, eyeContactScore, isEyeOpen, modelsLoaded, error };
};

export default useFaceDetection;
