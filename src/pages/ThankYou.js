import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ThankYou() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to join page after 5 seconds
    const timer = setTimeout(() => {
      navigate('/player/join');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-full flex items-center justify-center bg-slate-950 text-white p-6">
      <div className="w-full max-w-2xl text-center space-y-8">
        <div className="space-y-6">
          <div className="text-8xl mb-6">🎉</div>
          <h1 className="text-4xl font-bold text-emerald-400">
            Thank You for Participating!
          </h1>
          <p className="text-xl text-slate-300">
            Your contribution to the swarm intelligence has been recorded.
          </p>
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <div className="text-6xl mb-4">🧠🐝</div>
            <p className="text-lg text-slate-300 mb-4">
              Together, we've demonstrated the power of collective intelligence!
            </p>
            <p className="text-slate-400">
              The swarm has learned from everyone's individual insights.
            </p>
          </div>
          <div className="text-sm text-slate-500">
            You will be redirected to join a new game in a few seconds...
          </div>
          <button
            onClick={() => navigate('/player/join')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-md"
          >
            Join Another Game
          </button>
        </div>
      </div>
    </div>
  );
}
