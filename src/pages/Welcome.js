import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getStoredIdentity } from '../utils/nodeId';

export default function Welcome() {
	const navigate = useNavigate();
	const [{ name, nodeId }, setIdentity] = useState({ name: '', nodeId: '' });

	useEffect(() => {
		const id = getStoredIdentity();
		setIdentity(id);
		if (!id.name || !id.nodeId) {
			navigate('/');
		}
	}, [navigate]);

	return (
		<div className="min-h-full flex items-center justify-center bg-slate-950 text-white p-6">
			<div className="w-full max-w-xl bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-800 text-center space-y-4">
				<h2 className="text-xl">Welcome, <span className="font-semibold">{name}</span>!</h2>
				<p className="text-slate-300">Your Node ID is <span className="font-mono font-semibold text-indigo-400">{nodeId}</span></p>
				<div className="flex items-center justify-center gap-3 pt-2">
					<Link to="/game" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-md">Start Game</Link>
					<Link to="/dashboard" className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-2 rounded-md">View Dashboard</Link>
				</div>
			</div>
		</div>
	);
}
