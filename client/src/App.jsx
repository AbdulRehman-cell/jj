import React from 'react';
import { Routes, Route, NavLink, Link } from 'react-router-dom';
import Home from './pages/Home';
import Quizzes from './pages/Quizzes';
import PlayQuiz from './pages/PlayQuiz';
import AdminDashboard from './pages/AdminDashboard';
import LeaderboardPage from './pages/LeaderboardPage';

export default function App() {
  return (
    <div className="app-container">
      {/* Dynamic Mesh Network background effect via inline styles to match motif #1 exactly */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -2,
          backgroundColor: '#0C0F12',
          overflow: 'hidden'
        }}
      />
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle at 15% 15%, rgba(0, 255, 102, 0.12) 0%, transparent 45%), radial-gradient(circle at 85% 85%, rgba(0, 240, 255, 0.12) 0%, transparent 45%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Sticky Header Navigation with translucent backdrop */}
      <header className="header" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(12, 15, 18, 0.82)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px'
        }}>
          <Link to="/" className="brand" style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: '1.5rem',
            fontWeight: 700,
            textDecoration: 'none',
            color: 'var(--text)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              padding: '4px 10px',
              borderRadius: '4px',
              color: '#000',
              fontWeight: 700,
              fontSize: '1.25rem',
              letterSpacing: '1px'
            }}>⚡</span>
            <span>BRAIN<span style={{ color: 'var(--secondary)' }}>SNAP</span></span>
          </Link>

          <nav className="nav" style={{
            display: 'flex',
            gap: '24px',
            alignItems: 'center'
          }}>
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? "active" : ""}
              style={({ isActive }) => ({
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontWeight: 500,
                textDecoration: 'none',
                color: isActive ? 'var(--primary)' : 'var(--muted)',
                transition: 'color 0.2s ease',
                fontSize: '0.95rem'
              })}
            >
              Command Center
            </NavLink>
            <NavLink 
              to="/quizzes" 
              className={({ isActive }) => isActive ? "active" : ""}
              style={({ isActive }) => ({
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontWeight: 500,
                textDecoration: 'none',
                color: isActive ? 'var(--primary)' : 'var(--muted)',
                transition: 'color 0.2s ease',
                fontSize: '0.95rem'
              })}
            >
              The Matrix
            </NavLink>
            <NavLink 
              to="/leaderboard" 
              className={({ isActive }) => isActive ? "active" : ""}
              style={({ isActive }) => ({
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontWeight: 500,
                textDecoration: 'none',
                color: isActive ? 'var(--primary)' : 'var(--muted)',
                transition: 'color 0.2s ease',
                fontSize: '0.95rem'
              })}
            >
              Wall of Legends
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Main Viewport Grid */}
      <main className="main-content" style={{ minHeight: 'calc(100vh - 160px)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/play/:quizId" element={<PlayQuiz />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Routes>
      </main>

      {/* Footer Block */}
      <footer className="footer" style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        padding: '48px 0',
        marginTop: '80px'
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px'
          }}>
            <div>
              <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--text)', marginBottom: '8px' }}>
                BRAIN<span style={{ color: 'var(--primary)' }}>SNAP</span>
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', maxWidth: '360px' }}>
                Outrun the clock. Outsmart the rest. The premier arena for high-velocity, precision trivia.
              </p>
            </div>
            
            <div className="footer-links" style={{
              display: 'flex',
              gap: '24px'
            }}>
              <Link to="/quizzes" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem' }}>All Arenas</Link>
              <Link to="/leaderboard" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Leaderboard</Link>
            </div>
          </div>
          
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            marginTop: '32px',
            paddingTop: '24px',
            textAlign: 'center',
            color: 'var(--muted)',
            fontSize: '0.85rem'
          }}>
            <p>© {new Date().getFullYear()} BrainSnap Arena. Systems Operational // Neural Circuits Primed.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}