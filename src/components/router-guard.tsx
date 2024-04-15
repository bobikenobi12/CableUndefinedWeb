import { useAppSelector } from "@/redux/hooks";
import { selectIsAuthenticated } from "@/redux/features/auth/auth-handler-slice";
import { Navigate, Outlet } from "react-router-dom";

interface RouterGuardProps {
	shouldBe: "unauthenticated" | "authenticated";
}

export default function RouterGuard({ shouldBe }: RouterGuardProps) {
	const isAuthenticated = useAppSelector(selectIsAuthenticated);

	if (shouldBe === "authenticated") {
		if (isAuthenticated) {
			return <Outlet />;
		} else {
			return <Navigate to="" />;
		}
	} else {
		if (isAuthenticated) {
			return <Navigate to="/dashboard" />;
		} else {
			return <Outlet />;
		}
	}
}
