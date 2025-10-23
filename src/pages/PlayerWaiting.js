import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PlayerWaiting() {
  const navigate = useNavigate();
  const [gameStatus, setGameStatus] = useState({});
  const [playerInfo, setPlayerInfo] = useState({});
  const [shouldNavigate, setShouldNavigate] = useState(null);

  useEffect(() => {
    const name = sessionStorage.getItem('player_name');
    const nodeId = sessionStorage.getItem('node_id');
    const avatar = sessionStorage.getItem('player_avatar');
    const rollNumber = sessionStorage.getItem('player_roll_number');

    if (!name || !nodeId) {
      navigate('/player/join');
      return;
    }

    setPlayerInfo({ name, nodeId, avatar, rollNumber });

    const checkGameStatus = async () => {
      try {
        const response = await fetch('https://swarm-backend-nf9e.onrender.com/get_game_status');
        const data = await response.json();
        setGameStatus(data);

        if (data.game_active) {
          setShouldNavigate('/player/game');
        }
      } catch (err) {
        console.error('Failed to check game status:', err);
      }
    };

    checkGameStatus();
    const interval = setInterval(checkGameStatus, 2000);

    return () => clearInterval(interval);
  }, [navigate]);

  // Handle navigation based on state
  useEffect(() => {
    if (shouldNavigate) {
      navigate(shouldNavigate);
      setShouldNavigate(null);
    }
  }, [shouldNavigate, navigate]);

  return (
    <div className="min-h-full flex items-center justify-center bg-slate-950 text-white p-6">
      <div className="w-full max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <div className="text-6xl mb-4">{playerInfo.avatar}</div>
          <h1 className="text-3xl font-bold">
            Welcome, <span className="text-emerald-400">{playerInfo.name}</span>!
          </h1>
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
            <p className="text-lg text-slate-300 mb-2">
              Your Node ID: <span className="font-mono text-indigo-400">{playerInfo.nodeId}</span>
            </p>
            <p className="text-lg text-slate-300 mb-2">
              Roll Number: <span className="font-mono text-emerald-400">{playerInfo.rollNumber}</span>
            </p>
            <p className="text-sm text-slate-400">
              Your vision will help the swarm see better 👁️🐝
            </p>
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Waiting for Game to Start</h2>
          <p className="text-slate-300 mb-4">
            The admin is preparing the swarm learning challenge...
          </p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-400">{gameStatus.total_players || 0}</div>
              <div className="text-slate-400">Nodes Connected</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${gameStatus.game_active ? 'text-green-400' : 'text-slate-400'}`}>
                {gameStatus.game_active ? 'LIVE' : 'WAITING'}
              </div>
              <div className="text-slate-400">Game Status</div>
            </div>
          </div>
        </div>

        <div className="text-sm text-slate-500">
          <p>Stay connected! The game will start automatically when ready.</p>
        </div>
      </div>
    </div>
  );
}
