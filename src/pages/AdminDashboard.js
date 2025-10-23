import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [gameData, setGameData] = useState({
    image: null,
    options: ['', '', '', ''],
    correctAnswer: '',
    gameActive: false
  });
  const [gameStatus, setGameStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('admin_logged_in')) {
      navigate('/admin/login');
      return;
    }
    fetchGameStatus();
  }, [navigate]);

  const fetchGameStatus = async () => {
    try {
      const response = await fetch('https://swarm-backend-nf9e.onrender.com/get_game_status');
      const data = await response.json();
      setGameStatus(data);
    } catch (err) {
      console.error('Failed to fetch game status:', err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setGameData({...gameData, image: e.target.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...gameData.options];
    newOptions[index] = value;
    setGameData({...gameData, options: newOptions});
  };

  const createGame = async () => {
    if (!gameData.image || gameData.options.some(opt => !opt.trim())) {
      setError('Please upload an image and fill all options');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://swarm-backend-nf9e.onrender.com/admin/create_game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: gameData.image,
          options: gameData.options.filter(opt => opt.trim()),
          correct_answer: gameData.correctAnswer
        })
      });

      const data = await response.json();
      if (data.success) {
        setError('');
        fetchGameStatus();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  const startGame = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://swarm-backend-nf9e.onrender.com/start_game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        fetchGameStatus();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  const endGame = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://swarm-backend-nf9e.onrender.com/end_game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        fetchGameStatus();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to end game');
    } finally {
      setLoading(false);
    }
  };

  const revealAnswer = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://swarm-backend-nf9e.onrender.com/reveal_answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        // Store results in localStorage for the results page
        localStorage.setItem('swarm_results', JSON.stringify(data));
        navigate('/results');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to reveal answer');
    } finally {
      setLoading(false);
    }
  };

  const resetGame = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://swarm-backend-nf9e.onrender.com/reset_game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        setGameData({
          image: null,
          options: ['', '', '', ''],
          correctAnswer: '',
          gameActive: false
        });
        fetchGameStatus();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to reset game');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Swarm Control Panel</h1>
          <button
            onClick={() => {
              localStorage.removeItem('admin_logged_in');
              navigate('/');
            }}
            className="text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>

        {/* Game Status */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
          <h2 className="text-xl font-semibold mb-3">Game Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-400">{gameStatus.total_players || 0}</div>
              <div className="text-slate-400">Players</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{gameStatus.total_guesses || 0}</div>
              <div className="text-slate-400">Guesses</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${gameStatus.game_active ? 'text-green-400' : 'text-slate-400'}`}>
                {gameStatus.game_active ? 'LIVE' : 'OFFLINE'}
              </div>
              <div className="text-slate-400">Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {gameStatus.game_ended ? 'ENDED' : 'ACTIVE'}
              </div>
              <div className="text-slate-400">Phase</div>
            </div>
          </div>
        </div>

        {/* Create Game Form */}
        {!gameStatus.game_active && !gameStatus.game_ended && (
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h2 className="text-xl font-semibold mb-4">Create New Game</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2"
                />
                {gameData.image && (
                  <div className="mt-2">
                    <img src={gameData.image} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Multiple Choice Options</label>
                {gameData.options.map((option, index) => (
                  <input
                    key={index}
                    type="text"
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 mb-2"
                  />
                ))}
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Correct Answer</label>
                <select
                  value={gameData.correctAnswer}
                  onChange={(e) => setGameData({...gameData, correctAnswer: e.target.value})}
                  className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2"
                >
                  <option value="">Select correct answer</option>
                  {gameData.options.map((option, index) => (
                    <option key={index} value={String.fromCharCode(65 + index)}>
                      {String.fromCharCode(65 + index)}: {option}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                onClick={createGame}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2 rounded-md"
              >
                {loading ? 'Creating...' : 'Create Game'}
              </button>
            </div>
          </div>
        )}

        {/* Game Controls */}
        {gameStatus.current_game && (
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h2 className="text-xl font-semibold mb-4">Game Controls</h2>
            
            <div className="flex gap-4">
              {!gameStatus.game_active && !gameStatus.game_ended && (
                <button
                  onClick={startGame}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-md"
                >
                  Start Game
                </button>
              )}
              
              {gameStatus.game_active && (
                <button
                  onClick={endGame}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-md"
                >
                  End Game
                </button>
              )}
              
              {gameStatus.game_ended && !gameStatus.game_active && (
                <button
                  onClick={revealAnswer}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-md"
                >
                  Reveal Answer
                </button>
              )}
              
              <button
                onClick={resetGame}
                disabled={loading}
                className="bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-md"
              >
                Reset Game
              </button>
            </div>
          </div>
        )}

        {/* Current Game Info */}
        {gameStatus.current_game && (
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h2 className="text-xl font-semibold mb-4">Current Game</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <img 
                  src={`https://swarm-backend-nf9e.onrender.com/uploads/${gameStatus.current_game.image}`} 
                  alt="Game image" 
                  className="w-full h-48 object-cover rounded-lg filter blur-md"
                />
                <p className="text-sm text-slate-400 mt-2">Blurred view (as seen by players)</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Options:</h3>
                {gameStatus.current_game.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="font-mono text-indigo-400">{String.fromCharCode(65 + index)}:</span>
                    <span>{option}</span>
                  </div>
                ))}
                <div className="mt-4">
                  <span className="font-semibold text-green-400">Correct: {gameStatus.current_game.correct_answer}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
