import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNextNodeId, storeIdentity } from '../utils/nodeId';

export default function Login() {
	const navigate = useNavigate();
	const [name, setName] = useState('');

	function handleSubmit(e) {
		e.preventDefault();
		if (!name.trim()) return;
		const nodeId = getNextNodeId();
		storeIdentity(name.trim(), nodeId);
		navigate('/welcome');
	}

	return (
		<div className="min-h-full flex items-center justify-center bg-slate-950 text-white p-6">
			<div className="w-full max-w-md bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-800">
				<h1 className="text-2xl font-bold mb-4 text-center">Swarm Vision</h1>
				<p className="text-slate-300 mb-6 text-center">Enter your name to join the swarm</p>
				<form onSubmit={handleSubmit} className="space-y-4">
					<label className="block">
						<span className="block text-sm text-slate-300 mb-1">Your Name</span>
						<input
							type="text"
							className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
							placeholder="e.g. Alex"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</label>
					<button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold py-2 rounded-md">Join</button>
				</form>
			</div>
		</div>
	);
}
