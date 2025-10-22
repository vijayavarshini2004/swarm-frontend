import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Landing from './pages/Landing';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import PlayerJoin from './pages/PlayerJoin';
import PlayerWaiting from './pages/PlayerWaiting';
import PlayerGame from './pages/PlayerGame';
import Results from './pages/Results';
import Dashboard from './pages/Dashboard';
import ThankYou from './pages/ThankYou';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Landing />} />
				<Route path="/admin/login" element={<AdminLogin />} />
				<Route path="/admin/dashboard" element={<AdminDashboard />} />
				<Route path="/player/join" element={<PlayerJoin />} />
				<Route path="/player/waiting" element={<PlayerWaiting />} />
				<Route path="/player/game" element={<PlayerGame />} />
				<Route path="/results" element={<Results />} />
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/thank-you" element={<ThankYou />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
