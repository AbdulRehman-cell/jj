import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
    fetchQuizzes();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/leaderboards');
      // Sort descending by score, then ascending by timeSpent
      const sorted = (response.data || []).sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.timeSpent - b.timeSpent;
      });
      setLeaderboardData(sorted);
      setError('');
    } catch (err) {
      console.error('Error fetching leaderboard data:', err);
      setError('Could not establish connection to the leaderboards matrix.');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get('/api/quizzes').catch(() => axios.get('/api/quizs'));
      setQuizzes(response.data || []);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    }
  };

  // Filter rankings by selected quiz
  const filteredRankings = selectedQuiz === 'All' 
    ? leaderboardData 
    : leaderboardData.filter(item => item.quizTitle === selectedQuiz);

  // Stats calculation
  const totalMinds = leaderboardData.length;
  const maxScore = leaderboardData.length > 0 ? Math.max(...leaderboardData.map(d => d.score)) : 0;
  const avgSpeed = leaderboardData.length > 0 
    ? (leaderboardData.reduce((acc, curr) => acc + curr.timeSpent, 0) / leaderboardData.length).toFixed(1) 
    : '0.0';

  return (
    <div className="container" style={{ paddingBottom: '80px', color: 'var(--text)' }}>
      {/* Hero Section */}
      <section className="hero" style={{ padding: '60px 0 40px', position: 'relative' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <span className="eyebrow" style={{ color: 'var(--secondary)', letterSpacing: '2px', fontWeight: 700 }}>
            GLOBAL CHAMPIONSHIPS
          </span>
          <h1 style={{ marginTop: '12px', textTransform: 'uppercase' }}>
            The Wall of <span className="gradient-text" style={{ color: 'var(--primary)' }}>Legends</span>
          </h1>
          <p className="hero-subtitle" style={{ maxWidth: '640px', margin: '16px 0 0', color: 'var(--muted)' }}>
            Real-time diagnostics of the highest performing neural pathways on BrainSnap. Absolute accuracy. Maximum velocity.
          </p>
        </div>
      </section>

      {/* Grid of Real-time Telemetry Stats Cards */}
      <section className="section" style={{ padding: '24px 0' }}>
        <div className="grid grid-3">
          <div className="card" style={{ padding: '24px', border: '1px solid var(--border)' }}>
            <span className="eyebrow" style={{ color: 'var(--muted)' }}>STATION METRIC</span>
            <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)', marginTop: '8px' }}>
              {totalMinds}
            </div>
            <div className="stat-label" style={{ color: 'var(--text)', marginTop: '4px' }}>Active Brains Tracked</div>
          </div>

          <div className="card" style={{ padding: '24px', border: '1px solid var(--border)' }}>
            <span className="eyebrow" style={{ color: 'var(--muted)' }}>PEAK VOLTAGE</span>
            <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--secondary)', marginTop: '8px' }}>
              {maxScore.toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--muted)' }}>pts</span>
            </div>
            <div className="stat-label" style={{ color: 'var(--text)', marginTop: '4px' }}>Current Hall of Fame High</div>
          </div>

          <div className="card" style={{ padding: '24px', border: '1px solid var(--border)' }}>
            <span className="eyebrow" style={{ color: 'var(--muted)' }}>RESPONSE VELOCITY</span>
            <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent)', marginTop: '8px' }}>
              {avgSpeed} <span style={{ fontSize: '1rem', color: 'var(--muted)' }}>sec</span>
            </div>
            <div className="stat-label" style={{ color: 'var(--text)', marginTop: '4px' }}>Average Completion Speed</div>
          </div>
        </div>
      </section>

      {/* Main Leaderboard Rankings Grid & Filter */}
      <section className="section" style={{ padding: '32px 0' }}>
        <div className="section-head" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.85rem' }}>Apex Cognitive Records</h2>
          <p style={{ color: 'var(--muted)', marginTop: '8px' }}>
            Filter by arena to inspect domain champions or target global standings.
          </p>
        </div>

        {/* Filter Chips Bar */}
        <div className="filter-bar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
          <button 
            className={`btn ${selectedQuiz === 'All' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setSelectedQuiz('All')}
            style={{ borderRadius: '2px', padding: '8px 16px' }}
          >
            All Arenas
          </button>
          {quizzes.map((q) => (
            <button
              key={q._id}
              className={`btn ${selectedQuiz === q.title ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setSelectedQuiz(q.title)}
              style={{ borderRadius: '2px', padding: '8px 16px' }}
            >
              {q.title}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="skeleton-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="skeleton skeleton-text" style={{ height: '50px', width: '100%', borderRadius: '4px' }}></div>
            <div className="skeleton skeleton-text" style={{ height: '50px', width: '100%', borderRadius: '4px' }}></div>
            <div className="skeleton skeleton-text" style={{ height: '50px', width: '100%', borderRadius: '4px' }}></div>
          </div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : filteredRankings.length === 0 ? (
          <div className="card" style={{ padding: '48px', textAlign: 'center', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--muted)' }}>No Neural Transmission Records Registered Yet</h3>
            <p style={{ marginTop: '8px', color: 'var(--muted)' }}>Be the first to secure a spot in this intelligence vector!</p>
            <div style={{ marginTop: '24px' }}>
              <Link to="/quizzes" className="btn btn-primary" style={{ borderRadius: '2px' }}>
                Launch Test Core
              </Link>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: '8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                  <th style={{ padding: '16px' }}>Rank</th>
                  <th style={{ padding: '16px' }}>Cognitive Signature</th>
                  <th style={{ padding: '16px' }}>Arena Grid</th>
                  <th style={{ padding: '16px' }}>Velocity Time</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>Telemetry Score</th>
                </tr>
              </thead>
              <tbody>
                {filteredRankings.map((player, idx) => {
                  const isTop3 = idx < 3;
                  const medalColor = idx === 0 ? 'var(--primary)' : idx === 1 ? 'var(--secondary)' : '#FFB000';
                  return (
                    <tr 
                      key={player._id || idx} 
                      style={{ 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                        background: isTop3 ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      <td style={{ padding: '16px', fontWeight: 700 }}>
                        {isTop3 ? (
                          <span style={{ 
                            color: medalColor, 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            width: '28px', 
                            height: '28px', 
                            borderRadius: '50%', 
                            border: `2px solid ${medalColor}`,
                            fontSize: '0.9rem'
                          }}>
                            {idx + 1}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--muted)', paddingLeft: '8px' }}>{idx + 1}</span>
                        )}
                      </td>
                      <td style={{ padding: '16px', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '1.25rem' }}>🧠</span>
                          <span>{player.username || 'Anonymous Agent'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--muted)' }}>
                        {player.quizTitle}
                      </td>
                      <td style={{ padding: '16px', fontFamily: '"Space Grotesk", sans-serif' }}>
                        {player.timeSpent || '0'}s
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: 'var(--primary)', fontFamily: '"Space Grotesk", sans-serif' }}>
                        {(player.score || 0).toLocaleString()} <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 400 }}>PTS</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* CTA Footer Section */}
      <div className="cta-section" style={{ marginTop: '48px', padding: '48px', border: '1px solid var(--border)', background: 'linear-gradient(135deg, var(--surface) 0%, rgba(19, 23, 28, 0.4) 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px' }}>
          <span className="eyebrow" style={{ color: 'var(--secondary)' }}>CHALLENGE DETECTED</span>
          <h2 style={{ fontSize: '2rem', marginTop: '12px', textTransform: 'uppercase' }}>Think you have what it takes?</h2>
          <p style={{ color: 'var(--muted)', marginTop: '12px', marginBottom: '24px' }}>
            Jump into the active live quiz arena immediately and broadcast your intellectual score directly onto the wall of legends!
          </p>
          <Link to="/quizzes" className="btn btn-primary" style={{ display: 'inline-block', borderRadius: '2px' }}>
            Enter Arena Now ⚡
          </Link>
        </div>
      </div>
    </div>
  );
}