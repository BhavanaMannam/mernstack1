// App.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './index.css';

const API_URL = 'http://localhost:5000/api/todos';

function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Centralized error handler
  const handleError = msg => {
    setError(msg);
    setTimeout(() => setError(''), 3000);
  };

  const fetchTodos = async () => {
    try {
      const res = await axios.get(API_URL);
      setTodos(res.data);
    } catch {
      handleError('❌ Failed to load todos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (!text.trim()) return;
    setSaving(true);

    const optimistic = { _id: Date.now().toString(), text, completed: false, pending: true };
    setTodos(prev => [...prev, optimistic]);
    setText('');

    try {
      const res = await axios.post(API_URL, { text });
      setTodos(prev =>
        prev.map(t => (t._id === optimistic._id ? res.data : t))
      );
    } catch {
      setTodos(prev => prev.filter(t => t._id !== optimistic._id));
      handleError('❌ Could not add todo.');
    } finally {
      setSaving(false);
    }
  };

  const toggleComplete = async todo => {
    const toggled = { ...todo, completed: !todo.completed, pending: true };
    setTodos(prev => prev.map(t => (t._id === todo._id ? toggled : t)));

    try {
      const res = await axios.put(`${API_URL}/${todo._id}`, toggled);
      setTodos(prev => prev.map(t => (t._id === todo._id ? res.data : t)));
    } catch {
      setTodos(prev => prev.map(t => (t._id === todo._id ? todo : t)));
      handleError('❌ Failed to update todo.');
    }
  };

  const deleteTodo = async id => {
    const removed = todos.find(t => t._id === id);
    setTodos(prev => prev.filter(t => t._id !== id));

    try {
      await axios.delete(`${API_URL}/${id}`);
    } catch {
      setTodos(prev => [...prev, removed]);
      handleError('❌ Failed to delete todo.');
    }
  };

  return (
    <div className="app">
      <div className="todo-container">
        <h1>📝 Advanced To‑Do List</h1>

        {error && <p className="error">{error}</p>}
        {loading ? (
          <p>Loading tasks...</p>
        ) : (
          <>
            <div className="input-area">
              <input
                type="text"
                placeholder="Add your task..."
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addTodo()}
                disabled={saving}
              />
              <button onClick={addTodo} disabled={saving}>
                {saving ? 'Adding...' : 'Add'}
              </button>
            </div>

            <ul className="todo-list">
              {todos.length === 0 ? (
                <li className="empty">No tasks found. Add your first one!</li>
              ) : (
                todos.map(todo => (
                  <li
                    key={todo._id}
                    className={`${todo.completed ? 'completed' : ''} ${todo.pending ? 'pending' : ''}`}
                  >
                    <span onClick={() => toggleComplete(todo)}>
                      {todo.text}
                      {todo.pending && '…'}
                    </span>
                    <button
                      className="delete"
                      onClick={() => deleteTodo(todo._id)}
                      disabled={todo.pending}
                    >
                      ✖
                    </button>
                  </li>
                ))
              )}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
