import React, { useState, useEffect } from 'react';
import axiosInstance from 'axios';

export default function AdminDashboard() {
  // --- UI & Submission States ---
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // --- Data States ---
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [leaderboards, setLeaderboards] = useState([]);
  const [fetchingData, setFetchingData] = useState(true);

  // --- Form States: Create/Edit Quiz ---
  const [quizForm, setQuizForm] = useState({
    id: null, // set value if editing
    title: '',
    topic: 'Science',
    difficulty: 'Intermediate',
    imageUrl: '',
    questionsCount: 10
  });

  // --- Form States: Create/Edit Question ---
  const [questionForm, setQuestionForm] = useState({
    id: null, // set value if editing
    quizId: '',
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A',
    explanation: ''
  });

  // --- Filter states to navigate lists easily ---
  const [selectedQuizFilter, setSelectedQuizFilter] = useState('All');

  // --- Initial & Refresh Data Fetching ---
  const fetchData = async () => {
    try {
      setFetchingData(true);
      const [resQuizzes, resQuestions, resLeaderboards] = await Promise.all([
        axiosInstance.get('/api/quizzes').catch(() => axiosInstance.get('/api/quizs')),
        axiosInstance.get('/api/questions'),
        axiosInstance.get('/api/leaderboards')
      ]);
      setQuizzes(resQuizzes.data || []);
      setQuestions(resQuestions.data || []);
      setLeaderboards(resLeaderboards.data || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('System diagnostics failure. Failed to synchronize database matrices.');
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Quiz Actions (Create, Update, Delete) ---
  const handleQuizFormChange = (e) => {
    const { name, value } = e.target;
    setQuizForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    if (!quizForm.title || !quizForm.imageUrl) {
      setError('Telemetry validation mismatch. Title and Image URL are strictly required.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (quizForm.id) {
        // Edit existing
        await axiosInstance.put(`/api/quizs/${quizForm.id}`, {
          title: quizForm.title,
          topic: quizForm.topic,
          difficulty: quizForm.difficulty,
          imageUrl: quizForm.imageUrl,
          questionsCount: Number(quizForm.questionsCount)
        });
        setSuccessMessage(`Quiz "${quizForm.title}" successfully updated in active system memory.`);
      } else {
        // Create new
        await axiosInstance.post('/api/quizs', {
          title: quizForm.title,
          topic: quizForm.topic,
          difficulty: quizForm.difficulty,
          imageUrl: quizForm.imageUrl,
          questionsCount: Number(quizForm.questionsCount)
        });
        setSuccessMessage(`Quiz "${quizForm.title}" successfully loaded into Core DB as live target arena.`);
      }
      
      setSuccess(true);
      setQuizForm({
        id: null,
        title: '',
        topic: 'Science',
        difficulty: 'Intermediate',
        imageUrl: '',
        questionsCount: 10
      });
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while committing Quiz to database.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuizInit = (quiz) => {
    setQuizForm({
      id: quiz._id,
      title: quiz.title,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      imageUrl: quiz.imageUrl,
      questionsCount: quiz.questionsCount || 10
    });
    // Scroll to the quiz form safely
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('CRITICAL COMPROMISE DANGER: Deleting this quiz will orphan associated questions. Proceed?')) return;
    try {
      await axiosInstance.delete(`/api/quizs/${quizId}`);
      await fetchData();
    } catch (err) {
      setError('Database rejected deletion of protected quiz array.');
    }
  };

  // --- Question Actions (Create, Update, Delete) ---
  const handleQuestionFormChange = (e) => {
    const { name, value } = e.target;
    setQuestionForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    const { quizId, questionText, optionA, optionB, optionC, optionD, correctOption, explanation } = questionForm;
    
    if (!quizId || !questionText || !optionA || !optionB || !optionC || !optionD) {
      setError('Incomplete synapse parameters. All options and the query text must be filled.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    // Combine options into a single string formatted like a serialized JSON array
    const optionsArray = [
      { text: optionA, id: 'A' },
      { text: optionB, id: 'B' },
      { text: optionC, id: 'C' },
      { text: optionD, id: 'D' }
    ];
    const optionsString = JSON.stringify(optionsArray);

    try {
      if (questionForm.id) {
        // Edit existing question
        await axiosInstance.put(`/api/questions/${questionForm.id}`, {
          quizId,
          questionText,
          options: optionsString,
          correctOption,
          explanation
        });
        setSuccessMessage('Query Node successfully optimized and updated.');
      } else {
        // Create new question
        await axiosInstance.post('/api/questions', {
          quizId,
          questionText,
          options: optionsString,
          correctOption,
          explanation
        });
        setSuccessMessage('New Query Node successfully injected into target Quiz.');
      }

      setSuccess(true);
      // Reset question form except selected quizId to make adding sequential questions easier
      setQuestionForm({
        id: null,
        quizId: quizId,
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: 'A',
        explanation: ''
      });
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failure injecting new Question into data system.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestionInit = (q) => {
    let optA = '', optB = '', optC = '', optD = '';
    
    if (typeof q.options === 'string') {
      try {
        const parsed = JSON.parse(q.options);
        if (Array.isArray(parsed)) {
          optA = parsed.find(o => o.id === 'A')?.text || '';
          optB = parsed.find(o => o.id === 'B')?.text || '';
          optC = parsed.find(o => o.id === 'C')?.text || '';
          optD = parsed.find(o => o.id === 'D')?.text || '';
        } else {
          optA = q.options;
        }
      } catch (e) {
        optA = q.options;
      }
    } else if (Array.isArray(q.options)) {
      optA = q.options.find(o => o.id === 'A')?.text || '';
      optB = q.options.find(o => o.id === 'B')?.text || '';
      optC = q.options.find(o => o.id === 'C')?.text || '';
      optD = q.options.find(o => o.id === 'D')?.text || '';
    }

    setQuestionForm({
      id: q._id,
      quizId: q.quizId,
      questionText: q.questionText,
      optionA: optA,
      optionB: optB,
      optionC: optC,
      optionD: optD,
      correctOption: q.correctOption,
      explanation: q.explanation || ''
    });
    // Scroll to the question form safely
    const el = document.getElementById('question-generator-anchor');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Irreversibly delete this question node from the database?')) return;
    try {
      await axiosInstance.delete(`/api/questions/${id}`);
      await fetchData();
    } catch (err) {
      setError('Database rejected deletion of question node.');
    }
  };

  const handleResetLeaderboard = async () => {
    if (!window.confirm('WARNING: This will delete ALL logged scores and global rankings permanently. Execute wipe command?')) return;
    try {
      setLoading(true);
      // Delete all records via multiple calls or custom endpoint
      for (const item of leaderboards) {
        await axiosInstance.delete(`/api/leaderboards/${item._id}`);
      }
      setSuccessMessage('All arena historical scores wiped. Universal peace restored.');
      setSuccess(true);
      await fetchData();
    } catch (err) {
      setError('System malfunction during global leaderboard erasure.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get quiz title for visual matching
  const getQuizTitle = (quizId) => {
    const found = quizzes.find(q => q._id === quizId);
    return found ? found.title : 'Orphaned Quiz Link';
  };

  // Helper to parse dynamic option string safely
  const renderOptionsPreview = (optionsData) => {
    let parsed = [];
    if (typeof optionsData === 'string') {
      try {
        parsed = JSON.parse(optionsData);
      } catch (e) {
        // Fallback split
        parsed = optionsData.split(',').map((o, idx) => ({ id: String.fromCharCode(65 + idx), text: o.trim() }));
      }
    } else if (Array.isArray(optionsData)) {
      parsed = optionsData;
    }

    if (!Array.isArray(parsed)) {
      return <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>Raw Data: {String(optionsData)}</span>;
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '0.8rem', marginTop: '6px' }}>
        {parsed.map((o) => (
          <span key={o.id} style={{ color: 'var(--muted)', background: 'var(--surface)', padding: '2px 6px', borderRadius: '3px', border: '1px solid var(--border)' }}>
            <strong>{o.id}:</strong> {o.text}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="container" style={{ paddingBottom: '80px', paddingTop: '40px' }}>
      
      {/* 1. COMPACT PAGE HERO */}
      <section className="hero" style={{ padding: '40px 24px', borderRadius: '12px', border: '1px solid var(--border)', background: 'linear-gradient(135deg, var(--surface) 0%, rgba(19, 23, 28, 0.9) 100%)', marginBottom: '40px' }}>
        <span className="eyebrow" style={{ color: 'var(--secondary)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem' }}>
          🔒 SYSTEM CONTROL PROTOCOL
        </span>
        <h1 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 'clamp(2rem, 4vw, 3.5rem)', margin: '12px 0' }}>
          ADMIN <span className="gradient-text" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>COMMAND CENTER</span>
        </h1>
        <p className="hero-subtitle" style={{ color: 'var(--muted)', margin: 0, fontSize: '1.1rem' }}>
          Manage diagnostic arenas, calibrate high-velocity parameters, and inject intellectual neural matrices.
        </p>
      </section>

      {/* Inline Messaging Alerts */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '24px', background: 'rgba(255, 59, 48, 0.1)', border: '1px solid var(--accent)', padding: '16px', borderRadius: '6px', color: '#ff7c75' }}>
          <strong>⚠️ PROTOCOL BREACH:</strong> {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '24px', background: 'rgba(0, 255, 102, 0.1)', border: '1px solid var(--primary)', padding: '16px', borderRadius: '6px', color: 'var(--primary)' }}>
          <strong>✓ TELEMETRY LOADED:</strong> {successMessage}
          <button onClick={() => setSuccess(false)} className="btn btn-ghost" style={{ marginLeft: '12px', color: 'var(--text)', fontSize: '0.8rem', textDecoration: 'underline' }}>
            Dismiss
          </button>
        </div>
      )}

      {/* 2. SYSTEM STATUS TELEMETRY COUNTERS */}
      <section className="section" style={{ marginBottom: '40px' }}>
        <div className="grid grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div className="card" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '24px', borderRadius: '8px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Quizzes</span>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)', fontFamily: '"Space Grotesk", sans-serif' }}>
              {fetchingData ? '...' : quizzes.length}
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--muted)' }}>Live operational arenas</p>
          </div>
          <div className="card" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '24px', borderRadius: '8px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Query Nodes (Questions)</span>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--secondary)', fontFamily: '"Space Grotesk", sans-serif' }}>
              {fetchingData ? '...' : questions.length}
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--muted)' }}>High-caliber multiple-choice units</p>
          </div>
          <div className="card" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '24px', borderRadius: '8px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Records Logged</span>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text)', fontFamily: '"Space Grotesk", sans-serif' }}>
              {fetchingData ? '...' : leaderboards.length}
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--muted)' }}>Global high-scores recorded</p>
          </div>
          <div className="card" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '24px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <button 
              onClick={handleResetLeaderboard} 
              disabled={loading}
              className="btn" 
              style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '10px 16px', fontWeight: 600, width: '100%', cursor: 'pointer', borderRadius: '4px' }}
            >
              {loading ? 'Executing Wipe...' : '☠ WIPE LEADERBOARD'}
            </button>
            <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'center' }}>Irreversible core memory reset</p>
          </div>
        </div>
      </section>

      {/* 3. SECTION ONE: ARENA BUILDER & ACTIVE QUIZ TELEMETRY */}
      <section className="section" style={{ marginBottom: '60px' }}>
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '32px' }}>
          <span className="eyebrow" style={{ color: 'var(--primary)' }}>ENGINEERING LEVEL 01</span>
          <h2 style={{ fontFamily: '"Space Grotesk", sans-serif', margin: '4px 0' }}>Quiz Arena Configuration</h2>
          <p style={{ color: 'var(--muted)', margin: 0 }}>Establish the structural metadata grids for our trivia environments.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px', alignItems: 'start' }}>
          
          {/* Quiz Form Card */}
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--surface) 0%, rgba(19, 23, 28, 0.8) 100%)', border: '1px solid var(--border)', padding: '24px', borderRadius: '8px' }}>
            <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
              {quizForm.id ? '⚡ Opti-Calibrate Quiz' : '🎮 Deploy New Quiz'}
            </h3>
            
            <form onSubmit={handleSaveQuiz}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 600 }}>Quiz Title Name</label>
                <input 
                  type="text" 
                  name="title" 
                  value={quizForm.title} 
                  onChange={handleQuizFormChange}
                  placeholder="e.g., General Chemistry & Quantum Laws" 
                  style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 600 }}>Scientific Topic Sector</label>
                  <select 
                    name="topic" 
                    value={quizForm.topic} 
                    onChange={handleQuizFormChange}
                    style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)' }}
                  >
                    <option value="Science">Science Matrix</option>
                    <option value="History">Chronological History</option>
                    <option value="Pop Culture">Pop Culture Resonance</option>
                    <option value="General">General Cognitive</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 600 }}>Difficulty Rank</label>
                  <select 
                    name="difficulty" 
                    value={quizForm.difficulty} 
                    onChange={handleQuizFormChange}
                    style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)' }}
                  >
                    <option value="Novice">Novice Mind</option>
                    <option value="Intermediate">Intermediate Thinker</option>
                    <option value="Expert">Expert Catalyst</option>
                    <option value="Omniscient">Omniscient God</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 600 }}>Visual Background Image URL</label>
                <input 
                  type="url" 
                  name="imageUrl" 
                  value={quizForm.imageUrl} 
                  onChange={handleQuizFormChange}
                  placeholder="https://images.unsplash.com/photo-..." 
                  style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)' }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 600 }}>Default Questions Countdown Max</label>
                <input 
                  type="number" 
                  name="questionsCount" 
                  value={quizForm.questionsCount} 
                  onChange={handleQuizFormChange}
                  min="1" 
                  max="30"
                  style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-primary" 
                  style={{ 
                    flex: 1, 
                    background: 'var(--primary)', 
                    color: '#000', 
                    fontWeight: 700, 
                    border: 'none', 
                    padding: '12px', 
                    borderRadius: '2px', 
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(0, 255, 102, 0.35)'
                  }}
                >
                  {loading ? 'TRANSMITTING...' : quizForm.id ? 'OPTIMIZE CORE MATRIX' : 'ACTIVATE TARGET ARENA'}
                </button>
                {quizForm.id && (
                  <button 
                    type="button" 
                    onClick={() => setQuizForm({ id: null, title: '', topic: 'Science', difficulty: 'Intermediate', imageUrl: '', questionsCount: 10 })}
                    className="btn btn-ghost" 
                    style={{ border: '1px solid var(--border)', color: 'var(--text)', padding: '12px 16px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Quiz List Table */}
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--surface) 0%, rgba(19, 23, 28, 0.8) 100%)', border: '1px solid var(--border)', padding: '24px', borderRadius: '8px', overflowX: 'auto' }}>
            <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
              Operational Arenas Grid
            </h3>
            
            {fetchingData ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)' }}>Loading live arenas...</div>
            ) : quizzes.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)' }}>Zero active quizzes detected in local registry. Please deploy one.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 8px', color: 'var(--muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Arena Target</th>
                    <th style={{ padding: '12px 8px', color: 'var(--muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Topic Grid</th>
                    <th style={{ padding: '12px 8px', color: 'var(--muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Rank</th>
                    <th style={{ padding: '12px 8px', color: 'var(--muted)', fontSize: '0.8rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((q) => (
                    <tr key={q._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img src={q.imageUrl || "https://picsum.photos/seed/placeholder/100/100"} alt="" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
                          <span>{q.title}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span className="pill" style={{ fontSize: '0.75rem', background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '12px' }}>{q.topic}</span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>{q.difficulty}</span>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleEditQuizInit(q)} 
                          className="btn btn-ghost" 
                          style={{ color: 'var(--primary)', border: 'none', padding: '4px 8px', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          EDIT
                        </button>
                        <button 
                          onClick={() => handleDeleteQuiz(q._id)} 
                          className="btn btn-ghost" 
                          style={{ color: 'var(--accent)', border: 'none', padding: '4px 8px', cursor: 'pointer', fontSize: '0.8rem', marginLeft: '8px' }}
                        >
                          DELETE
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </section>

      {/* 4. SECTION TWO: REWRITING THE QUERY INVENTORY (QUESTIONS MANAGER) */}
      <section id="question-generator-anchor" className="section" style={{ marginBottom: '60px' }}>
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '32px' }}>
          <span className="eyebrow" style={{ color: 'var(--secondary)' }}>ENGINEERING LEVEL 02</span>
          <h2 style={{ fontFamily: '"Space Grotesk", sans-serif', margin: '4px 0' }}>Query Node Generator (Questions Pool)</h2>
          <p style={{ color: 'var(--muted)', margin: 0 }}>Inject rigorous intellectual questions, establish correct response options, and program explanation details.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '32px', alignItems: 'start' }}>
          
          {/* Question Creation/Edit Form */}
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--surface) 0%, rgba(19, 23, 28, 0.8) 100%)', border: '1px solid var(--border)', padding: '24px', borderRadius: '8px' }}>
            <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
              {questionForm.id ? '⚡ Modify Active Question Node' : '🧬 Inject Query Node'}
            </h3>

            <form onSubmit={handleSaveQuestion}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 600 }}>Target Quiz Domain</label>
                <select 
                  name="quizId" 
                  value={questionForm.quizId} 
                  onChange={handleQuestionFormChange}
                  style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)' }}
                >
                  <option value="">-- SELECT PARENT QUIZ MATRIX --</option>
                  {quizzes.map(q => (
                    <option key={q._id} value={q._id}>{q.title} ({q.topic})</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 600 }}>Query Question Statement</label>
                <textarea 
                  name="questionText" 
                  value={questionForm.questionText} 
                  onChange={handleQuestionFormChange}
                  placeholder="e.g., Which subatomic particle acts as the electromagnetic transmitter?" 
                  rows="3"
                  style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)', resize: 'vertical' }}
                />
              </div>

              {/* Multiple Choice Quad Options */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.8rem', marginBottom: '4px' }}>Option A</label>
                  <input 
                    type="text" 
                    name="optionA" 
                    value={questionForm.optionA} 
                    onChange={handleQuestionFormChange}
                    placeholder="e.g., Proton"
                    style={{ width: '100%', padding: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.8rem', marginBottom: '4px' }}>Option B</label>
                  <input 
                    type="text" 
                    name="optionB" 
                    value={questionForm.optionB} 
                    onChange={handleQuestionFormChange}
                    placeholder="e.g., Gluon"
                    style={{ width: '100%', padding: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.8rem', marginBottom: '4px' }}>Option C</label>
                  <input 
                    type="text" 
                    name="optionC" 
                    value={questionForm.optionC} 
                    onChange={handleQuestionFormChange}
                    placeholder="e.g., Photon"
                    style={{ width: '100%', padding: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.8rem', marginBottom: '4px' }}>Option D</label>
                  <input 
                    type="text" 
                    name="optionD" 
                    value={questionForm.optionD} 
                    onChange={handleQuestionFormChange}
                    placeholder="e.g., Neutrino"
                    style={{ width: '100%', padding: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 600 }}>Correct Answer Target</label>
                  <select 
                    name="correctOption" 
                    value={questionForm.correctOption} 
                    onChange={handleQuestionFormChange}
                    style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)' }}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 600 }}>Response Explanation (Post-Fail Data)</label>
                  <input 
                    type="text" 
                    name="explanation" 
                    value={questionForm.explanation} 
                    onChange={handleQuestionFormChange}
                    placeholder="The photon transmits electromagnetism..." 
                    style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-secondary" 
                  style={{ 
                    flex: 1, 
                    background: 'var(--secondary)', 
                    color: '#000', 
                    fontWeight: 700, 
                    border: 'none', 
                    padding: '12px', 
                    borderRadius: '2px', 
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)'
                  }}
                >
                  {loading ? 'COMMIT TRANSMISSION...' : questionForm.id ? 'UPDATE QUESTION NODE' : 'INJECT SYNAPSE UNIT'}
                </button>
                {questionForm.id && (
                  <button 
                    type="button" 
                    onClick={() => setQuestionForm({ id: null, quizId: '', questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', explanation: '' })}
                    className="btn btn-ghost" 
                    style={{ border: '1px solid var(--border)', color: 'var(--text)', padding: '12px 16px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Questions Pool list */}
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--surface) 0%, rgba(19, 23, 28, 0.8) 100%)', border: '1px solid var(--border)', padding: '24px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', margin: 0 }}>
                Query Node Registry
              </h3>
              
              {/* Simple filter selector */}
              <select 
                value={selectedQuizFilter} 
                onChange={(e) => setSelectedQuizFilter(e.target.value)}
                style={{ padding: '6px 12px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px' }}
              >
                <option value="All">All Quizzes</option>
                {quizzes.map(q => (
                  <option key={q._id} value={q._id}>{q.title}</option>
                ))}
              </select>
            </div>

            {fetchingData ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)' }}>Retrieving active query nodes...</div>
            ) : questions.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)' }}>Zero question nodes have been cataloged in current registry database.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '550px', overflowY: 'auto', paddingRight: '4px' }}>
                {questions
                  .filter(q => selectedQuizFilter === 'All' || q.quizId === selectedQuizFilter)
                  .map((q, idx) => (
                    <div key={q._id} style={{ border: '1px solid var(--border)', background: 'var(--surface-2)', padding: '16px', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--secondary)', letterSpacing: '1px' }}>
                          [{idx + 1}] {getQuizTitle(q.quizId)}
                        </span>
                        <div>
                          <button 
                            onClick={() => handleEditQuestionInit(q)} 
                            className="btn btn-ghost" 
                            style={{ color: 'var(--primary)', border: 'none', padding: '2px 6px', cursor: 'pointer', fontSize: '0.75rem' }}
                          >
                            EDIT
                          </button>
                          <button 
                            onClick={() => handleDeleteQuestion(q._id)} 
                            className="btn btn-ghost" 
                            style={{ color: 'var(--accent)', border: 'none', padding: '2px 6px', cursor: 'pointer', fontSize: '0.75rem', marginLeft: '6px' }}
                          >
                            DELETE
                          </button>
                        </div>
                      </div>

                      <p style={{ margin: '0 0 8px 0', fontWeight: 600, fontSize: '0.95rem' }}>{q.questionText}</p>
                      
                      {renderOptionsPreview(q.options)}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '8px', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--primary)' }}>
                          <strong>CORRECT PATH:</strong> Option {q.correctOption}
                        </span>
                        {q.explanation && (
                          <span style={{ color: 'var(--muted)', fontStyle: 'italic', maxWidth: '65%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {q.explanation}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 5. SECTION THREE: PLATFORM DIAGNOSTICS LOG */}
      <section className="section" style={{ borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
          <span className="eyebrow" style={{ color: 'var(--accent)' }}>ENGINEERING LEVEL 03</span>
          <h2 style={{ fontFamily: '"Space Grotesk", sans-serif', margin: 0 }}>System Telemetry & Activity Log</h2>
          <p style={{ color: 'var(--muted)', margin: 0 }}>Review real-time competitive action and performance logs captured during active trivia protocols.</p>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, var(--surface) 0%, rgba(19, 23, 28, 0.8) 100%)', border: '1px solid var(--border)', padding: '24px', borderRadius: '8px' }}>
          {fetchingData ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)' }}>Awaiting diagnostics link...</div>
          ) : leaderboards.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)', fontStyle: 'italic' }}>Zero session diagnostics received. Complete active challenges to display server traces.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 8px', color: 'var(--muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Time Marker</th>
                    <th style={{ padding: '12px 8px', color: 'var(--muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Competitive Identity</th>
                    <th style={{ padding: '12px 8px', color: 'var(--muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Target Challenge</th>
                    <th style={{ padding: '12px 8px', color: 'var(--muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Precision Score</th>
                    <th style={{ padding: '12px 8px', color: 'var(--muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Latency Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboards.slice(0, 15).map((log, index) => (
                    <tr key={log._id || index} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '12px 8px', fontSize: '0.85rem', color: 'var(--muted)' }}>
                        {log.date ? new Date(log.date).toLocaleString() : 'Live Trace'}
                      </td>
                      <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--secondary)' }}>
                        {log.username}
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--text)' }}>
                        {log.quizTitle}
                      </td>
                      <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--primary)' }}>
                        {log.score?.toLocaleString()} pts
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--muted)' }}>
                        {log.timeSpent ? `${log.timeSpent}s` : 'Unknown'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}