import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import useAuthCheck from "./hooks/useAuthCheck";
import Conversation from "./pages/Conversation";
import Inbox from "./pages/Inbox";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
	const authChecked = useAuthCheck();

	return !authChecked ? (
		<div className="flex items-center justify-center text-lg">
			Authentication Checking...
		</div>
	) : (
		<Router>
			<Routes>
				<Route path="/" element={<PublicRoute />}>
					<Route index element={<Login />} />
					<Route path="/register" element={<Register />} />
				</Route>
				<Route path="/inbox" element={<PrivateRoute />}>
					<Route index element={<Conversation />} />
					<Route path="/inbox/:id" element={<Inbox />} />
				</Route>
			</Routes>
		</Router>
	);
}

export default App;
