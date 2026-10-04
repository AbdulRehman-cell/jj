import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Home() {
  const [quizzes, setQuizzes] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Newsletter signup form state
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [quizzesRes, leaderboardRes] = await Promise.all([
          axios.get('/api/quizzes').catch(() => axios.get('/api/quizs')),
          axios.get('/api/leaderboards')
        ]);
        setQuizzes(quizzesRes.data || []);
        // Get top 5 sorted by score descending
        const sortedLeaderboard = (leaderboardRes.data || [])
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);
        setLeaderboard(sortedLeaderboard);
      } catch (err) {
        console.error('Error fetching initial data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide a valid diagnostic transmission address (email).');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      // Simulate API lag for high-fidelity feel
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSuccess(true);
      setEmail('');
      setUsername('');
    } catch (err) {
      setError('Connection interrupted. System failed to register neural link.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="home-page-flow">
      {/* SECTION 1: HERO (Mesh Network BG via styled global classes) */}
      <section className="hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <img 
          className="hero-bg" 
          src="https://picsum.photos/seed/esportstage99/1600/900" 
          alt="Esports tournament main stage with neon glows" 
          style={{ opacity: 0.18, mixBlendMode: 'luminosity' }}
        />
        <div className="container">
          <span className="eyebrow">COGNITIVE PROTOCOL INITIATED</span>
          <h1>
            OUTRUN THE CLOCK. <br />
            OUTSMART THE <span className="gradient-text">REST.</span>
          </h1>
          <p className="hero-subtitle">
            An elite, rapid-fire trivia arena engineered for competitive minds who crave intellectual speed, instant feedback, and clean, high-velocity arcade aesthetics. 15 seconds. 10 questions. Zero room for hesitation.
          </p>
          <div className="hero-actions">
            <Link to="/quizzes" className="btn btn-primary" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
              ⚡ Initiate Synapse Test
            </Link>
            <a href="#how-it-works" className="btn btn-secondary" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
              Review Protocol
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 2: LIVE ARENA METRICS (Ticker / Stat Block) */}
      <section className="section" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '24px 0' }}>
        <div className="container">
          <div className="stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-value" style={{ color: 'var(--primary)', fontFamily: '"Space Grotesk", sans-serif', fontSize: '2.5rem', fontWeight: 700 }}>8,432</div>
              <div className="stat-label" style={{ color: 'var(--muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Brains Online</div>
            </div>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-value" style={{ color: 'var(--secondary)', fontFamily: '"Space Grotesk", sans-serif', fontSize: '2.5rem', fontWeight: 700 }}>1.2M+</div>
              <div className="stat-label" style={{ color: 'var(--muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Answers Served Today</div>
            </div>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-value" style={{ color: 'var(--accent)', fontFamily: '"Space Grotesk", sans-serif', fontSize: '2.5rem', fontWeight: 700 }}>98,200</div>
              <div className="stat-label" style={{ color: 'var(--muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Peak Daily Score Record</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE TOPIC MATRIX (Featured Quizzes Grid) */}
      <section className="section">
        <div className="container">
          <div className="section-head" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="eyebrow">ARENA SELECTOR</span>
            <h2>Select Your <span className="gradient-text">Discipline</span></h2>
            <p>Choose your diagnostic vector. Each digital battleground is locked at 10 high-caliber questions under extreme temporal tension.</p>
          </div>

          {loading ? (
            <div className="grid grid-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="card skeleton skeleton-card" style={{ height: '340px' }}></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-3">
              {quizzes.slice(0, 6).map((quiz) => (
                <div key={quiz._id} className="card" style={{
                  background: 'linear-gradient(135deg, var(--surface) 0%, rgba(19, 23, 28, 0.8) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  position: 'relative'
                }}>
                  <div>
                    <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                      <img 
                        src={quiz.imageUrl || `https://picsum.photos/seed/${quiz._id || 'quiz'}/600/400`} 
                        alt={quiz.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span className="pill" style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(12, 15, 18, 0.85)',
                        borderColor: 'var(--border)',
                        color: quiz.difficulty === 'Hard' || quiz.difficulty === 'Expert' ? 'var(--accent)' : 'var(--primary)'
                      }}>
                        {quiz.difficulty || 'Standard'}
                      </span>
                    </div>
                    
                    <div style={{ padding: '24px' }}>
                      <span style={{ color: 'var(--secondary)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
                        {quiz.topic || 'General Intelligence'}
                      </span>
                      <h3 style={{ marginTop: '8px', marginBottom: '12px', fontFamily: '"Space Grotesk", sans-serif' }}>
                        {quiz.title}
                      </h3>
                      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                        Test your speed across {quiz.questionsCount || 10} complex query nodes.
                      </p>
                    </div>
                  </div>

                  <div style={{ padding: '0 24px 24px 24px' }}>
                    <Link to={`/play/${quiz._id}`} className="btn btn-primary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>
                      ⚡ Access Node
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/quizzes" className="btn btn-secondary">
              View All Diagnostic Arenas
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 4: OPERATIONAL PROTOCOL (How It Works with custom step-row and video embed) */}
      <section id="how-it-works" className="section" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-head" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="eyebrow">HOW THE SYSTEM COMPUTES</span>
            <h2>The Arcade <span className="gradient-text">Protocol</span></h2>
            <p>Your performance vector relies on two key inputs: extreme velocity and factual accuracy. Hesitation yields zero.</p>
          </div>

          <div className="step-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', marginBottom: '60px' }}>
            <div className="step" style={{ background: 'var(--surface-2)', padding: '32px', borderLeft: '4px solid var(--primary)', position: 'relative' }}>
              <span className="step-num" style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '3rem', color: 'rgba(255, 255, 255, 0.05)', position: 'absolute', top: '10px', right: '20px', fontWeight: 700 }}>01</span>
              <h3 style={{ color: 'var(--text)', marginBottom: '12px' }}>Lock Topic Matrix</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>Select your intellectual battleground. Science, History, Tech, or Pop Culture telemetry nodes.</p>
            </div>

            <div className="step" style={{ background: 'var(--surface-2)', padding: '32px', borderLeft: '4px solid var(--secondary)', position: 'relative' }}>
              <span className="step-num" style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '3rem', color: 'rgba(255, 255, 255, 0.05)', position: 'absolute', top: '10px', right: '20px', fontWeight: 700 }}>02</span>
              <h3 style={{ color: 'var(--text)', marginBottom: '12px' }}>Beat the Countdown</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>A rapid 15-second timer counts down. The quicker you decide on the correct node, the higher your velocity multiplier.</p>
            </div>

            <div className="step" style={{ background: 'var(--surface-2)', padding: '32px', borderLeft: '4px solid var(--accent)', position: 'relative' }}>
              <span className="step-num" style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '3rem', color: 'rgba(255, 255, 255, 0.05)', position: 'absolute', top: '10px', right: '20px', fontWeight: 700 }}>03</span>
              <h3 style={{ color: 'var(--text)', marginBottom: '12px' }}>Secure Apex Standing</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>Submit your scores to the global telemetry board. Cement your name alongside the most agile minds on Earth.</p>
            </div>
          </div>

          <div className="video-section" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="section-head" style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span className="eyebrow">SYSTEM DEMO</span>
              <h3>Watch Arena Operations</h3>
            </div>
            <div className="video-embed" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <iframe 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                title="BrainSnap Gameplay Demo"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: THE WALL OF LEGENDS (Leaderboard Preview & Esport Focus Image) */}
      <section className="section">
        <div className="container">
          <div className="feature-split" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
            <div>
              <span className="eyebrow">THE APEX THINKERS</span>
              <h2>Global Leaderboard <span className="gradient-text">Top-Tier</span></h2>
              <p style={{ marginBottom: '32px', color: 'var(--muted)' }}>
                These minds have unlocked supreme neural accuracy combined with lightning response latencies. Are you prepared to knock them off the podium?
              </p>

              <div className="leaderboard-mini-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {leaderboard.length === 0 ? (
                  <div style={{ color: 'var(--muted)', fontStyle: 'italic', padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    No global data registered yet. Be the first to secure top spot!
                  </div>
                ) : (
                  leaderboard.map((user, idx) => (
                    <div key={user._id || idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'var(--surface-2)',
                      borderLeft: idx === 0 ? '3px solid var(--primary)' : '3px solid var(--border)',
                      borderRadius: '2px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, color: idx === 0 ? 'var(--primary)' : 'var(--muted)', width: '20px' }}>
                          #{idx + 1}
                        </span>
                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{user.username}</span>
                        <span className="pill" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>{user.quizTitle || 'Arena'}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ color: 'var(--secondary)', fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700 }}>{user.score} pts</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{user.timeSpent}s latency</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ marginTop: '24px' }}>
                <Link to="/leaderboard" className="btn btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
                  📊 View Full Leaderboard Telemetry
                </Link>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <img 
                src="https://picsum.photos/seed/keyboardglow/600/600" 
                alt="Glowing mechanical keyboard gaming setup close-up" 
                style={{ width: '100%', borderRadius: '4px', border: '1px solid var(--border)', display: 'block' }}
              />
              <div style={{
                position: 'absolute',
                bottom: '-20px',
                right: '-20px',
                background: 'rgba(12, 15, 18, 0.95)',
                border: '1px solid var(--secondary)',
                padding: '20px',
                borderRadius: '2px',
                display: 'none' // Hidden on narrow viewports but loaded via media queries / global styles
              }} className="reveal-badge">
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>SYSTEM RESPONSE RATE</span>
                <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--secondary)' }}>&lt; 0.18s Latency</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: TESTIMONIALS (Neural Overdrive Feedback) */}
      <section className="section" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-head" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="eyebrow">FIELD REVIEWS</span>
            <h2>Endorsed by <span className="gradient-text">Elite Thinkers</span></h2>
            <p>From university researchers to competitive gamers, users are calibrating their critical speeds.</p>
          </div>

          <div className="grid grid-3">
            <div className="testimonial-card" style={{ background: 'var(--surface-2)', padding: '32px', border: '1px solid var(--border)', borderRadius: '2px' }}>
              <p style={{ color: 'var(--text)', fontStyle: 'italic', marginBottom: '24px', fontSize: '0.95rem', lineHeight: '1.6' }}>
                "BrainSnap is pure adrenaline. The 15-second countdown triggers an incredible flow state. It's the only trivia tool that truly tests cognitive processing speed under pressure."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="https://i.pravatar.cc/300?img=11" alt="Dr. Evelyn Vance" className="avatar avatar-md" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>Dr. Evelyn Vance</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Cognitive Scientist</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card" style={{ background: 'var(--surface-2)', padding: '32px', border: '1px solid var(--border)', borderRadius: '2px' }}>
              <p style={{ color: 'var(--text)', fontStyle: 'italic', marginBottom: '24px', fontSize: '0.95rem', lineHeight: '1.6' }}>
                "The interface layout is exceptional. The timing mechanics and leaderboard push me to shave milliseconds off my answers. Truly an arcade masterpiece."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="https://i.pravatar.cc/300?img=12" alt="Marcus 'Hex' Vance" className="avatar avatar-md" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>Marcus "Hex" Thorne</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Pro Esports Competitor</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card" style={{ background: 'var(--surface-2)', padding: '32px', border: '1px solid var(--border)', borderRadius: '2px' }}>
              <p style={{ color: 'var(--text)', fontStyle: 'italic', marginBottom: '24px', fontSize: '0.95rem', lineHeight: '1.6' }}>
                "I use this to warm up my brain before coding sessions. The Science & Cosmos matrices are beautifully curated. It's brutal, fast, and incredibly rewarding."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="https://i.pravatar.cc/300?img=13" alt="Serena K." className="avatar avatar-md" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>Serena Kobayashi</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Software Architect</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: INTERACTIVE SYNAPSE REGISTRATION (Subscription/Contact Lead Form) */}
      <section className="section" style={{ position: 'relative' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <div className="card" style={{
            background: 'linear-gradient(135deg, var(--surface) 0%, rgba(19, 23, 28, 0.95) 100%)',
            border: '1px solid var(--secondary)',
            padding: '48px 32px',
            borderRadius: '2px',
            textAlign: 'center'
          }}>
            <span className="eyebrow" style={{ color: 'var(--secondary)' }}>NEURAL BROADCAST LINK</span>
            <h2 style={{ marginBottom: '16px' }}>Join the Elite <span className="gradient-text">Ranks</span></h2>
            <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>
              Get weekly updates on new topic matrix injections, tournament seasons, and elite scoring tips directly from high-velocity champions.
            </p>

            {success ? (
              <div className="alert alert-success" style={{ padding: '24px', textAlign: 'center' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '8px' }}>✓ NEURAL LINK ACTIVE!</h3>
                <p style={{ color: 'var(--text)', margin: 0 }}>You have successfully subscribed to BrainSnap telemetry updates. Prepare for diagnostic alerts.</p>
                <button className="btn btn-ghost" style={{ marginTop: '16px' }} onClick={() => setSuccess(false)}>
                  Register another interface
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text)', marginBottom: '8px', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 600 }}>Command Username (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. CyberThinker_9" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      borderRadius: '2px',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--text)', marginBottom: '8px', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 600 }}>Transmission Address (Email)</label>
                  <input 
                    type="email" 
                    required
                    placeholder="operator@neuralnet.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      borderRadius: '2px',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                {error && (
                  <div className="alert alert-error" style={{ color: 'var(--accent)', fontSize: '0.9rem', marginTop: '8px' }}>
                    ⚠️ {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={submitting}
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '16px',
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginTop: '12px'
                  }}
                >
                  {submitting ? 'Calibrating Neural Link...' : 'Establish Connection Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* RICH BRAND FOOTER */}
      <footer style={{ background: '#07090b', padding: '60px 0 30px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
            <div>
              <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ color: 'var(--primary)' }}>⚡</span>
                <span>BRAIN<span style={{ color: 'var(--secondary)' }}>SNAP</span></span>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                An elite high-velocity cognitive diagnostic system. Speed is the variable; accuracy is the constant. Built for intellectual arcade enthusiasts globally.
              </p>
            </div>

            <div>
              <h4 style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--text)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>SYSTEM DIRECTORY</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><Link to="/" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Command Center (Home)</Link></li>
                <li><Link to="/quizzes" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Topic Matrices (Quizzes)</Link></li>
                <li><Link to="/leaderboard" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Global Telemetry (Leaderboards)</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--text)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>OPERATIONAL DISCIPLIINES</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Cosmos & Quantum Physics</li>
                <li style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Global History & Civilizations</li>
                <li style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Pop Culture & Digital Lore</li>
                <li style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Advanced Web Technologies</li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--text)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>SYSTEM STATS</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Engine Status</span>
                  <span style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>Nominal</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Core Latency</span>
                  <span style={{ color: 'var(--secondary)', fontSize: '0.85rem', fontWeight: 600 }}>12ms</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Build Version</span>
                  <span style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600 }}>v3.1.2-Arcade</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', textAlign: 'center', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <p style={{ color: 'var(--muted)', fontSize: '0.8rem', margin: 0 }}>
              &copy; {new Date().getFullYear()} BrainSnap Inc. Outrun the clock. Outsmart the rest. All intellectual telemetry reserved.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem', cursor: 'pointer' }}>Terms of Protocol</span>
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem', cursor: 'pointer' }}>Telemetry Privacy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}