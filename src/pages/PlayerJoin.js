import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PlayerJoin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', roll_number: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.roll_number.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://swarm-backend-nf9e.onrender.com/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          roll_number: formData.roll_number.trim()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Use sessionStorage for tab-specific data
        sessionStorage.setItem('player_name', formData.name.trim());
        sessionStorage.setItem('node_id', data.node_id);
        sessionStorage.setItem('player_avatar', data.avatar);
        sessionStorage.setItem('player_roll_number', data.roll_number);
        navigate('/player/waiting');
      } else {
        setError(data.message || 'Failed to join game');
      }
    } catch (err) {
      setError('Connection failed. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-slate-950 text-white p-6">
      <div className="w-full max-w-md bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-800">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🎓</div>
          <h1 className="text-2xl font-bold">Join the Swarm</h1>
          <p className="text-slate-300">Enter your name to become a node in the collective intelligence</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Your Name</label>
            <input
              type="text"
              className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Alex, Sarah, Mike"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Roll Number</label>
            <input
              type="text"
              className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. 211, 225, 431"
              value={formData.roll_number}
              onChange={(e) => setFormData({...formData, roll_number: e.target.value})}
              required
            />
            <p className="text-xs text-slate-400 mt-1">
              Valid roll numbers: 211-269 or 431-436
            </p>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-2 rounded-md"
          >
            {loading ? 'Joining...' : 'Join Swarm'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => navigate('/')}
            className="text-emerald-400 hover:text-emerald-300 text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
