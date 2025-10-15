import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newHabit, setNewHabit] = useState({ user_id: '', title: '', description: '', color: '#ffd166', icon: '✅' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const availableIcons = ['✅', '💪', '📚', '🏃', '🧘', '💧', '🎯', '⭐', '🔥', '💡'];
  const availableColors = ['#667eea', '#fa709a', '#43e97b', '#ffd166', '#4facfe', '#a8edea', '#fed6e3', '#c471f5'];

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

          if (data.role !== 'admin') {
            navigate('/habits');
            return;
          }

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

  const startEdit = (habit) => {
    setEditingId(habit.id);
    setEditForm({
      title: habit.title,
      description: habit.description || '',
      icon: habit.icon || '✅',
      color: habit.color || '#ffd166'
    });
    setDeletingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/api/admin/habits/${id}`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setHabits((s) => s.map((h) => (h.id === id ? updated : h)));
        setEditingId(null);
        setEditForm({});
      } else {
        setError('Failed to update habit');
      }
    } catch (err) {
      console.error('Error updating habit (admin)', err);
      setError('Failed to update habit');
    }
  };

  const startDelete = (id) => {
    setDeletingId(id);
    setEditingId(null);
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  const confirmDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/api/admin/habits/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setHabits((s) => s.filter((h) => h.id !== id));
        setDeletingId(null);
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
                    <div className="form-icon-picker">
                      <label>Icon</label>
                      <div className="form-icon-grid">
                        {availableIcons.map(icon => (
                          <button
                            key={icon}
                            type="button"
                            className={`form-icon-option ${newHabit.icon === icon ? 'selected' : ''}`}
                            onClick={() => setNewHabit({ ...newHabit, icon })}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="form-color-picker">
                      <label>Color</label>
                      <div className="form-color-grid">
                        {availableColors.map(color => (
                          <button
                            key={color}
                            type="button"
                            className={`form-color-option ${newHabit.color === color ? 'selected' : ''}`}
                            style={{ backgroundColor: color }}
                            onClick={() => setNewHabit({ ...newHabit, color })}
                          />
                        ))}
                      </div>
                    </div>
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
                      <div key={h.id} className={`habit-card-admin ${editingId === h.id ? 'editing' : ''}`}>
                        {editingId === h.id ? (
                          <div className="habit-edit-section">
                            <input
                              className="edit-input-admin title"
                              value={editForm.title}
                              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                              placeholder="Title"
                            />
                            <textarea
                              className="edit-input-admin description"
                              value={editForm.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              placeholder="Description"
                            />
                            <div className="edit-row">
                              <div className="edit-group">
                                <label>Icon</label>
                                <div className="icon-picker-admin">
                                  {availableIcons.map(icon => (
                                    <button
                                      key={icon}
                                      type="button"
                                      className={`icon-option-admin ${editForm.icon === icon ? 'selected' : ''}`}
                                      onClick={() => setEditForm({ ...editForm, icon })}
                                    >
                                      {icon}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="edit-group">
                                <label>Color</label>
                                <div className="color-picker-admin">
                                  {availableColors.map(color => (
                                    <button
                                      key={color}
                                      type="button"
                                      className={`color-option-admin ${editForm.color === color ? 'selected' : ''}`}
                                      style={{ backgroundColor: color }}
                                      onClick={() => setEditForm({ ...editForm, color })}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="edit-actions">
                              <button onClick={() => saveEdit(h.id)} className="button primary save">
                                💾 Save Changes
                              </button>
                              <button onClick={cancelEdit} className="button cancel">
                                ✕ Cancel
                              </button>
                            </div>
                          </div>
                        ) : deletingId === h.id ? (
                          <div className="delete-confirm-admin">
                            <p className="delete-confirm-text">
                              ⚠️ Are you sure you want to delete "{h.title}"? This action cannot be undone.
                            </p>
                            <div className="delete-confirm-actions">
                              <button onClick={() => confirmDelete(h.id)} className="button confirm-yes">
                                Yes, Delete
                              </button>
                              <button onClick={cancelDelete} className="button confirm-no">
                                No, Keep It
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="habit-main-content">
                              <div className="habit-info-section">
                                <div>
                                  <strong>{h.title}</strong> — <small>{h.owner_email}</small>
                                </div>
                                {h.description && <span className="muted">{h.description}</span>}
                              </div>
                              <div className="habit-actions">
                                <button onClick={() => startEdit(h)} className="button small">
                                  ✏️ Edit
                                </button>
                                <button onClick={() => startDelete(h.id)} className="button danger small">
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>
                          </>
                        )}
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