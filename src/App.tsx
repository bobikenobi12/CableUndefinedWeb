import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { router } from "./Router";

import SerialProvider from "./contexts/SerialContext";

export default function App() {
	return (
		<ThemeProvider>
			<TooltipProvider>
				<SerialProvider>
					<RouterProvider router={router} />
				</SerialProvider>
			</TooltipProvider>
		</ThemeProvider>
	);
}
