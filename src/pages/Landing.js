import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-full flex items-center justify-center bg-slate-950 text-white p-6">
      <div className="w-full max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Swarm Vision
          </h1>
          <p className="text-xl text-slate-300">
            🧠🐝 Collective Intelligence in Action
          </p>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Join a swarm of minds to solve visual puzzles together. 
            Each individual guess contributes to a smarter collective prediction.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Link 
            to="/admin/login" 
            className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 p-8 rounded-xl shadow-lg border border-indigo-500/20 transition-all duration-300 hover:scale-105"
          >
            <div className="text-4xl mb-4">👑</div>
            <h2 className="text-2xl font-bold mb-2">I'm Admin</h2>
            <p className="text-indigo-100">
              Create games, upload images, and guide the swarm learning process.
            </p>
          </Link>
          
          <Link 
            to="/player/join" 
            className="group bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 p-8 rounded-xl shadow-lg border border-emerald-500/20 transition-all duration-300 hover:scale-105"
          >
            <div className="text-4xl mb-4">🎓</div>
            <h2 className="text-2xl font-bold mb-2">I'm Player</h2>
            <p className="text-emerald-100">
              Join the swarm and contribute your vision to collective intelligence.
            </p>
          </Link>
        </div>
        
        <div className="text-sm text-slate-500">
          <p>Powered by Swarm Learning Technology</p>
        </div>
      </div>
    </div>
  );
}
