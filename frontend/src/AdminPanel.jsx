import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newHabit, setNewHabit] = useState({ user_id: '', title: '', description: '', color: '#ffd166', icon: '✅' });

  const navigate = useNavigate();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await fetch('http://localhost:3001/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);

          // If not admin, redirect to habits page
          if (data.role !== 'admin') {
            navigate('/habits');
            return;
          }

          // load admin data
          await Promise.all([loadUsers(), loadHabits()]);
        } else {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } catch (err) {
        console.error('Failed to fetch /me:', err);
        setError('Failed to load user info');
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const loadUsers = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        console.error('Failed to load users');
      }
    } catch (err) {
      console.error('Error loading users', err);
    }
  };

  const loadHabits = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/admin/habits', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHabits(data);
      } else {
        console.error('Failed to load habits');
      }
    } catch (err) {
      console.error('Error loading habits', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const deleteHabit = async (id) => {
    if (!confirm('Delete this habit?')) return;
    try {
      const res = await fetch(`http://localhost:3001/api/admin/habits/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setHabits((s) => s.filter((h) => h.id !== id));
      } else {
        setError('Failed to delete habit');
      }
    } catch (err) {
      console.error('Error deleting habit', err);
      setError('Failed to delete habit');
    }
  };

  const createHabit = async (e) => {
    e.preventDefault();
    setError('');
    if (!newHabit.user_id || !newHabit.title) {
      setError('user_id and title required');
      return;
    }
    try {
      const res = await fetch('http://localhost:3001/api/admin/habits', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newHabit),
      });
      if (res.ok) {
        const created = await res.json();
        setHabits((s) => [created, ...s]);
        setNewHabit({ user_id: '', title: '', description: '', color: '#ffd166', icon: '✅' });
      } else {
        const t = await res.text();
        setError(t || 'Failed to create habit');
      }
    } catch (err) {
      console.error('Error creating habit (admin)', err);
      setError('Failed to create habit');
    }
  };

  const updateHabit = async (id) => {
    const title = prompt('New title (leave empty to keep)', '');
    if (title === null) return;
    try {
      const res = await fetch(`http://localhost:3001/api/admin/habits/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title || undefined }),
      });
      if (res.ok) {
        const updated = await res.json();
        setHabits((s) => s.map((h) => (h.id === id ? updated : h)));
      } else {
        setError('Failed to update habit');
      }
    } catch (err) {
      console.error('Error updating habit (admin)', err);
      setError('Failed to update habit');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-hero">
        <div className="admin-hero-content">
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">Manage your platform with ease</p>
        </div>
      </div>

      <div className="admin-content">
        {error && <div className="error-message">{error}</div>}

        {user ? (
          <>
            <div className="admin-welcome-card">
              <div className="welcome-icon">👋</div>
              <div className="welcome-text">
                <h2>Welcome back, <span className="username-highlight">{user.email}</span>!</h2>
                <p>Role: <strong>{user.role}</strong></p>
              </div>
              <button onClick={handleLogout} className="logout-button">Sign Out</button>
            </div>

            <div className="admin-sections">
              <section className="admin-section">
                <div className="section-header-admin">
                  <h2>User Management</h2>
                  <p>List of registered users</p>
                </div>
                <div className="users-list">
                  {users.length === 0 ? (
                    <p>No users found.</p>
                  ) : (
                    users.map(u => (
                      <div key={u.id} className="user-row">
                        <div>{u.email}</div>
                        <div>{u.role}</div>
                        <div>{new Date(u.created_at).toLocaleString()}</div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="admin-section">
                <div className="section-header-admin">
                  <h2>Habits (admin)</h2>
                  <p>Manage all habits across users</p>
                </div>

                <form className="habit-admin-form" onSubmit={createHabit}>
                  <div className="form-row">
                    <select
                      value={newHabit.user_id}
                      onChange={(e) => setNewHabit({ ...newHabit, user_id: e.target.value })}
                    >
                      <option value="">Select user</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.email}</option>
                      ))}
                    </select>
                    <input
                      placeholder="Title"
                      value={newHabit.title}
                      onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
                    />
                    <input
                      placeholder="Icon"
                      value={newHabit.icon}
                      onChange={(e) => setNewHabit({ ...newHabit, icon: e.target.value })}
                      style={{ width: '120px' }}
                    />
                    <input
                      type="color"
                      value={newHabit.color}
                      onChange={(e) => setNewHabit({ ...newHabit, color: e.target.value })}
                    />
                  </div>
                  <div className="form-row">
                    <input
                      placeholder="Description"
                      value={newHabit.description}
                      onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div className="form-row">
                    <button className="button primary" type="submit">Create Habit for User</button>
                  </div>
                </form>

                <div className="habits-list-admin">
                  {habits.length === 0 ? (
                    <p>No habits found.</p>
                  ) : (
                    habits.map(h => (
                      <div key={h.id} className="habit-card-admin">
                        <div>
                          <strong>{h.title}</strong> — <small>{h.owner_email}</small>
                          <div className="muted">{h.description}</div>
                        </div>
                        <div className="habit-actions">
                          <button onClick={() => updateHabit(h.id)} className="button small">Edit</button>
                          <button onClick={() => deleteHabit(h.id)} className="button danger small">Delete</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </>
        ) : (
          <div className="loading-container">
            <p>Loading your dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;