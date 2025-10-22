const API_BASE = process.env.REACT_APP_API_BASE || '';

export async function submitGuess({ nodeId, guess }) {
	const response = await fetch(`${API_BASE}/submit_guess`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ node_id: nodeId, guess }),
	});
	if (!response.ok) {
		const text = await response.text();
		throw new Error(text || 'Failed to submit guess');
	}
	return response.json().catch(() => ({}));
}
