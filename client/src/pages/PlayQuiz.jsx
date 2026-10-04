import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function PlayQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  // Screen State: 'lobby' | 'countdown' | 'playing' | 'results'
  const [gameState, setGameState] = useState('lobby');
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerConfirmed, setIsAnswerConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [lobbyCountdown, setLobbyCountdown] = useState(3);
  
  // Diagnostics Tracking
  const [startTime, setStartTime] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]); // [{ questionText, chosen, correct, correctOption, isCorrect, explanation }]
  
  // Form submission states for saving leaderboard score
  const [username, setUsername] = useState('');
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // General Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const timerRef = useRef(null);
  const lobbyTimerRef = useRef(null);

  // Fetch Quiz & Questions on Mount
  useEffect(() => {
    async function fetchQuizData() {
      try {
        setLoading(true);
        const quizRes = await axios.get(`/api/quizs/${quizId}`);
        setQuiz(quizRes.data);

        const questionsRes = await axios.get(`/api/questions?quizId=${quizId}`);
        // Ensure we have questions. If none returned, fallback to seed mock templates dynamically
        if (questionsRes.data && questionsRes.data.length > 0) {
          setQuestions(questionsRes.data);
        } else {
          // Robust fallback mock data for clean UX testing
          const mockQuestions = [
            {
              _id: 'mock1',
              questionText: 'Which elementary particle acts as the gauge boson for the electromagnetic interaction?',
              options: 'Photon,Gluon,Higgs Boson,W Boson',
              correctOption: 'Photon',
              explanation: 'The photon is the gauge boson responsible for mediating the electromagnetic force.'
            },
            {
              _id: 'mock2',
              questionText: 'What represents the absolute maximum velocity of information transmission in standard physics?',
              options: 'Speed of Light in Vacuum,Speed of Sound,Quantum Entanglement Velocity,Infinite Speed',
              correctOption: 'Speed of Light in Vacuum',
              explanation: 'According to special relativity, c is the universal speed limit for energy and information transmission.'
            },
            {
              _id: 'mock3',
              questionText: 'Which planet possesses the highest average surface temperatures in our solar system?',
              options: 'Mercury,Venus,Mars,Jupiter',
              correctOption: 'Venus',
              explanation: 'Due to an intense runaway greenhouse effect, Venus has surface temperatures exceeding 460 degrees Celsius.'
            },
            {
              _id: 'mock4',
              questionText: 'What is the theoretical temperature limit at which all classical thermodynamic motion ceases?',
              options: 'Absolute Zero,Plancks Temperature,Hawking Threshold,Kelvin Maximum',
              correctOption: 'Absolute Zero',
              explanation: 'Absolute zero (0 Kelvin or -273.15 degrees Celsius) is the lower limit of thermodynamic temperature.'
            },
            {
              _id: 'mock5',
              questionText: 'Which active subatomic particle configuration determines the chemical element type?',
              options: 'Proton Count,Neutron Configuration,Electron Spin,Quark Density',
              correctOption: 'Proton Count',
              explanation: 'The number of protons in the atomic nucleus defines the chemical properties and identity of an element.'
            }
          ];
          setQuestions(mockQuestions);
        }
        setError('');
      } catch (err) {
        console.error('Error loading quiz arena:', err);
        setError('Failed to download tactical quiz metrics. Please verify node connectivity.');
      } finally {
        setLoading(false);
      }
    }
    fetchQuizData();
  }, [quizId]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (lobbyTimerRef.current) clearInterval(lobbyTimerRef.current);
    };
  }, []);

  // Lobby pre-game countdown triggers play start
  const handleStartQuiz = () => {
    setGameState('countdown');
    setLobbyCountdown(3);
    setScore(0);
    setCorrectCount(0);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setStartTime(Date.now());
    
    lobbyTimerRef.current = setInterval(() => {
      setLobbyCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(lobbyTimerRef.current);
          setGameState('playing');
          startQuestionTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 15-second individual question timer
  const startQuestionTimer = () => {
    setTimeLeft(15);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // Auto-confirm as empty/incorrect answer on zero seconds
          handleAutoTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAutoTimeOut = () => {
    if (isAnswerConfirmed) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    // Record missing telemetry
    setUserAnswers(prev => [...prev, {
      questionText: currentQuestion.questionText,
      chosen: 'TIME EXPIRED',
      correct: currentQuestion.correctOption,
      isCorrect: false,
      explanation: currentQuestion.explanation || 'Hesitation is the enemy of score acquisition.'
    }]);

    setIsAnswerConfirmed(true);
    setSelectedOption('TIME EXPIRED');
  };

  const handleSelectOption = (optionText) => {
    if (isAnswerConfirmed) return;
    setSelectedOption(optionText);
  };

  const handleConfirmAnswer = () => {
    if (!selectedOption || isAnswerConfirmed) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setIsAnswerConfirmed(true);

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correctOption;

    // High-velocity scoring formula: 1000 base + (seconds left * 75 multiplier)
    let pointsAwarded = 0;
    if (isCorrect) {
      pointsAwarded = 1000 + (timeLeft * 75);
      setScore(prev => prev + pointsAwarded);
      setCorrectCount(prev => prev + 1);
    }

    setUserAnswers(prev => [...prev, {
      questionText: currentQuestion.questionText,
      chosen: selectedOption,
      correct: currentQuestion.correctOption,
      isCorrect: isCorrect,
      explanation: currentQuestion.explanation || 'Synaptic assessment complete.'
    }]);
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswerConfirmed(false);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      startQuestionTimer();
    } else {
      // Completed all questions
      if (timerRef.current) clearInterval(timerRef.current);
      setGameState('results');
    }
  };

  // Submit Leaderboard entry
  const handleSubmitLeaderboard = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setSubmitError('Username designation is required.');
      return;
    }

    setIsSubmittingScore(true);
    setSubmitError('');

    try {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      await axios.post('/api/leaderboards', {
        username: username.trim(),
        quizTitle: quiz?.title || 'Quantum Cosmos',
        score: score,
        timeSpent: timeSpent
      });
      setScoreSubmitted(true);
    } catch (err) {
      console.error('Error submitting score telemetry:', err);
      setSubmitError('Submission uplink interrupted. Please try again.');
    } finally {
      setIsSubmittingScore(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div className="skeleton skeleton-card" style={{ height: '300px', marginBottom: '24px' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '60%', margin: '0 auto 12px' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '40%', margin: '0 auto' }}></div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          <strong>System Failure:</strong> {error || 'Tactical Arena Node Not Found'}
        </div>
        <Link to="/quizzes" className="btn btn-primary">Return to Catalog Hub</Link>
      </div>
    );
  }

  // Parse questions options
  const getCurrentOptions = () => {
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return [];
    if (Array.isArray(currentQ.options)) return currentQ.options;
    if (typeof currentQ.options === 'string') {
      return currentQ.options.split(',').map(o => o.trim());
    }
    return [];
  };

  return (
    <div className="play-quiz-page">
      {/* Dynamic Tiny Page Header */}
      <section className="hero" style={{ padding: '40px 0', minHeight: 'auto', background: 'none' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="eyebrow" style={{ color: 'var(--secondary)' }}>LIVE ARENA NODE ACTIVATED</span>
          <h1 style={{ margin: '8px 0' }}>{quiz.title}</h1>
          <p className="hero-subtitle" style={{ fontSize: '1.1rem', color: 'var(--muted)', maxWidth: '650px', margin: '0 auto' }}>
            {quiz.description || 'Outsmart the clock. Deliver precision telemetry responses under extreme pressure.'}
          </p>
        </div>
      </section>

      {/* -------------------- 1. LOBBY STATE -------------------- */}
      {gameState === 'lobby' && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card" style={{
              background: 'linear-gradient(135deg, var(--surface) 0%, rgba(19, 23, 28, 0.8) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              padding: '40px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>⚡</div>
              <h2 style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--text)' }}>
                THE <span className="gradient-text">TACTICAL PROTOCOL</span> IS LOCKED
              </h2>
              
              <div className="stats" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                margin: '32px 0',
                padding: '16px',
                background: 'var(--surface-2)',
                borderRadius: '6px',
                border: '1px solid var(--border)'
              }}>
                <div>
                  <div className="stat-value" style={{ color: 'var(--primary)', fontSize: '1.8rem', fontWeight: 700 }}>{questions.length}</div>
                  <div className="stat-label" style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Query Nodes</div>
                </div>
                <div>
                  <div className="stat-value" style={{ color: 'var(--secondary)', fontSize: '1.8rem', fontWeight: 700 }}>15s</div>
                  <div className="stat-label" style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Time Limit / Q</div>
                </div>
                <div>
                  <div className="stat-value" style={{ color: 'var(--accent)', fontSize: '1.8rem', fontWeight: 700 }}>{quiz.difficulty || 'Expert'}</div>
                  <div className="stat-label" style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Difficulty</div>
                </div>
              </div>

              <div style={{ textAlign: 'left', margin: '24px 0', fontSize: '0.95rem', color: 'var(--muted)', lineHeight: '1.6' }}>
                <p style={{ marginBottom: '12px', fontWeight: 600, color: 'var(--text)' }}>👉 Tactical System Instructions:</p>
                <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li>You have exactly <strong>15 seconds</strong> per query.</li>
                  <li>Answering quickly triggers a progressive speed multiplier bonus of up to 1,125 extra points.</li>
                  <li>Incorrect inputs or time-outs earn <strong>0 points</strong>.</li>
                  <li>Click "Confirm Transmission" to finalize your choice before the timer expires.</li>
                </ul>
              </div>

              <button 
                onClick={handleStartQuiz}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '18px',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  borderRadius: '2px',
                  background: 'var(--primary)',
                  color: '#000',
                  boxShadow: '0 0 20px rgba(0, 255, 102, 0.45)',
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                Initiate Synapse Test
              </button>
            </div>
          </div>
        </section>
      )}

      {/* -------------------- 2. PRE-GAME COUNTDOWN STATE -------------------- */}
      {gameState === 'countdown' && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 240, 255, 0.2) 0%, transparent 70%)',
              border: '2px solid var(--secondary)',
              boxShadow: '0 0 30px rgba(0, 240, 255, 0.3)',
              marginBottom: '32px'
            }}>
              <span style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: '5rem',
                fontWeight: 700,
                color: 'var(--secondary)'
              }}>{lobbyCountdown}</span>
            </div>
            <h2 style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--text)', fontSize: '2rem' }}>
              RE-CALIBRATING SYNAPTIC PATHWAYS
            </h2>
            <p style={{ color: 'var(--muted)' }}>Ready your mechanical trigger inputs...</p>
          </div>
        </section>
      )}

      {/* -------------------- 3. ACTIVE PLAYING STATE -------------------- */}
      {gameState === 'playing' && questions.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
            
            {/* Telemetry HUD */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              padding: '12px 24px',
              background: 'var(--surface)',
              borderRadius: '4px',
              border: '1px solid var(--border)'
            }}>
              <span style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--muted)', fontSize: '0.9rem' }}>
                QUERY <span style={{ color: 'var(--secondary)', fontWeight: 700 }}>{currentQuestionIndex + 1} OF {questions.length}</span>
              </span>
              <span style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--primary)', fontWeight: 700, fontSize: '1.2rem' }}>
                SCORE: {score.toLocaleString()} PTS
              </span>
            </div>

            {/* Countdown Core & Timer Display */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              marginBottom: '32px'
            }}>
              {/* Circular SVG Countdown (Motif #5) */}
              <div style={{ position: 'relative', width: '90px', height: '90px', marginBottom: '12px' }}>
                <svg width="90" height="90" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="45"
                    cy="45"
                    r="38"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <circle
                    cx="45"
                    cy="45"
                    r="38"
                    stroke={timeLeft <= 4 ? 'var(--accent)' : 'var(--secondary)'}
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray="238.76"
                    strokeDashoffset={238.76 - (238.76 * timeLeft) / 15}
                    style={{
                      transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease',
                      filter: timeLeft <= 4 ? 'drop-shadow(0 0 8px rgba(255, 59, 48, 0.6))' : 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.4))'
                    }}
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  color: timeLeft <= 4 ? 'var(--accent)' : 'var(--text)'
                }}>
                  {timeLeft}s
                </div>
              </div>
              <span style={{
                fontSize: '0.85rem',
                color: timeLeft <= 4 ? 'var(--accent)' : 'var(--muted)',
                fontWeight: 600,
                letterSpacing: '1px'
              }}>
                {timeLeft <= 4 ? 'CRITICAL TIME LIMIT' : 'TRANSMISSION WINDOW ACTIVE'}
              </span>
            </div>

            {/* Query Presentation Box */}
            <div className="card" style={{
              background: 'linear-gradient(135deg, var(--surface) 0%, rgba(19, 23, 28, 0.8) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              padding: '40px',
              borderRadius: '8px',
              marginBottom: '24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
              <h2 style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: '1.6rem',
                lineHeight: '1.4',
                color: 'var(--text)',
                margin: 0,
                textAlign: 'center'
              }}>
                "{questions[currentQuestionIndex]?.questionText}"
              </h2>
            </div>

            {/* Decisional Quad (Multiple Choice Grid) */}
            <div className="grid grid-2" style={{ gap: '16px', marginBottom: '32px' }}>
              {getCurrentOptions().map((opt, i) => {
                const isSelected = selectedOption === opt;
                let btnBorder = '1px solid rgba(255, 255, 255, 0.05)';
                let btnBg = 'var(--surface)';
                let labelPrefix = String.fromCharCode(65 + i); // A, B, C, D

                if (isSelected) {
                  btnBorder = '2px solid var(--secondary)';
                  btnBg = 'var(--surface-2)';
                }

                if (isAnswerConfirmed) {
                  const correctAns = questions[currentQuestionIndex]?.correctOption;
                  if (opt === correctAns) {
                    btnBorder = '2px solid var(--primary)';
                    btnBg = 'rgba(0, 255, 102, 0.1)';
                  } else if (isSelected) {
                    btnBorder = '2px solid var(--accent)';
                    btnBg = 'rgba(255, 59, 48, 0.1)';
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(opt)}
                    disabled={isAnswerConfirmed}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '20px 24px',
                      background: btnBg,
                      border: btnBorder,
                      borderRadius: '4px',
                      cursor: isAnswerConfirmed ? 'default' : 'pointer',
                      textAlign: 'left',
                      color: 'var(--text)',
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      fontSize: '1.05rem',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      width: '100%'
                    }}
                  >
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '4px',
                      background: isSelected ? 'var(--secondary)' : 'var(--surface-2)',
                      color: isSelected ? '#000' : 'var(--muted)',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      border: '1px solid var(--border)'
                    }}>
                      {labelPrefix}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Response Validation & Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              {!isAnswerConfirmed ? (
                <button
                  onClick={handleConfirmAnswer}
                  disabled={!selectedOption}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    borderRadius: '2px',
                    background: selectedOption ? 'var(--primary)' : 'var(--muted)',
                    color: '#000',
                    cursor: selectedOption ? 'pointer' : 'not-allowed',
                    border: 'none',
                    opacity: selectedOption ? 1 : 0.6,
                    boxShadow: selectedOption ? '0 0 20px rgba(0, 255, 102, 0.35)' : 'none'
                  }}
                >
                  Confirm Transmission
                </button>
              ) : (
                <div style={{ width: '100%' }}>
                  {/* Inline Explanation */}
                  <div style={{
                    background: 'var(--surface)',
                    borderLeft: `4px solid ${
                      userAnswers[currentQuestionIndex]?.isCorrect ? 'var(--primary)' : 'var(--accent)'
                    }`,
                    padding: '16px 20px',
                    borderRadius: '0 4px 4px 0',
                    marginBottom: '20px',
                    fontSize: '0.95rem',
                    color: 'var(--muted)'
                  }}>
                    <strong style={{ color: 'var(--text)', display: 'block', marginBottom: '4px' }}>
                      {userAnswers[currentQuestionIndex]?.isCorrect ? '✓ TRANSMISSION SUCCESSFUL' : '✗ SYSTEM DISCREPANCY'}
                    </strong>
                    {questions[currentQuestionIndex]?.explanation || 'No auxiliary explanation provided.'}
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    className="btn btn-secondary"
                    style={{
                      width: '100%',
                      padding: '16px',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      border: 'none'
                    }}
                  >
                    {currentQuestionIndex + 1 === questions.length ? 'Calculate Diagnostics' : 'Advance to Next Query Node'}
                  </button>
                </div>
              )}
            </div>

          </div>
        </section>
      )}

      {/* -------------------- 4. RESULTS & DIAGNOSTICS STATE -------------------- */}
      {gameState === 'results' && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            
            {/* Diagnostic Header */}
            <div className="cta-section" style={{
              background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(0, 255, 102, 0.05) 100%)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center',
              marginBottom: '32px'
            }}>
              <span className="eyebrow" style={{ color: 'var(--primary)' }}>EVALUATION COMPLETE</span>
              <h1 style={{ margin: '12px 0 24px', fontSize: '3rem' }}>
                <span className="gradient-text">ELITE STATUS</span> CERTIFIED
              </h1>

              {/* Main Score & Stats Row */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '40px',
                margin: '24px 0'
              }}>
                <div>
                  <div style={{ fontSize: '3.5rem', fontWeight: 700, color: 'var(--primary)', fontFamily: '"Space Grotesk", sans-serif' }}>
                    {score.toLocaleString()}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Final Score Obtained
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '3.5rem', fontWeight: 700, color: 'var(--secondary)', fontFamily: '"Space Grotesk", sans-serif' }}>
                    {correctCount} / {questions.length}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Precision Metric
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '3.5rem', fontWeight: 700, color: 'var(--text)', fontFamily: '"Space Grotesk", sans-serif' }}>
                    {Math.round(((Date.now() - startTime) / 1000))}s
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Elapsed Latency
                  </div>
                </div>
              </div>
            </div>

            {/* Score Submission Form */}
            {!scoreSubmitted ? (
              <div className="card" style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                padding: '32px',
                borderRadius: '8px',
                marginBottom: '40px'
              }}>
                <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--text)', marginBottom: '12px' }}>
                  Secure Your Coordinates on the Leaderboard
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '20px' }}>
                  Transmit your diagnostic run to the global competitive board. Make your mark.
                </p>

                <form onSubmit={handleSubmitLeaderboard} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem' }}>Tactical Username / Callsign</label>
                    <input
                      type="text"
                      placeholder="e.g., NEURAL_KNIGHT"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      style={{
                        padding: '14px',
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                        borderRadius: '4px',
                        fontFamily: 'inherit',
                        fontSize: '1rem'
                      }}
                      required
                    />
                  </div>

                  {submitError && (
                    <div className="alert alert-error" style={{ padding: '12px' }}>{submitError}</div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingScore}
                    className="btn btn-primary"
                    style={{
                      padding: '14px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      cursor: 'pointer'
                    }}
                  >
                    {isSubmittingScore ? 'Transmitting Data...' : 'Commit Run to Leaderboard'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="alert alert-success" style={{ marginBottom: '40px', padding: '24px', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#000' }}>✓ TRANSMISSION RECORDED</h3>
                <p style={{ margin: 0, color: '#000', opacity: 0.85 }}>
                  Your performance parameters are successfully saved on the global database matrix.
                </p>
              </div>
            )}

            {/* Chronological Review of Questions */}
            <h2 style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--text)', marginBottom: '24px' }}>
              Chronological Performance Audit
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
              {userAnswers.map((ans, idx) => (
                <div key={idx} className="card" style={{
                  background: 'linear-gradient(135deg, var(--surface) 0%, rgba(19, 23, 28, 0.8) 100%)',
                  border: `1px solid ${ans.isCorrect ? 'rgba(0, 255, 102, 0.15)' : 'rgba(255, 59, 48, 0.15)'}`,
                  padding: '24px',
                  borderRadius: '6px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <span style={{
                      background: ans.isCorrect ? 'rgba(0, 255, 102, 0.15)' : 'rgba(255, 59, 48, 0.15)',
                      color: ans.isCorrect ? 'var(--primary)' : 'var(--accent)',
                      padding: '4px 12px',
                      borderRadius: '2px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      {ans.isCorrect ? 'SUCCESS' : 'FAILED'}
                    </span>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Query Node {idx + 1}</span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', margin: '16px 0 12px 0', color: 'var(--text)' }}>
                    {ans.questionText}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.95rem' }}>
                    <div>
                      <span style={{ color: 'var(--muted)' }}>Your Response: </span>
                      <strong style={{ color: ans.isCorrect ? 'var(--primary)' : 'var(--accent)' }}>{ans.chosen}</strong>
                    </div>
                    {!ans.isCorrect && (
                      <div>
                        <span style={{ color: 'var(--muted)' }}>Correct Designation: </span>
                        <strong style={{ color: 'var(--primary)' }}>{ans.correct}</strong>
                      </div>
                    )}
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px', color: 'var(--muted)', fontSize: '0.9rem' }}>
                      <strong>Audit Log:</strong> {ans.explanation}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Hub */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              justifyContent: 'center',
              padding: '40px 0',
              borderTop: '1px solid var(--border)'
            }}>
              <button 
                onClick={handleStartQuiz} 
                className="btn btn-primary"
                style={{ minWidth: '200px' }}
              >
                Re-enter this Grid
              </button>
              <Link 
                to="/quizzes" 
                className="btn btn-secondary"
                style={{ minWidth: '200px', textAlign: 'center' }}
              >
                Choose New Discipline
              </Link>
              <Link 
                to="/leaderboard" 
                className="btn btn-ghost"
                style={{ minWidth: '200px', textAlign: 'center', color: 'var(--secondary)' }}
              >
                Inspect Global Rankings
              </Link>
            </div>

          </div>
        </section>
      )}

    </div>
  );
}