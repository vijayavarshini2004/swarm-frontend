import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredIdentity } from '../utils/nodeId';
import { submitGuess } from '../api';

const BLURRED_IMAGE = 'https://picsum.photos/seed/swarm/600/400';

export default function Game() {
	const navigate = useNavigate();
	const [{ nodeId }, setIdentity] = useState({ nodeId: '' });
	const [guess, setGuess] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	useEffect(() => {
		const id = getStoredIdentity();
		setIdentity(id);
		if (!id.nodeId) navigate('/');
	}, [navigate]);

	async function onSubmit(e) {
		e.preventDefault();
		if (!guess) return;
		setLoading(true);
		setError('');
		setSuccess('');
		try {
			await submitGuess({ nodeId, guess });
			setSuccess('Guess submitted!');
		} catch (err) {
			setError(err.message || 'Failed to submit');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-full flex items-center justify-center bg-slate-950 text-white p-6">
			<div className="w-full max-w-2xl bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-800">
				<h2 className="text-xl font-semibold mb-4">Identify the image</h2>
				<div className="overflow-hidden rounded-lg border border-slate-800">
					<img src={BLURRED_IMAGE} alt="blurred" className="w-full h-auto blur-md" />
				</div>
				<form onSubmit={onSubmit} className="mt-6 space-y-4">
					<div className="grid grid-cols-2 gap-3">
						{['A','B','C','D'].map((opt) => (
							<label key={opt} className={`flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer ${guess===opt ? 'border-indigo-500 bg-slate-800' : 'border-slate-800 bg-slate-900 hover:bg-slate-800'}`}>
								<input type="radio" name="guess" value={opt} checked={guess===opt} onChange={() => setGuess(opt)} className="accent-indigo-600" />
								<span className="font-semibold">{opt}</span>
							</label>
						))}
					</div>
					<button disabled={loading || !guess} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2 rounded-md">
						{loading ? 'Submitting...' : 'Submit Guess'}
					</button>
				</form>
				{error && <p className="text-red-400 mt-3">{error}</p>}
				{success && <p className="text-green-400 mt-3">{success}</p>}
			</div>
		</div>
	);
}
