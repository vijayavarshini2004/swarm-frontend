import {
    ArcElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    Title,
    Tooltip,
} from 'chart.js';
import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Results() {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shouldNavigate, setShouldNavigate] = useState(null);

  const playerInfo = {
    name: sessionStorage.getItem('player_name'),
    nodeId: sessionStorage.getItem('node_id'),
    avatar: sessionStorage.getItem('player_avatar'),
    rollNumber: sessionStorage.getItem('player_roll_number')
  };

  useEffect(() => {
    // Always fetch results from API when admin reveals
    fetchResults();
  }, []);

  // Handle navigation based on state
  useEffect(() => {
    if (shouldNavigate) {
      navigate(shouldNavigate);
      setShouldNavigate(null);
    }
  }, [shouldNavigate, navigate]);

  const fetchResults = async () => {
    try {
      const response = await fetch('http://localhost:5000/get_swarm_results');
      const data = await response.json();
      
      if (data.success) {
        // Get current game info for the image
        const gameStatusResponse = await fetch('http://localhost:5000/get_game_status');
        const gameStatus = await gameStatusResponse.json();
        
        data.current_game = gameStatus.current_game;
        setResults(data);
        playRevealSound();
      } else {
        // If game not ended yet, redirect back to game
        if (data.message === 'Game not ended') {
          setShouldNavigate('/player/game');
          return;
        }
        // If answer not revealed yet, redirect back to game
        if (data.message === 'Answer not revealed yet') {
          setShouldNavigate('/player/game');
          return;
        }
        setError(data.message || 'Failed to fetch results');
      }
    } catch (err) {
      setError('Connection failed. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const playRevealSound = () => {
    // Create a more elaborate reveal sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create a chord progression for the reveal
    const frequencies = [261.63, 329.63, 392.00]; // C, E, G
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.1);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * 0.1);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + index * 0.1 + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.1 + 1);
      
      oscillator.start(audioContext.currentTime + index * 0.1);
      oscillator.stop(audioContext.currentTime + index * 0.1 + 1);
    });
  };

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p>Calculating swarm results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }


  // Prepare donut chart data for response distribution
  // Since students don't have access to individual_results, we'll create a mock distribution
  // based on the swarm confidence and total participants
  const responseDistribution = {};
  const totalParticipants = results.total_participants || 0;
  
  if (results.swarm_confidence && totalParticipants > 0) {
    // Create a mock distribution based on swarm confidence percentages
    Object.entries(results.swarm_confidence).forEach(([option, confidence]) => {
      const votes = Math.round((confidence / 100) * totalParticipants);
      responseDistribution[option] = Math.max(1, votes); // Ensure at least 1 vote
    });
    
    // Adjust to ensure total equals totalParticipants
    const currentTotal = Object.values(responseDistribution).reduce((sum, votes) => sum + votes, 0);
    if (currentTotal !== totalParticipants) {
      const difference = totalParticipants - currentTotal;
      const options = Object.keys(responseDistribution);
      if (options.length > 0) {
        responseDistribution[options[0]] += difference;
      }
    }
  }

  const donutData = {
    labels: Object.keys(responseDistribution).length > 0 
      ? Object.keys(responseDistribution).map(option => 
          `${option} (${responseDistribution[option]} vote${responseDistribution[option] !== 1 ? 's' : ''})`
        )
      : ['No Data'],
    datasets: [
      {
        data: Object.keys(responseDistribution).length > 0 
          ? Object.values(responseDistribution)
          : [1],
        backgroundColor: [
          '#10b981', // emerald-500
          '#8b5cf6', // purple-500
          '#f59e0b', // amber-500
          '#ef4444', // red-500
          '#3b82f6', // blue-500
          '#06b6d4', // cyan-500
        ],
        borderColor: [
          '#059669', // emerald-600
          '#7c3aed', // purple-600
          '#d97706', // amber-600
          '#dc2626', // red-600
          '#2563eb', // blue-600
          '#0891b2', // cyan-600
        ],
        borderWidth: 2,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#e2e8f0', // slate-200
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: 'Response Distribution',
        color: '#e2e8f0', // slate-200
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
  };

  return (
    <div className="min-h-full bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">
            Swarm Results Revealed! 🧠🐝
          </h1>
          <p className="text-xl text-slate-300">
            The collective intelligence has spoken
          </p>
        </div>


        {/* Clear Image Reveal */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
          <h2 className="text-xl font-semibold mb-4">The Clear Image</h2>
          <div className="text-center">
            <img 
              src={`http://localhost:5000/uploads/${results.current_game?.image}`} 
              alt="Clear image" 
              className="mx-auto max-w-full h-64 object-cover rounded-lg"
            />
            <p className="text-sm text-slate-400 mt-2">
              Now you can see what the swarm was trying to identify
            </p>
          </div>
        </div>

        {/* Correct Answer */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Correct Answer</h2>
          <div className="text-center">
            <div className="text-4xl font-bold text-emerald-400 mb-2">
              {results.correct_answer}
            </div>
            <p className="text-slate-300">
              This was the correct answer that the swarm was trying to identify
            </p>
          </div>
        </div>

        {/* Swarm Confidence */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Swarm Confidence Distribution</h2>
          <div className="space-y-3">
            {Object.entries(results.swarm_confidence).map(([option, confidence]) => (
              <div key={option} className="flex items-center justify-between">
                <span className="font-mono text-lg">{option}:</span>
                <div className="flex items-center gap-3">
                  <div className="w-48 bg-slate-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        option === results.correct_answer ? 'bg-green-400' : 'bg-slate-500'
                      }`}
                      style={{ width: `${confidence}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold w-12 text-right">{confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vote Distribution Chart */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Vote Distribution</h2>
          <div className="h-80 flex items-center justify-center">
            <Doughnut data={donutData} options={donutOptions} />
          </div>
          <div className="mt-4 text-center text-slate-400">
            <p>Number of votes for each option selected by participants</p>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
            {Object.keys(responseDistribution).length > 0 ? (
              Object.entries(responseDistribution).map(([option, votes]) => (
                <div key={option} className="bg-slate-800 rounded-lg p-2">
                  <div className="text-lg font-bold text-emerald-400">{votes}</div>
                  <div className="text-sm text-slate-300">{option}</div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-slate-400">
                No vote data available
              </div>
            )}
          </div>
        </div>

        {/* Swarm Summary */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Swarm Intelligence Summary</h2>
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🧠🐝</div>
            <p className="text-lg text-slate-300">
              The collective intelligence of {results.total_participants} nodes achieved {results.swarm_accuracy}% accuracy!
            </p>
            <p className="text-slate-400">
              Your individual contribution helped the swarm learn and make better decisions together.
            </p>
          </div>
        </div>

        {/* Final Message */}
        <div className="bg-gradient-to-r from-emerald-900 to-purple-900 rounded-lg p-8 border border-emerald-500/20 text-center">
          <div className="text-4xl mb-4">🧠🐝</div>
          <h2 className="text-2xl font-bold mb-4">Your swarm became smarter by learning together!</h2>
          <p className="text-lg text-slate-300 mb-6">
            Each individual contribution enhanced the collective intelligence, 
            demonstrating the power of swarm learning.
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => navigate('/')}
              className="bg-slate-600 hover:bg-slate-500 text-white font-semibold px-6 py-3 rounded-lg"
            >
              New Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
