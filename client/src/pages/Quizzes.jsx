import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/quizzes').catch(() => axios.get('/api/quizs'));
      // Handle the plural fallback or empty responses gracefully
      setQuizzes(response.data || []);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Telemetry link broken. Unable to fetch active quiz arenas.');
    } finally {
      setLoading(false);
    }
  };

  // Extract unique topics for filter tabs dynamically
  const topicsList = ['All', ...new Set(quizzes.map(q => q.topic).filter(Boolean))];

  // Filtered quizzes list
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          quiz.topic?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = selectedTopic === 'All' || quiz.topic === selectedTopic;
    const matchesDifficulty = selectedDifficulty === 'All' || quiz.difficulty === selectedDifficulty;
    return matchesSearch && matchesTopic && matchesDifficulty;
  });

  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      {/* 1. COMPACT PAGE HERO */}
      <section className="hero" style={{ 
        padding: '60px 0 40px 0', 
        minHeight: 'auto', 
        display: 'block',
        position: 'relative',
        marginBottom: '40px'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <span className="eyebrow" style={{ color: 'var(--secondary)', letterSpacing: '2px' }}>
            COGNITIVE DIAGNOSTIC GRID
          </span>
          <h1 style={{ margin: '12px 0', fontFamily: '"Space Grotesk", sans-serif' }}>
            CHOOSE YOUR <span className="gradient-text" style={{ 
              background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>ARENA</span>
          </h1>
          <p className="hero-subtitle" style={{ color: 'var(--muted)', maxWidth: '600px', margin: '0' }}>
            Select from our high-velocity vectors of intelligence. Lock in your category, outrun the countdown, and secure the ultimate rating.
          </p>
        </div>
      </section>

      {/* 2. FILTER & SEARCH CONTROL SYSTEM (Section 1) */}
      <section className="section" style={{ padding: '0 0 32px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="filter-bar" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          background: 'var(--surface)',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid var(--border)',
        }}>
          {/* Search bar input */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', width: '100%' }}>
            <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Search neural matrix / keyword..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  color: 'var(--text)',
                  fontSize: '0.95rem',
                  fontFamily: '"Plus Jakarta Sans", sans-serif'
                }}
              />
            </div>

            {/* Difficulty Dropdown Selector */}
            <div style={{ minWidth: '180px' }}>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  color: 'var(--text)',
                  fontSize: '0.95rem',
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  cursor: 'pointer'
                }}
              >
                <option value="All">All Difficulties</option>
                <option value="Novice">Novice</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
                <option value="Cerebral">Cerebral</option>
              </select>
            </div>
          </div>

          {/* Dynamic Topic Chips */}
          <div>
            <span style={{ 
              display: 'block', 
              fontSize: '0.8rem', 
              color: 'var(--muted)', 
              fontWeight: 700, 
              letterSpacing: '1px', 
              marginBottom: '12px',
              textTransform: 'uppercase'
            }}>
              Filter by Subject Matrix:
            </span>
            <div className="filters" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {topicsList.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`filter-btn ${selectedTopic === topic ? 'active' : ''}`}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '20px',
                    background: selectedTopic === topic ? 'var(--primary)' : 'var(--surface-2)',
                    color: selectedTopic === topic ? '#000' : 'var(--text)',
                    border: '1px solid',
                    borderColor: selectedTopic === topic ? 'var(--primary)' : 'var(--border)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: '"Space Grotesk", sans-serif'
                  }}
                >
                  {topic === 'All' ? '⚡ Show All' : topic}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. DYNAMIC ARENA CATALOG GRID (Section 2) */}
      <section className="section" style={{ padding: '40px 0' }}>
        <div className="section-head" style={{ marginBottom: '32px' }}>
          <span className="eyebrow" style={{ color: 'var(--primary)' }}>LIVE CHANNELS</span>
          <h2 style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Operational Testing Arenas</h2>
          <p style={{ color: 'var(--muted)', fontSize: '1rem' }}>
            Select any target query set below. Clock locks at 15s per question.
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '24px' }}>
            ⚡ {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-3" style={{ display: 'grid', gap: '24px' }}>
            {[1, 2, 3].map((n) => (
              <div key={n} className="card skeleton skeleton-card" style={{ height: '320px' }}>
                <div className="skeleton skeleton-text" style={{ height: '140px', marginBottom: '16px' }} />
                <div className="skeleton skeleton-text" style={{ width: '60%', marginBottom: '10px' }} />
                <div className="skeleton skeleton-text" style={{ width: '40%' }} />
              </div>
            ))}
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 24px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--muted)'
          }}>
            <h3 style={{ color: 'var(--text)', marginBottom: '8px', fontFamily: '"Space Grotesk", sans-serif' }}>
              Zero Nodes Detected
            </h3>
            <p style={{ marginBottom: '20px' }}>
              No active arenas match your exact query filter. Try calibrating your search terms.
            </p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedTopic('All'); setSelectedDifficulty('All'); }}
              className="btn btn-secondary"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-3" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '24px' 
          }}>
            {filteredQuizzes.map((quiz) => {
              // Extract unique image placeholder seed from title
              const imageSeed = quiz.title ? encodeURIComponent(quiz.title.substring(0, 5)) : 'quiz';
              const imageUrl = quiz.imageUrl || `https://picsum.photos/seed/${imageSeed}/600/400`;

              return (
                <div 
                  key={quiz._id} 
                  className="card"
                  style={{
                    background: 'linear-gradient(135deg, var(--surface) 0%, rgba(19, 23, 28, 0.8) 100%)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), border-color 0.3s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.borderColor = 'var(--secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  <div>
                    {/* Header Image */}
                    <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                      <img 
                        src={imageUrl} 
                        alt={quiz.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = 'https://picsum.photos/seed/defaultquiz/600/400';
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(12, 15, 18, 0.85)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: 'var(--secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>
                        {quiz.topic || 'General'}
                      </div>

                      <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        background: 'rgba(255, 59, 48, 0.15)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid var(--accent)',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: 'var(--text)',
                        textTransform: 'uppercase'
                      }}>
                        {quiz.difficulty || 'Intermediate'}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div style={{ padding: '24px' }}>
                      <h3 style={{ 
                        fontFamily: '"Space Grotesk", sans-serif', 
                        color: 'var(--text)', 
                        marginBottom: '10px',
                        fontSize: '1.25rem',
                        lineHeight: '1.3'
                      }}>
                        {quiz.title}
                      </h3>
                      <p style={{ 
                        color: 'var(--muted)', 
                        fontSize: '0.9rem', 
                        lineHeight: '1.5',
                        marginBottom: '20px'
                      }}>
                        Analyze and decode {quiz.questionsCount || 10} targeted queries. Zero margins for cognitive latency.
                      </p>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div style={{ 
                    padding: '0 24px 24px 24px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                    paddingTop: '20px'
                  }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>
                      📋 {quiz.questionsCount || 10} Questions
                    </span>
                    <Link 
                      to={`/play/${quiz._id}`} 
                      className="btn btn-primary"
                      style={{
                        padding: '10px 18px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        borderRadius: '2px',
                        letterSpacing: '0.5px',
                        boxShadow: '0 0 15px rgba(0, 255, 102, 0.25)',
                        textDecoration: 'none'
                      }}
                    >
                      ⚡ Start Test
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. PERFORMANCE HIGHLIGHTS & RULES DECK (Section 3) */}
      <section className="section" style={{ 
        padding: '60px 40px', 
        background: 'var(--surface-2)', 
        borderRadius: '12px',
        border: '1px solid var(--border)',
        marginTop: '20px'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '32px' 
        }}>
          <div>
            <span className="eyebrow" style={{ color: 'var(--secondary)' }}>OPERATIONAL INSTRUCTIONS</span>
            <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '1.5rem', marginTop: '8px', color: 'var(--text)' }}>
              How Scoring is Formulated
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: '1.6', marginTop: '12px' }}>
              BrainSnap runs a hyper-precise calculations ledger. You start with 1,000 baseline points for every correct response. A dynamic multiplier processes your speed: for every fraction of a second remaining on the timer, additional telemetry points are injected into your live stack. Hesitation will lock your output at baseline.
            </p>
          </div>

          <div>
            <h4 style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--primary)', marginBottom: '12px', fontSize: '1.1rem' }}>
              ⚡ High-Voltage Timing Rules
            </h4>
            <ul style={{ 
              listStyleType: 'none', 
              paddingLeft: 0, 
              margin: 0, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              fontSize: '0.9rem',
              color: 'var(--text)'
            }}>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--secondary)' }}>■</span>
                <span><strong>15s Ticking Clock:</strong> Every question auto-advances. Missing the clock registers 0 points instantly.</span>
              </li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--secondary)' }}>■</span>
                <span><strong>Strict Single Transmission:</strong> Once an answer node is selected, choice is committed immediately.</span>
              </li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--secondary)' }}>■</span>
                <span><strong>Streak Escalation:</strong> Consecutive answers amplify overall speed metrics.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}