import React, { useEffect, useState } from 'react';

/**
 * Beautiful Habits Page - Redesigned
 * Features stunning cards, smooth animations, and modern UI
 */

function Habits() {
  const [habits, setHabits] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#667eea');
  const [icon, setIcon] = useState('⚡');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingValues, setEditingValues] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [perHabitStats, setPerHabitStats] = useState({});
  const [userStreak, setUserStreak] = useState(0);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const iconOptions = ['⚡', '🎯', '💪', '📚', '🏃', '🧘', '💧', '🎨', '🎵', '✍️', '🌟', '🔥'];
  const colorOptions = [
    { color: '#667eea', name: 'Purple' },
    { color: '#764ba2', name: 'Deep Purple' },
    { color: '#f093fb', name: 'Pink' },
    { color: '#4facfe', name: 'Blue' },
    { color: '#43e97b', name: 'Green' },
    { color: '#fa709a', name: 'Coral' },
    { color: '#ffd166', name: 'Yellow' },
    { color: '#ff6b6b', name: 'Red' }
  ];

  const fetchHabits = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:3001/api/habits', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        setError('Failed to load habits');
        setHabits([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setHabits(data);
      fetchStats();
    } catch (err) {
      console.error('Fetch habits error', err);
      setError('Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3001/api/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setUserStreak(data.user_streak || 0);
      const map = {};
      (data.per_habit || []).forEach((p) => {
        map[p.id] = { streak: p.streak || 0, completion_rate: p.completion_rate || 0 };
      });
      setPerHabitStats(map);
    } catch (err) {
      console.error('Error fetching stats', err);
    }
  };

  useEffect(() => {
    if (token) fetchHabits();
    else {
      setLoading(false);
      setError('Not authenticated');
    }
  }, []);

  const createHabit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title) {
      setError('Title is required');
      return;
    }
    try {
      const res = await fetch('http://localhost:3001/api/habits', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, color, icon }),
      });
      if (!res.ok) {
        const t = await res.text();
        setError(t || 'Failed to create habit');
        return;
      }
      const created = await res.json();
      setHabits((s) => [created, ...s]);
      setTitle('');
      setDescription('');
      setShowForm(false);
      fetchStats();
    } catch (err) {
      console.error('Create habit error', err);
      setError('Failed to create habit');
    }
  };

  const startEdit = (h) => {
    setEditingId(h.id);
    setEditingValues({
      title: h.title || '',
      description: h.description || '',
      color: h.color || '#667eea',
      icon: h.icon || '✅',
    });
    setDeleteConfirmId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValues({});
  };

  const saveEdit = async (id) => {
    setError('');
    try {
      const body = {
        title: editingValues.title,
        description: editingValues.description,
        color: editingValues.color,
        icon: editingValues.icon,
      };
      const res = await fetch(`http://localhost:3001/api/habits/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const t = await res.text();
        setError(t || 'Failed to update habit');
        return;
      }
      const updated = await res.json();
      setHabits((s) => s.map((h) => (h.id === id ? updated : h)));
      cancelEdit();
      fetchStats();
    } catch (err) {
      console.error('Save edit error', err);
      setError('Failed to update habit');
    }
  };

  const confirmDeleteToggle = (id) => {
    setDeleteConfirmId((prev) => (prev === id ? null : id));
    setEditingId(null);
  };

  const deleteHabit = async (id) => {
    setError('');
    try {
      const res = await fetch(`http://localhost:3001/api/habits/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const t = await res.text();
        setError(t || 'Failed to delete habit');
        return;
      }
      setHabits((s) => s.filter((h) => h.id !== id));
      setDeleteConfirmId(null);
      fetchStats();
    } catch (err) {
      console.error('Delete habit error', err);
      setError('Failed to delete habit');
    }
  };

  const completeHabit = async (id) => {
    setError('');
    try {
      const res = await fetch(`http://localhost:3001/api/habits/${id}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const t = await res.text();
        setError(t || 'Failed to mark complete');
        return;
      }
      const updated = await res.json();
      setHabits((s) => s.map((h) => (h.id === id ? updated : h)));
      fetchStats();
    } catch (err) {
      console.error('Complete habit error', err);
      setError('Failed to mark complete');
    }
  };

  const uncompleteHabit = async (id) => {
    setError('');
    try {
      const res = await fetch(`http://localhost:3001/api/habits/${id}/uncomplete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const t = await res.text();
        setError(t || 'Failed to undo complete');
        return;
      }
      const updated = await res.json();
      setHabits((s) => s.map((h) => (h.id === id ? updated : h)));
      fetchStats();
    } catch (err) {
      console.error('Uncomplete habit error', err);
      setError('Failed to undo complete');
    }
  };

  const getHabitStats = (habit) => {
    const stats = perHabitStats[habit.id];
    return {
      streak: stats?.streak || habit.streak || 0,
      completionRate: stats?.completion_rate || 0
    };
  };

  const avgCompletion = habits.length === 0 ? 0 : 
    Math.round(habits.reduce((acc, h) => acc + (getHabitStats(h).completionRate || 0), 0) / habits.length);

  if (loading) {
    return (
      <div className="habits-page-modern">
        <div className="loading-screen">
          <div className="loading-spinner-modern"></div>
          <p className="loading-text">Loading your habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="habits-page-modern">
      {/* Hero Section */}
      <div className="habits-hero-modern">
        <div className="hero-overlay"></div>
        <div className="hero-content-modern">
          <div className="hero-badge">✨ Daily Progress</div>
          <h1 className="hero-title-modern">Your Habit Journey</h1>
          <p className="hero-subtitle-modern">Transform your life one habit at a time</p>
          
          {/* Stats Bar */}
          <div className="hero-stats-bar">
            <div className="hero-stat-item">
              <div className="hero-stat-icon">🎯</div>
              <div className="hero-stat-content">
                <span className="hero-stat-value">{habits.length}</span>
                <span className="hero-stat-label">Habits</span>
              </div>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat-item">
              <div className="hero-stat-icon">🔥</div>
              <div className="hero-stat-content">
                <span className="hero-stat-value">{userStreak}</span>
                <span className="hero-stat-label">Day Streak</span>
              </div>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat-item">
              <div className="hero-stat-icon">⭐</div>
              <div className="hero-stat-content">
                <span className="hero-stat-value">{avgCompletion}%</span>
                <span className="hero-stat-label">Completion</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="habits-content-modern">
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Action Bar */}
        <div className="action-bar-modern">
          <button
            className={`create-btn-modern ${showForm ? 'active' : ''}`}
            onClick={() => setShowForm(!showForm)}
          >
            <span className="btn-icon">{showForm ? '✕' : '+'}</span>
            <span>{showForm ? 'Cancel' : 'Create Habit'}</span>
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="create-form-modern">
            <div className="form-header-modern">
              <h3>Create New Habit</h3>
              <p>Start building a better version of yourself</p>
            </div>
            
            <form onSubmit={createHabit}>
              <div className="form-section">
                <label className="form-label-modern">Habit Name</label>
                <input
                  type="text"
                  placeholder="e.g., Morning Exercise, Read 30 Minutes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input-modern"
                />
              </div>

              <div className="form-section">
                <label className="form-label-modern">Description (Optional)</label>
                <textarea
                  placeholder="Add details about your habit..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea-modern"
                  rows="3"
                />
              </div>

              <div className="form-row-split">
                <div className="form-section">
                  <label className="form-label-modern">Choose Icon</label>
                  <div className="icon-grid-modern">
                    {iconOptions.map((ico) => (
                      <button
                        key={ico}
                        type="button"
                        className={`icon-btn-modern ${icon === ico ? 'selected' : ''}`}
                        onClick={() => setIcon(ico)}
                      >
                        {ico}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-section">
                  <label className="form-label-modern">Choose Color</label>
                  <div className="color-grid-modern">
                    {colorOptions.map((col) => (
                      <button
                        key={col.color}
                        type="button"
                        className={`color-btn-modern ${color === col.color ? 'selected' : ''}`}
                        style={{ backgroundColor: col.color }}
                        onClick={() => setColor(col.color)}
                        title={col.name}
                      >
                        {color === col.color && <span className="checkmark">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button type="submit" className="submit-btn-modern">
                <span className="btn-icon">✨</span>
                Create Habit
              </button>
            </form>
          </div>
        )}

        {/* Habits Grid */}
        <div className="habits-grid-modern">
          {habits.length === 0 ? (
            <div className="empty-state-modern">
              <div className="empty-icon-modern">🌱</div>
              <h3>No habits yet</h3>
              <p>Start your journey by creating your first habit!</p>
            </div>
          ) : (
            habits.map((h) => {
              const { streak, completionRate } = getHabitStats(h);
              const isEditing = editingId === h.id;
              const isDeleting = deleteConfirmId === h.id;

              return (
                <div
                  key={h.id}
                  className={`habit-card-beautiful ${h.completed_today ? 'completed' : ''}`}
                  style={{
                    '--card-color': h.color || '#667eea'
                  }}
                >
                  {/* Completion Badge */}
                  {h.completed_today && (
                    <div className="completion-badge-float">
                      <span>✓</span>
                    </div>
                  )}

                  {/* Card Header */}
                  <div className="card-header-beautiful">
                    <div className="habit-icon-beautiful" style={{ backgroundColor: h.color }}>
                      {h.icon || '✅'}
                    </div>
                    
                    <div className="habit-details-beautiful">
                      {isEditing ? (
                        <>
                          <input
                            className="edit-input-title"
                            value={editingValues.title}
                            onChange={(e) => setEditingValues({ ...editingValues, title: e.target.value })}
                            placeholder="Habit title"
                          />
                          <textarea
                            className="edit-input-desc"
                            value={editingValues.description}
                            onChange={(e) => setEditingValues({ ...editingValues, description: e.target.value })}
                            placeholder="Description"
                            rows="2"
                          />
                        </>
                      ) : (
                        <>
                          <h3 className="habit-name-beautiful">{h.title}</h3>
                          {h.description && <p className="habit-desc-beautiful">{h.description}</p>}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Edit Options */}
                  {isEditing && (
                    <div className="edit-options-beautiful">
                      <div className="edit-option-group">
                        <label>Icon</label>
                        <div className="icon-picker-small">
                          {iconOptions.slice(0, 6).map((ico) => (
                            <button
                              key={ico}
                              type="button"
                              className={`icon-opt-small ${editingValues.icon === ico ? 'active' : ''}`}
                              onClick={() => setEditingValues({ ...editingValues, icon: ico })}
                            >
                              {ico}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="edit-option-group">
                        <label>Color</label>
                        <div className="color-picker-small">
                          {colorOptions.slice(0, 4).map((col) => (
                            <button
                              key={col.color}
                              type="button"
                              className={`color-opt-small ${editingValues.color === col.color ? 'active' : ''}`}
                              style={{ backgroundColor: col.color }}
                              onClick={() => setEditingValues({ ...editingValues, color: col.color })}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stats Row */}
                  <div className="stats-row-beautiful">
                    <div className="stat-badge-beautiful streak">
                      <span className="stat-icon-beautiful">🔥</span>
                      <span className="stat-text-beautiful">{streak} day{streak !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="stat-badge-beautiful completion">
                      <span className="stat-icon-beautiful">📊</span>
                      <span className="stat-text-beautiful">{completionRate}%</span>
                    </div>
                    <div className="stat-badge-beautiful date">
                      <span className="stat-icon-beautiful">📅</span>
                      <span className="stat-text-beautiful">
                        {new Date(h.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="card-actions-beautiful">
                    {isDeleting ? (
                      <div className="delete-confirm-beautiful">
                        <span className="confirm-text-beautiful">Delete this habit?</span>
                        <div className="confirm-buttons">
                          <button onClick={() => deleteHabit(h.id)} className="btn-confirm-yes">
                            Yes
                          </button>
                          <button onClick={() => setDeleteConfirmId(null)} className="btn-confirm-no">
                            No
                          </button>
                        </div>
                      </div>
                    ) : isEditing ? (
                      <>
                        <button onClick={() => saveEdit(h.id)} className="action-btn-beautiful save">
                          <span>💾</span> Save
                        </button>
                        <button onClick={cancelEdit} className="action-btn-beautiful cancel">
                          <span>✕</span> Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(h)} className="action-btn-beautiful edit">
                          <span>✏️</span>
                        </button>
                        <button onClick={() => confirmDeleteToggle(h.id)} className="action-btn-beautiful delete">
                          <span>🗑️</span>
                        </button>
                        {h.completed_today ? (
                          <button onClick={() => uncompleteHabit(h.id)} className="action-btn-beautiful undo">
                            <span>↩️</span> Undo
                          </button>
                        ) : (
                          <button onClick={() => completeHabit(h.id)} className="action-btn-beautiful complete">
                            <span>✓</span> Complete
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Habits;