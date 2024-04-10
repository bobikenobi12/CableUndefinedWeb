import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useToast } from "@/components/ui/use-toast";

import { CreditCard, LogOut, User } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
	selectUser,
	setOpenProfile,
} from "@/redux/features/auth/auth-handler-slice";

import { useLogoutMutation } from "@/redux/features/auth/auth-api-slice";
import { logout } from "@/redux/features/auth/auth-handler-slice";

import { useMatch, useLocation, useNavigate } from "react-router-dom";

import { Profile } from "@/components/profile";
import { Outlet } from "react-router-dom";

import { UserCombobox } from "../user-combobox";
import { DiagramsCombobox } from "../diagrams-combobox";
import { Button } from "../ui/button";
import { getPort, getWriter } from "@/utils/serial";
import { addConnection } from "@/utils/pathfinding";

export function CableUndefined() {
	return (
		<h1 className="relative flex flex-row items-baseline text-2xl font-bold">
			<span className="sr-only">CableUndefined</span>
			<span className="tracking-tight hover:cursor-pointer text-primary">
				Cable
				<span className="text-muted-foreground hover:text-primary">
					Undefined
				</span>
			</span>
			<sup className="absolute left-[calc(100%+.1rem)] top-0 text-xs font-bold text-black hidden">
				[BETA]
			</sup>
		</h1>
	);
}

export function Applayout() {
	const user = useAppSelector(selectUser);

	const dispatch = useAppDispatch();
	const [logoutMutation, { isLoading, isError }] = useLogoutMutation();

	const location = useLocation();
	const match = useMatch("/dashboard/:id");

	const { toast } = useToast();

	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			logoutMutation().unwrap();
			dispatch(logout());
			dispatch(setOpenProfile(false));
			toast({
				title: "Success",
				description: "Logged out successfully",
			});
			// navigate("/login");
		} catch (error) {
			console.error(error);
			toast({
				title: "Error",
				description: "An error occurred while logging out",
				variant: "destructive",
			});
		}
	};

	return (
		<>
			<div className="flex-grow flex flex-col h-full w-full">
				<div className="flex justify-between items-center mx-auto h-24 w-full max-w-7xl gap-x-6 p-6 sm:flex lg:px-8">
					<Breadcrumb>
						<BreadcrumbList className="flex items-center space-x-2">
							<BreadcrumbItem>
								<BreadcrumbLink href="/dashboard">
									<CableUndefined />
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator>
								<span className="text-5xl font-thin text-muted-foreground">
									/
								</span>
							</BreadcrumbSeparator>
							<BreadcrumbItem>
								<UserCombobox />
							</BreadcrumbItem>
							{match &&
								location.pathname !== "/dashboard/new" && (
									<>
										<BreadcrumbSeparator>
											<span className="text-5xl font-thin text-muted-foreground">
												/
											</span>
										</BreadcrumbSeparator>

										<BreadcrumbItem>
											<BreadcrumbPage>
												<DiagramsCombobox />
											</BreadcrumbPage>
										</BreadcrumbItem>
									</>
								)}
						</BreadcrumbList>
					</Breadcrumb>

					<Button
						onClick={() => {
							getPort().then((port) => {
								if (port instanceof Error) {
									return { response: port.message };
								}
							});
						}}
					>
						Open Port
					</Button>

					<DropdownMenu>
						<DropdownMenuTrigger>
							{/* make a fully rounded circle to act as avatar */}
							<div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center dark:bg-primary-foreground">
								<span className="text-white font-bold">
									{user.username.charAt(0).toUpperCase()}
								</span>
							</div>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-52">
							<DropdownMenuLabel>
								<div className="flex flex-col gap-2">
									<p className="text-sm font-medium leading-none">
										@{user.username}
									</p>
									<p className="text-xs leading-none text-muted-foreground">
										{user.email}
									</p>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuItem
								onClick={() => dispatch(setOpenProfile(true))}
							>
								<User className="mr-2 h-4 w-4" />
								<span>Profile</span>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<CreditCard className="mr-2 h-4 w-4" />
								<span>Billing</span>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleLogout}>
								<LogOut className="mr-2 h-4 w-4" />
								<span>Log out</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<div className="h-px w-screen bg-border flex-shrink-0" />
				<div className="flex sm:h-[calc(100vh-6rem-1px)]">
					<Outlet />
				</div>
			</div>
			{/* <div className="container px-4 md:px-8">
				<Footer />
			</div> */}
			<Profile />
		</>
	);
}
