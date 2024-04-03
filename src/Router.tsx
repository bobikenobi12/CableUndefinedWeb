import { createBrowserRouter } from "react-router-dom";

import { Applayout } from "./components/layouts/AppLayout";

// Layouts
import { LoggedInLayout } from "./components/layouts/LoggedInLayout";

// Pages
import NoMatch from "./pages/NoMatch";
import Dashboard from "./pages/Dashboard";
import Sample from "./pages/Sample";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import CreateDiagram from "./pages/CreateDiagram";
import Canvas from "./pages/Canvas";
import Home from "./pages/Home";

export const unauthenticatedRouter = createBrowserRouter(
	[
		{
			path: "",
			element: <Home />,
		},
		{
			path: "login",
			element: <LoginPage />,
		},
		{
			path: "register",
			element: <RegisterPage />,
		},
		{
			path: "*",
			element: <NoMatch />,
		},
	],
	{
		basename: global.basename,
	}
);

export const authenticatedRouter = createBrowserRouter(
	[
		{
			path: "",
			element: <Applayout />,
			children: [
				{
					path: "dashboard",
					element: <Dashboard />,
				},
				{
					path: "dashboard/new",
					element: <CreateDiagram />,
				},
				{
					path: "dashboard/:id",
					element: <Canvas />,
				},

				{
					path: "sample",
					element: <Sample />,
				},
			],
		},
		{
			path: "*",
			element: <NoMatch />,
		},
	],
	{
		basename: global.basename,
	}
);
