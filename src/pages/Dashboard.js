import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5000/admin/get_detailed_results');
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data);
      } else {
        if (data.message === 'Admin not logged in') {
          navigate('/admin/login');
          return;
        }
        setError(data.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Connection failed. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p>Loading swarm analytics...</p>
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

  // Prepare accuracy comparison chart
  const accuracyData = {
    labels: dashboardData.individual_accuracies.map(acc => `${acc.node_id} (${acc.roll_number})`),
    datasets: [
      {
        label: 'Individual Accuracy (%)',
        data: dashboardData.individual_accuracies.map(acc => acc.accuracy),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2
      }
    ]
  };

  const accuracyOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Individual Node Performance'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  // Prepare swarm confidence doughnut chart
  const swarmData = {
    labels: Object.keys(dashboardData.swarm_confidence),
    datasets: [
      {
        data: Object.values(dashboardData.swarm_confidence),
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  const swarmOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Swarm Confidence Distribution'
      }
    }
  };

  return (
    <div className="min-h-full bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Swarm Analytics Dashboard
          </h1>
          <button 
            onClick={() => navigate('/')}
            className="text-indigo-400 hover:text-indigo-300"
          >
            ← Back to Home
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 text-center">
            <div className="text-3xl font-bold text-indigo-400">{dashboardData.total_participants}</div>
            <div className="text-slate-400">Total Nodes</div>
          </div>
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 text-center">
            <div className="text-3xl font-bold text-emerald-400">{dashboardData.swarm_accuracy}%</div>
            <div className="text-slate-400">Swarm Accuracy</div>
          </div>
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 text-center">
            <div className="text-3xl font-bold text-purple-400">
              {Math.max(...Object.values(dashboardData.swarm_confidence))}%
            </div>
            <div className="text-slate-400">Peak Confidence</div>
          </div>
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 text-center">
            <div className="text-3xl font-bold text-yellow-400">{dashboardData.contribution_log.length}</div>
            <div className="text-slate-400">Contributions</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Individual Performance */}
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h2 className="text-xl font-semibold mb-4">Individual Node Performance</h2>
            <div className="h-64">
              <Bar data={accuracyData} options={accuracyOptions} />
            </div>
          </div>

          {/* Swarm Confidence */}
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h2 className="text-xl font-semibold mb-4">Swarm Confidence Distribution</h2>
            <div className="h-64">
              <Doughnut data={swarmData} options={swarmOptions} />
            </div>
          </div>
        </div>

        {/* Swarm Brain Visualization */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Swarm Brain Activity</h2>
          <div className="text-center">
            <div className="relative inline-block">
              <div className="text-8xl mb-4">🧠</div>
              <div 
                className="absolute inset-0 text-8xl opacity-50 animate-pulse"
                style={{ 
                  filter: `blur(${Math.max(0, 20 - dashboardData.swarm_accuracy / 5)}px)`,
                  transition: 'filter 2s ease-in-out'
                }}
              >
                🧠
              </div>
            </div>
            <p className="text-lg text-slate-300 mt-4">
              Collective Intelligence Clarity: {dashboardData.swarm_accuracy}%
            </p>
            <div className="w-full bg-slate-700 rounded-full h-3 mt-4">
              <div 
                className="bg-gradient-to-r from-emerald-400 to-purple-400 h-3 rounded-full transition-all duration-2000"
                style={{ width: `${dashboardData.swarm_accuracy}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Blockchain-Style Contribution Log */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Contribution Blockchain</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {dashboardData.contribution_log.map((log, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-3 bg-slate-800 rounded-lg border border-slate-700"
              >
                <div className="text-sm font-mono text-indigo-400">
                  Block #{log.block_id}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{log.node_id}</div>
                  <div className="text-sm text-slate-400">{log.action}</div>
                  {log.impact && (
                    <div className="text-xs text-emerald-400">{log.impact}</div>
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final Summary */}
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-lg p-8 border border-indigo-500/20 text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-4">Swarm Learning Complete!</h2>
          <p className="text-lg text-slate-300 mb-6">
            The collective intelligence has successfully processed {dashboardData.total_participants} individual contributions,
            achieving {dashboardData.swarm_accuracy}% accuracy through distributed learning.
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => navigate('/')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-lg"
            >
              Start New Swarm
            </button>
            <button 
              onClick={() => navigate('/results')}
              className="bg-slate-600 hover:bg-slate-500 text-white font-semibold px-6 py-3 rounded-lg"
            >
              View Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}