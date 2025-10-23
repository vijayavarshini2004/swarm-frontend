import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PlayerGame() {
  const navigate = useNavigate();
  const [gameData, setGameData] = useState(null);
  const [selectedGuess, setSelectedGuess] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [swarmConfidence, setSwarmConfidence] = useState({});

  const [shouldNavigate, setShouldNavigate] = useState(null);

  const playerInfo = {
    name: sessionStorage.getItem('player_name'),
    nodeId: sessionStorage.getItem('node_id'),
    avatar: sessionStorage.getItem('player_avatar'),
    rollNumber: sessionStorage.getItem('player_roll_number')
  };

  useEffect(() => {
    const name = sessionStorage.getItem('player_name');
    const nodeId = sessionStorage.getItem('node_id');
    
    if (!name || !nodeId) {
      navigate('/player/join');
      return;
    }

    fetchGameData();
    const interval = setInterval(fetchGameData, 3000);

    return () => clearInterval(interval);
  }, [navigate]);

  // Handle navigation based on state
  useEffect(() => {
    if (shouldNavigate) {
      navigate(shouldNavigate);
      setShouldNavigate(null);
    }
  }, [shouldNavigate, navigate]);

  const fetchGameData = async () => {
    try {
      const response = await fetch('https://swarm-backend-1.onrender.com/get_game_status');
      const data = await response.json();
      
      if (!data.game_active && !data.game_ended) {
        setShouldNavigate('/player/waiting');
        return;
      }
      
      if (data.game_ended) {
        // Game ended, redirect to thank you page
        setShouldNavigate('/thank-you');
        return;
      }

      setGameData(data.current_game);
    } catch (err) {
      console.error('Failed to fetch game data:', err);
    }
  };

  const submitGuess = async (e) => {
    e.preventDefault();
    if (!selectedGuess) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('https://swarm-backend-1.onrender.com/submit_guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          node_id: playerInfo.nodeId,
          guess: selectedGuess
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSubmitted(true);
        setSwarmConfidence(data.swarm_confidence);
        setSuccess('Your guess has been submitted! 🐝');
        
        // Play buzzing sound effect
        playBuzzingSound();
      } else {
        setError(data.message || 'Failed to submit guess');
      }
    } catch (err) {
      setError('Connection failed. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const playBuzzingSound = () => {
    // Create a simple buzzing sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  if (!gameData) {
    return (
      <div className="min-h-full flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Player Info */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{playerInfo.avatar}</span>
            <div>
              <div className="font-semibold">{playerInfo.name}</div>
              <div className="text-sm text-slate-400 font-mono">{playerInfo.nodeId}</div>
              <div className="text-xs text-emerald-400 font-mono">Roll: {playerInfo.rollNumber}</div>
            </div>
          </div>
          <div className="text-sm text-slate-400">
            Swarm Learning in Progress
          </div>
        </div>

        {/* Game Image */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Identify the Image</h2>
          <div className="text-center">
            <img 
              src={`https://swarm-backend-1.onrender.com/uploads/${gameData.image}`} 
              alt="Game image" 
              className="mx-auto max-w-full h-64 object-cover rounded-lg"
            />
            <p className="text-sm text-slate-400 mt-2">
              Your individual vision contributes to collective intelligence
            </p>
          </div>
        </div>

        {/* Guess Form */}
        {!submitted ? (
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h3 className="text-lg font-semibold mb-4">Make Your Guess</h3>
            <form onSubmit={submitGuess} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {gameData.options.map((option, index) => (
                  <label 
                    key={index}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-all ${
                      selectedGuess === String.fromCharCode(65 + index)
                        ? 'border-emerald-500 bg-emerald-900/20'
                        : 'border-slate-700 bg-slate-800 hover:bg-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="guess"
                      value={String.fromCharCode(65 + index)}
                      checked={selectedGuess === String.fromCharCode(65 + index)}
                      onChange={() => setSelectedGuess(String.fromCharCode(65 + index))}
                      className="accent-emerald-500"
                    />
                    <span className="font-semibold text-lg">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-slate-300">{option}</span>
                  </label>
                ))}
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading || !selectedGuess}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg"
              >
                {loading ? 'Submitting...' : 'Submit Guess'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h3 className="text-lg font-semibold mb-4">Guess Submitted!</h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-2">🐝</div>
                <p className="text-lg text-emerald-400">{success}</p>
                <p className="text-sm text-slate-400 mt-2">
                  Your contribution has been added to the swarm intelligence
                </p>
              </div>

              {/* Swarm Confidence Display */}
              {Object.keys(swarmConfidence).length > 0 && (
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Current Swarm Confidence</h4>
                  <div className="space-y-2">
                    {Object.entries(swarmConfidence).map(([option, confidence]) => (
                      <div key={option} className="flex items-center justify-between">
                        <span className="font-mono">{option}:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${confidence}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">{confidence}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center">
                <p className="text-slate-400">
                  Waiting for admin to reveal the answer...
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  The correct answer will be shown when the admin reveals it
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
