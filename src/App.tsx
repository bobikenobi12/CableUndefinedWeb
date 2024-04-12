import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { authenticatedRouter, unauthenticatedRouter } from "./Router";

import { useAppSelector } from "@/redux/hooks";
import { selectIsAuthenticated } from "@/redux/features/auth/auth-handler-slice";
import SerialProvider from "./contexts/SerialContext";

export default function App() {
	const isAuthenticated = useAppSelector(selectIsAuthenticated);
	return (
		<ThemeProvider>
			<TooltipProvider>
				<SerialProvider>
					<RouterProvider
						router={isAuthenticated ? authenticatedRouter : unauthenticatedRouter}
					/>
				</SerialProvider>
			</TooltipProvider>
		</ThemeProvider>
	);
}
