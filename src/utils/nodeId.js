export function getNextNodeId() {
	const key = 'swarm_node_counter';
	const raw = localStorage.getItem(key);
	const current = raw ? parseInt(raw, 10) : 0;
	const next = current + 1;
	localStorage.setItem(key, String(next));
	const padded = String(next).padStart(2, '0');
	return `Node_${padded}`;
}

export function getStoredIdentity() {
	const name = localStorage.getItem('swarm_student_name') || '';
	const nodeId = localStorage.getItem('swarm_node_id') || '';
	return { name, nodeId };
}

export function storeIdentity(name, nodeId) {
	localStorage.setItem('swarm_student_name', name);
	localStorage.setItem('swarm_node_id', nodeId);
}
