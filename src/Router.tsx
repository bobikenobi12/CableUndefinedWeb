import { createBrowserRouter } from "react-router-dom";

import { Applayout } from "./components/layouts/AppLayout";

// Pages
import NoMatch from "./pages/NoMatch";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import CreateDiagram from "./pages/CreateDiagram";
import Canvas from "./pages/Canvas";
import Home from "./pages/Home";
import RouterGuard from "./components/router-guard";

export const router = createBrowserRouter(
	[
		{
			path: "",
			element: <RouterGuard shouldBe="unauthenticated" />,
			children: [
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
			],
		},
		{
			path: "",
			element: <RouterGuard shouldBe="authenticated" />,
			children: [
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
					],
				},
			],
		},
		{
			path: "*",
			element: <NoMatch />,
		},
	],
	{
		// basename: global.basename,
	}
);

// export const authenticatedRouter = createBrowserRouter(
// 	[
// 		{
// 			path: "",
// 			element: <Applayout />,
// 			children: [
// 				{
// 					path: "dashboard",
// 					element: <Dashboard />,
// 				},
// 				{
// 					path: "dashboard/new",
// 					element: <CreateDiagram />,
// 				},
// 				{
// 					path: "dashboard/:id",
// 					element: <Canvas />,
// 				},
// 			],
// 		},
// 		{
// 			path: "*",
// 			element: <NoMatch />,
// 		},
// 	],
// 	{
// 		// basename: global.basename,
// 	}
// );
