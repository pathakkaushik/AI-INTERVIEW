import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import CognitiveLoadMeter from '../components/CognitiveLoadMeter';
import CameraPermissionModal from '../components/CameraPermissionModal';
import Navbar from '../components/Navbar';
import useMediaRecorder from '../hooks/useMediaRecorder';
import useFaceDetection from '../hooks/useFaceDetection';
import { Mic, MicOff, Video, VideoOff, Settings2, UserCheck, AlertTriangle, Play, Square, FileText, Code, Server, Layers, Cloud, Brain, Smartphone, Layout, Users } from 'lucide-react';
import { api } from '../utils/api';

const roleOptions = [
  { name: 'Frontend Engineer', icon: Layout },
  { name: 'Backend Engineer', icon: Server },
  { name: 'Full Stack Developer', icon: Layers },
  { name: 'DevOps / Cloud Engineer', icon: Cloud },
  { name: 'Data Scientist / ML Engineer', icon: Brain },
  { name: 'System Design / Architecture', icon: Code },
  { name: 'Product Manager', icon: Users },
  { name: 'Mobile Developer', icon: Smartphone },
];

const Interview = () => {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const location = useLocation();
  const [phase, setPhase] = useState('setup');
  const [setupStep, setSetupStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('Frontend Engineer');
  const [personality, setPersonality] = useState('Friendly');
  const [difficulty, setDifficulty] = useState('Medium');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [interviewId, setInterviewId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(20);
  const [analysis, setAnalysis] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [loading, setLoading] = useState(false);
  const [noMoreQuestions, setNoMoreQuestions] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [resumeText, setResumeText] = useState('');

  const { videoRef, stream, isMuted, isCameraOff, audioLevel, startCamera, stopCamera, toggleMute, toggleCamera } = useMediaRecorder();
  const { faceDetected, eyeContactScore, isEyeOpen, modelsLoaded } = useFaceDetection(videoRef);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  
  const [inputMode, setInputMode] = useState('voice'); // 'voice' or 'type'
  const [sttSupported] = useState(() => !!(window.SpeechRecognition || window.webkitSpeechRecognition));
  const [resumeFile, setResumeFile] = useState(null);

  // Settings states
  const [showSettings, setShowSettings] = useState(false);
  const [autoRead, setAutoRead] = useState(true);
  const [speechRate, setSpeechRate] = useState(0.88); // Calibrated to 0.88 for perfect voice clarity and natural phrasing
  const [voiceGender, setVoiceGender] = useState('female'); // Default to human girl voice
  const [showCognitiveLoad, setShowCognitiveLoad] = useState(true);
  const [questionDuration, setQuestionDuration] = useState(60); // Default 60 seconds

  // Countdown timer state
  const [questionTimeLeft, setQuestionTimeLeft] = useState(60);

  const questionText = currentQuestion?.text || currentQuestion?.question?.text || 'Loading question...';
  const keywordsDetected = analysis?.keywordsDetected || analysis?.analysis?.keywordsDetected || [];
  const missingConcepts = analysis?.missingConcepts || analysis?.analysis?.missingConcepts || [];
  const suggestedImprovement = analysis?.suggestedImprovement || analysis?.analysis?.suggestedImprovement || '';

  // Trigger speech synthesis voices pre-loading on mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }
  }, []);

  // Web Speech Synthesis (Text to Speech for AI interviewer)
  const speakQuestion = useCallback((text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      // Add natural human conversational transitions to make it sound conversational rather than machine-read
      let spokenText = text;
      if (questionNumber <= 1) {
        spokenText = `Hi there. Welcome to your interview session. To start, could you please explain... ${text}`;
      } else {
        const transitions = [
          `Okay, moving on... ${text}`,
          `Alright, for the next question... ${text}`,
          `Got it. Now... ${text}`,
          `Okay, could you tell me... ${text}`,
          `Sure. Next, I'd like to ask... ${text}`,
          `Alright. So... ${text}`
        ];
        const transitionIndex = (questionNumber - 2) % transitions.length;
        spokenText = transitions[transitionIndex];
      }

      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.rate = speechRate; 
      utterance.pitch = 1.0; // Restore standard pitch (1.0) to avoid any squeaky or distorted voice outputs
      utterance.volume = 1.0; // Maximum loudness/volume output
      
      const voices = window.speechSynthesis.getVoices();
      
      // Helper function to check if the voice is an Indian English voice (en-IN or en_IN)
      const isIndianVoice = v => {
        const lang = v.lang.toLowerCase().replace('_', '-');
        return lang.includes('en-in') || lang === 'en-in';
      };

      // Sort and prioritize high-quality Indian English (en-IN) neural/natural voices for localized accent
      let voicePriorities = [];
      if (voiceGender === 'female') {
        voicePriorities = [
          // 1. Premium Neural Indian English Female (Neerja, Isha, Veena, Heera)
          v => isIndianVoice(v) && (v.name.toLowerCase().includes('neerja') || v.name.toLowerCase().includes('isha') || v.name.toLowerCase().includes('veena') || v.name.toLowerCase().includes('heera')),
          // 2. Generic Indian English Female / Google Indian English
          v => isIndianVoice(v) && (v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('female')),
          // 3. Any Indian English Voice
          v => isIndianVoice(v),
          // Fallbacks (US Female)
          v => v.name.toLowerCase().includes('aria') && v.lang.includes('en'),
          v => v.name.toLowerCase().includes('jenny') && v.lang.includes('en'),
          v => v.name.toLowerCase().includes('google us english female') && v.lang.includes('en'),
          v => v.lang.startsWith('en-US'),
          v => v.lang.startsWith('en')
        ];
      } else {
        voicePriorities = [
          // 1. Premium Neural Indian English Male (Prabhat, Rishi, Ravi)
          v => isIndianVoice(v) && (v.name.toLowerCase().includes('prabhat') || v.name.toLowerCase().includes('rishi') || v.name.toLowerCase().includes('ravi')),
          // 2. Generic Indian English Male / Google Indian English
          v => isIndianVoice(v) && (v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('male')),
          // 3. Any Indian English Voice
          v => isIndianVoice(v),
          // Fallbacks (US Male)
          v => v.name.toLowerCase().includes('guy') && v.lang.includes('en'),
          v => v.name.toLowerCase().includes('google us english male') && v.lang.includes('en'),
          v => v.name.toLowerCase().includes('david') && v.lang.includes('en-US'),
          v => v.lang.startsWith('en-US'),
          v => v.lang.startsWith('en')
        ];
      }

      let selectedVoice = null;
      for (const priority of voicePriorities) {
        selectedVoice = voices.find(priority);
        if (selectedVoice) break;
      }

      if (selectedVoice) utterance.voice = selectedVoice;
      
      window.speechSynthesis.speak(utterance);
    }
  }, [speechRate, questionNumber, voiceGender]);

  // Web Speech Recognition (Speech to Text for Candidate answering)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setAnswerText(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stop speech recognition when muted
  useEffect(() => {
    if (isMuted && isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isMuted, isListening]);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (isMuted) {
        // Automatically unmute for user convenience
        toggleMute();
      }
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error('Speech recognition start failed:', e);
      }
    }
  };

  // Speak when current question changes
  useEffect(() => {
    if (phase === 'active' && questionText && questionText !== 'Loading question...' && autoRead) {
      const timer = setTimeout(() => {
        speakQuestion(questionText);
      }, 1000);
      return () => {
        clearTimeout(timer);
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      };
    }
  }, [currentQuestion, phase, questionText, speakQuestion, autoRead]);

  const videoCallbackRef = useCallback((node) => {
    if (videoRef) {
      videoRef.current = node;
    }
    if (node && stream) {
      node.srcObject = stream;
    }
  }, [stream, videoRef]);

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Resume active interview on mount or when routeId changes
  useEffect(() => {
    if (routeId && routeId !== interviewId) {
      const loadInterview = async () => {
        setLoading(true);
        try {
          const res = await api.getInterview(routeId);
          const interview = res.data || res;
          
          if (interview.status === 'completed') {
            navigate(`/results/${routeId}`, { replace: true });
            return;
          }

          // Resume active interview
          setInterviewId(routeId);
          setSelectedRole(interview.role || 'Frontend Engineer');
          setPersonality(interview.personality || 'Friendly');
          setDifficulty(interview.difficulty || 'Medium');

          // Auto-start camera on resume unless explicitly skipped in setup
          if (location.state?.skipCamera !== true) {
            await startCamera();
          }
          
          if (interview.currentQuestion > 0) {
            setQuestionNumber(interview.currentQuestion);
            setTotalQuestions(interview.totalQuestions || 5);
            
            // Get the current question (which is generated but unanswered)
            const questionRes = await api.getNextQuestion(routeId);
            if (questionRes.success) {
              setCurrentQuestion(questionRes.data || questionRes);
              setQuestionTimeLeft(questionDuration);
              setPhase('active');
              setIsTimerRunning(true);
            } else {
              setNoMoreQuestions(true);
              setPhase('active');
            }
          } else {
            // New interview flow - fetch the first question and start the interview session
            const questionRes = await api.getNextQuestion(routeId);
            if (questionRes.success) {
              setCurrentQuestion(questionRes.data || questionRes);
              setQuestionNumber(1);
              setTotalQuestions(interview.totalQuestions || 5);
              setQuestionTimeLeft(questionDuration);
              setPhase('active');
              setIsTimerRunning(true);
            } else {
              setNoMoreQuestions(true);
              setPhase('active');
            }
          }
        } catch (err) {
          console.error('Failed to resume interview:', err);
          setPhase('setup');
        } finally {
          setLoading(false);
        }
      };
      loadInterview();
    }
  }, [routeId, interviewId, navigate, questionDuration, startCamera, location.state]);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const personalities = ['Friendly', 'Strict', 'HR-like', 'Technical Expert'];

  const handleStartInterview = () => setShowCameraModal(true);

  const handleCameraAllow = async () => {
    const success = await startCamera();
    if (!success) {
      setCameraError('Camera access was denied. You can continue with text-only mode.');
      return;
    }
    setShowCameraModal(false);
    await startInterviewSession(false);
  };

  const handleCameraSkip = async () => {
    setShowCameraModal(false);
    await startInterviewSession(true);
  };

  const startInterviewSession = async (skipCamera = false) => {
    setLoading(true);
    try {
      let res;
      if (resumeFile) {
        const formData = new FormData();
        formData.append('title', `${selectedRole} - ${personality} Interview`);
        formData.append('role', selectedRole);
        formData.append('personality', personality);
        formData.append('difficulty', difficulty);
        formData.append('resume', resumeFile);
        res = await api.createInterviewWithFile(formData);
      } else {
        res = await api.createInterview({ title: `${selectedRole} - ${personality} Interview`, role: selectedRole, personality, difficulty, resumeText });
      }
      const newId = res.data?._id || res.data?.id;
      navigate(`/interview/${newId}`, { replace: true, state: { skipCamera } });
    } catch (err) { 
      console.error('Failed to start interview:', err); 
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (isTimeoutArg = false) => {
    const isTimeout = isTimeoutArg === true;
    const finalAnswer = isTimeout && !answerText.trim() ? "[Time limit exceeded - no response provided]" : answerText;
    if (!finalAnswer.trim()) return;
    setLoading(true);
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    try {
      const res = await api.submitAnswer(interviewId, { answerText: finalAnswer });
      setAnalysis(res.data || res);
      setIsTimerRunning(false);
      setPhase('breakdown');
    } catch (err) { console.error('Failed to submit answer:', err); }
    finally { setLoading(false); }
  };

  const handleNextQuestion = async () => {
    setLoading(true);
    setAnswerText('');
    setAnalysis(null);
    try {
      const questionRes = await api.getNextQuestion(interviewId);
      if (!questionRes.success) { setNoMoreQuestions(true); return; }
      setCurrentQuestion(questionRes.data || questionRes);
      setQuestionNumber(prev => prev + 1);
      setQuestionTimeLeft(questionDuration); // Reset countdown timer
      setPhase('active');
      setIsTimerRunning(true);
    } catch (err) { setNoMoreQuestions(true); }
    finally { setLoading(false); }
  };

  const handleSubmitRef = useRef();
  handleSubmitRef.current = handleSubmitAnswer;
  const timerExpiredRef = useRef(false);

  // Countdown timer effect
  useEffect(() => {
    let timer;
    timerExpiredRef.current = false;
    if (phase === 'active' && isTimerRunning && questionTimeLeft > 0) {
      timer = setInterval(() => {
        setQuestionTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            timerExpiredRef.current = true;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [phase, isTimerRunning]);

  // Auto-submit when timer expires (separate effect to avoid side-effect in state updater)
  useEffect(() => {
    if (questionTimeLeft === 0 && timerExpiredRef.current && handleSubmitRef.current) {
      timerExpiredRef.current = false;
      handleSubmitRef.current(true);
    }
  }, [questionTimeLeft]);

  const handleDurationChange = (newVal) => {
    setQuestionDuration(newVal);
    if (phase === 'active') {
      setQuestionTimeLeft(newVal);
    }
  };

  const handleEndInterview = async () => {
    setLoading(true);
    stopCamera();
    try { await api.endInterview(interviewId); navigate(`/results/${interviewId}`); }
    catch (err) { navigate(`/results/${interviewId}`); }
    finally { setLoading(false); }
  };

  if (routeId && interviewId !== routeId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="loading-spinner" />
          <p className="text-secondary text-sm">Resuming your interview session...</p>
        </div>
      </div>
    );
  }

  if (phase === 'setup') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen p-8 max-w-4xl mx-auto flex flex-col items-center justify-center" style={{ paddingTop: '80px' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
            <Card className="text-center">
              {setupStep === 1 ? (
                <>
                  <h1 className="text-2xl font-bold mb-2">Select Your Role</h1>
                  <p className="text-sm text-secondary mb-6">Choose the role you want to practice for</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
                    {roleOptions.map(({ name, icon: Icon }) => (
                      <div key={name} onClick={() => setSelectedRole(name)}
                        className={`p-4 rounded-lg cursor-pointer border transition-smooth`}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderColor: selectedRole === name ? 'var(--accent-blue)' : 'var(--panel-border)', background: selectedRole === name ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)' }}>
                        <Icon size={20} style={{ color: selectedRole === name ? 'var(--accent-blue)' : 'var(--text-secondary)' }} />
                        <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{name}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <Button variant="secondary" onClick={() => navigate('/dashboard')}>Cancel</Button>
                    <Button onClick={() => setSetupStep(2)}>Next: Configure Interviewer</Button>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold mb-2">Configure AI Interviewer</h1>
                  <p className="text-sm text-secondary mb-6">Role: <span style={{ color: 'var(--accent-blue)' }}>{selectedRole}</span></p>
                  
                  <h3 className="text-left font-semibold text-sm mb-3">AI Personality</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {personalities.map(p => (
                      <div key={p} onClick={() => setPersonality(p)}
                        className="p-4 rounded-lg cursor-pointer"
                        style={{
                          border: `1px solid ${personality === p ? 'var(--accent-blue)' : 'var(--panel-border)'}`,
                          background: personality === p ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                          transition: 'var(--transition-smooth)',
                          boxShadow: personality === p ? '0 0 20px rgba(99, 102, 241, 0.1)' : 'none'
                        }}>
                        <p className="font-semibold">{p}</p>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-left font-semibold text-sm mb-3">Interview Difficulty</h3>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {['Easy', 'Medium', 'Hard'].map(d => (
                      <div key={d} onClick={() => setDifficulty(d)}
                        className="p-4 rounded-lg cursor-pointer"
                        style={{
                          border: `1px solid ${difficulty === d ? 'var(--accent-blue)' : 'var(--panel-border)'}`,
                          background: difficulty === d ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                          transition: 'var(--transition-smooth)',
                          boxShadow: difficulty === d ? '0 0 20px rgba(99, 102, 241, 0.1)' : 'none'
                        }}>
                        <p className="font-semibold text-sm">{d}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-sm">Resume / Key Skills (Optional)</h3>
                    <label className="text-xs font-semibold cursor-pointer text-indigo-400 hover:text-indigo-300 transition-smooth">
                      Upload Resume
                      <input
                        type="file"
                        accept=".txt,.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            if (file.name.endsWith('.txt')) {
                              setResumeFile(null);
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setResumeText(event.target.result);
                              };
                              reader.readAsText(file);
                            } else {
                              setResumeFile(file);
                              setResumeText(`[Document uploaded: ${file.name}]`);
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume text here or upload a .txt file to customize interview questions..."
                    className="w-full h-24 p-3 rounded-lg border mb-8 text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderColor: 'var(--panel-border)',
                      color: 'var(--text-primary)',
                      resize: 'none',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--panel-border)'}
                  />

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <Button variant="secondary" onClick={() => setSetupStep(1)}>Back</Button>
                    <Button onClick={handleStartInterview} disabled={loading}>
                      {loading ? <span className="flex items-center gap-2"><span className="loading-spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }} />Starting...</span> : <><Play size={16}/> Start Interview</>}
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
          <CameraPermissionModal isOpen={showCameraModal} onAllow={handleCameraAllow} onSkip={handleCameraSkip} error={cameraError} />
        </div>
      </>
    );
  }



  return (
    <>
      <Navbar />
      <div className="interview-page-container max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center glass-panel px-6 py-3" style={{ flexWrap: 'wrap', gap: '0.5rem', flexShrink: 0 }}>
          <div className="flex items-center gap-4">
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 2s infinite' }} />
            <span className="font-mono">{formatTime(time)}</span>
            <span style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', fontSize: '0.75rem', fontWeight: 600 }}>{personality} Mode</span>
            <span className="px-2 py-1 rounded text-xs font-semibold" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)' }}>{selectedRole}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-yellow-400 font-semibold flex items-center gap-1 hide-mobile"><AlertTriangle size={14}/> Difficulty: {difficulty}</span>
            <Button variant="danger" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={handleEndInterview} disabled={loading}>
              <Square size={14}/> End
            </Button>
          </div>
        </div>

        <div className="interview-grid">
          {/* Main Camera Feed */}
          <div className="interview-camera-container glass-panel" style={{ border: '1px solid rgba(255,255,255,0.08)', minHeight: '400px' }}>
            {stream && !isCameraOff ? (
              <video ref={videoCallbackRef} autoPlay muted playsInline className="w-full h-full object-cover absolute inset-0 z-0" style={{ transform: 'scaleX(-1)' }} />
            ) : (
              <div className="absolute inset-0 z-0 flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1rem', border: '1px solid rgba(99, 102, 241, 0.2)',
                  boxShadow: '0 0 20px rgba(99, 102, 241, 0.15)',
                  animation: 'pulse 3s infinite'
                }}>
                  <VideoOff size={32} style={{ color: 'var(--accent-blue)' }} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Camera Feed is Disabled</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>You are in Text / Voice-only mode</p>
              </div>
            )}

            {/* Settings Overlay inside Video Feed */}
            {showSettings && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 30,
                background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1.5rem'
              }}>
                <div className="glass-panel w-full max-w-sm" style={{ padding: '1.5rem', background: 'rgba(20,20,30,0.85)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--accent-blue)', margin: 0 }}>
                      <Settings2 size={16} /> Interview Configuration
                    </h3>
                    <button 
                      onClick={() => setShowSettings(false)} 
                      style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: '#fff', cursor: 'pointer', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                    {/* Time Limit */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Question Time Limit</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', fontWeight: 'bold' }}>{questionDuration}s</span>
                      </div>
                      <input 
                        type="range" 
                        min="30" 
                        max="180" 
                        step="15" 
                        value={questionDuration} 
                        onChange={(e) => handleDurationChange(parseInt(e.target.value))} 
                        style={{ width: '100%', accentColor: 'var(--accent-blue)', cursor: 'pointer' }}
                      />
                    </div>

                    {/* Auto Read */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block' }}>Auto-Read Questions</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AI speaks the question aloud</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={autoRead} 
                        onChange={(e) => setAutoRead(e.target.checked)} 
                        style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
                      />
                    </div>

                    {/* Voice Pitch/Speed */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>AI Speech Speed</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', fontWeight: 'bold' }}>{speechRate}x</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.6" 
                        max="1.4" 
                        step="0.1" 
                        value={speechRate} 
                        onChange={(e) => setSpeechRate(parseFloat(e.target.value))} 
                        style={{ width: '100%', accentColor: 'var(--accent-blue)', cursor: 'pointer' }}
                      />
                    </div>

                    {/* Voice Gender Selection */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block' }}>Interviewer Voice</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Select male or female voice</span>
                      </div>
                      <select 
                        value={voiceGender} 
                        onChange={(e) => setVoiceGender(e.target.value)} 
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.08)', 
                          border: '1px solid rgba(255, 255, 255, 0.12)', 
                          color: '#fff', 
                          borderRadius: '6px', 
                          padding: '0.25rem 0.5rem', 
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="female" style={{ background: '#1e1b4b' }}>Female (Human Girl)</option>
                        <option value="male" style={{ background: '#1e1b4b' }}>Male (Human Boy)</option>
                      </select>
                    </div>



                    {/* Cognitive Load */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block' }}>Cognitive Load Meter</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Show cognitive load bar</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={showCognitiveLoad} 
                        onChange={(e) => setShowCognitiveLoad(e.target.checked)} 
                        style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4" onClick={() => setShowSettings(false)}>
                    Done
                  </Button>
                </div>
              </div>
            )}

            {/* Absolute positioned overlay elements */}
            {/* Top Bar overlays */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'flex-end', pointerEvents: 'auto', zIndex: 10 }}>
              <div className="p-3 w-48" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-md)' }}>
                <h3 className="text-xs text-secondary font-semibold mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1"><Mic size={12}/> Audio Indicator</span>
                  <span style={{ 
                    color: isMuted ? '#ef4444' : '#10b981', 
                    fontSize: '10px', 
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {isMuted ? 'Muted' : 'Active'}
                  </span>
                </h3>
                {!isMuted && stream ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '16px', marginTop: '8px' }}>
                    {[0.3, 0.6, 1.0, 0.7, 0.4].map((multiplier, i) => {
                      const heightValue = Math.max(3, Math.round(audioLevel * multiplier * 0.15));
                      return (
                        <div 
                          key={i} 
                          style={{ 
                            width: '3px', 
                            height: `${heightValue}px`, 
                            background: audioLevel > 5 ? 'var(--accent-blue)' : 'rgba(255,255,255,0.3)',
                            borderRadius: '2px',
                            transition: 'height 0.05s ease-out'
                          }} 
                        />
                      );
                    })}
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginLeft: '4px' }}>
                      {audioLevel > 5 ? 'Listening...' : 'Silent'}
                    </span>
                  </div>
                ) : (
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
                    {isMuted ? 'Microphone is muted' : 'No mic stream found'}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Controls */}
            <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '1rem', pointerEvents: 'auto', zIndex: 10 }}>
              <button onClick={toggleMute}
                style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'var(--transition-smooth)',
                  border: isMuted ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
                  background: isMuted ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(12px)', color: '#fff'
                }}>
                {isMuted ? <MicOff size={20}/> : <Mic size={20}/>}
              </button>
              <button onClick={toggleCamera}
                style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'var(--transition-smooth)',
                  border: isCameraOff ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
                  background: isCameraOff ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(12px)', color: '#fff'
                }}>
                {isCameraOff ? <VideoOff size={20}/> : <Video size={20}/>}
              </button>
              <button
                onClick={() => setShowSettings(prev => !prev)}
                style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'var(--transition-smooth)',
                  border: showSettings ? '1px solid var(--accent-blue)' : '1px solid rgba(255, 255, 255, 0.15)',
                  background: showSettings ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(12px)', color: '#fff'
                }}><Settings2 size={20}/></button>
            </div>
          </div>

          {/* Side Panel */}
          <div className="interview-side-panel">
            <Card className="flex-1 overflow-y-auto flex flex-col" style={{ height: '100%', minHeight: 0 }}>
              <div className="mb-4">
                <span className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-2 block">Question {questionNumber}/{totalQuestions}</span>
                <h2 className="text-lg font-semibold">{questionText}</h2>
              </div>

              {phase === 'active' && (
                <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Question Timer</span>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      fontFamily: 'monospace', 
                      fontWeight: 'bold', 
                      color: questionTimeLeft <= 10 ? '#ef4444' : 'var(--accent-blue)',
                      animation: questionTimeLeft <= 10 ? 'pulse 1s infinite' : 'none'
                    }}>
                      {questionTimeLeft}s remaining
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${(questionTimeLeft / questionDuration) * 100}%`, 
                      height: '100%', 
                      background: questionTimeLeft <= 10 ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, var(--accent-blue), #60a5fa)',
                      transition: 'width 1s linear',
                      borderRadius: '3px'
                    }} />
                  </div>
                </div>
              )}

              {phase === 'active' ? (
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  <p className="text-sm text-secondary mb-4 italic flex gap-2"><div className="w-1 h-4 bg-purple-500" /> Speak or type your answer...</p>
                  
                  {!sttSupported && (
                    <div style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '8px', padding: '8px 12px', marginBottom: '8px', fontSize: '0.75rem', color: '#fbbf24' }}>
                      ⚠️ Voice input not available in this browser. Use Chrome or Edge for voice mode.
                    </div>
                  )}

                  <textarea 
                    className="form-textarea mb-4" 
                    placeholder={isListening ? "Listening... Speak into your mic now!" : "Type your answer or click 'Answer with Voice'..."} 
                    value={answerText} 
                    onChange={(e) => setAnswerText(e.target.value)} 
                    style={{ minHeight: '120px' }}
                  />

                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {sttSupported && inputMode === 'voice' && (
                      <Button 
                        type="button"
                        variant="secondary"
                        onClick={toggleSpeechRecognition}
                        style={{ 
                          flex: 1, 
                          background: isListening ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.1)',
                          border: isListening ? '1px solid #ef4444' : '1px solid rgba(99, 102, 241, 0.2)',
                          color: isListening ? '#ef4444' : 'var(--accent-blue)',
                          borderRadius: '12px'
                        }}
                      >
                        {isListening ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                            Stop Listening
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Mic size={14} /> Answer with Voice
                          </span>
                        )}
                      </Button>
                    )}
                    
                    {!sttSupported && (
                      <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                        Voice input is not supported in this browser. Please type your answer below.
                      </div>
                    )}

                    {sttSupported && (
                      <button
                        onClick={() => setInputMode(prev => prev === 'voice' ? 'type' : 'voice')}
                        className="text-xs px-3 py-1 rounded-full"
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--panel-border)',
                          cursor: 'pointer'
                        }}
                      >
                        {inputMode === 'voice' ? '⌨️ Switch to Typing' : '🎤 Switch to Voice'}
                      </button>
                    )}

                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={() => speakQuestion(questionText)}
                      style={{ borderRadius: '12px', border: '1px solid var(--panel-border)', flex: 1 }}
                    >
                      🔊 Repeat Question
                    </Button>
                  </div>

                  {showCognitiveLoad && <CognitiveLoadMeter />}

                  {/* Real-time Eye Contact Indicator (powered by face-api.js) */}
                  {modelsLoaded && (
                    <div style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--panel-border)',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      marginTop: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: faceDetected ? (isEyeOpen ? '#10b981' : '#f59e0b') : '#ef4444',
                          display: 'inline-block',
                          animation: faceDetected ? 'pulse 2s infinite' : 'none'
                        }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {faceDetected ? (isEyeOpen ? 'Eye Contact' : 'Eyes Closed') : 'No Face Detected'}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: eyeContactScore >= 70 ? '#10b981' : eyeContactScore >= 40 ? '#f59e0b' : '#ef4444'
                      }}>
                        {eyeContactScore}%
                      </span>
                    </div>
                  )}
                  <Button className="w-full mt-4" onClick={() => handleSubmitAnswer()} disabled={loading || !answerText.trim()} style={loading ? { opacity: 0.7 } : {}}>
                    {loading ? <span className="flex items-center gap-2"><span className="loading-spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }} />Analyzing...</span> : 'Submit Answer'}
                  </Button>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 mt-4 border-t border-white/10 pt-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><FileText size={16}/> Instant Answer Breakdown</h3>
                  <div className="mb-3">
                    <span className="text-xs text-secondary">Keywords Detected</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {keywordsDetected.length > 0 ? keywordsDetected.map((kw, i) => (
                        <span key={i} className="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-300">{typeof kw === 'string' ? kw : kw.word || kw}</span>
                      )) : <span className="text-xs text-secondary">Analyzing...</span>}
                    </div>
                  </div>
                  <div className="mb-3">
                    <span className="text-xs text-secondary">Missing Concepts</span>
                    <ul className="text-xs text-yellow-400 mt-1 list-disc pl-4">
                      {missingConcepts.length > 0 ? missingConcepts.map((mc, i) => <li key={i}>{mc}</li>) : <li>None identified</li>}
                    </ul>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10 mt-4">
                    <p className="text-xs font-semibold text-emerald-400 mb-1">Suggested Improvement</p>
                    <p className="text-xs text-secondary leading-relaxed">{suggestedImprovement || 'Great answer! Keep it up.'}</p>
                  </div>
                  <div className="flex gap-3 mt-6">
                    {!noMoreQuestions && <Button className="flex-1" onClick={handleNextQuestion} disabled={loading}>{loading ? 'Loading...' : 'Next Question'}</Button>}
                    <Button className={noMoreQuestions ? 'flex-1' : ''} variant={noMoreQuestions ? 'primary' : 'danger'} onClick={handleEndInterview} disabled={loading} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                      {noMoreQuestions ? 'Finish & View Results' : 'End Interview'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Interview;
