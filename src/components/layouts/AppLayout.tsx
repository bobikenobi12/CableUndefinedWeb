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

import { selectDiagramById } from "@/redux/features/diagrams/diagrams-slice";

import { useLogoutMutation } from "@/redux/features/auth/auth-api-slice";
import { logout } from "@/redux/features/auth/auth-handler-slice";

import { useMatch, useLocation, useNavigate } from "react-router-dom";

import { Profile } from "@/components/profile";
import { Outlet } from "react-router-dom";

import { UserCombobox } from "../user-combobox";
import { DiagramsCombobox } from "../diagrams-combobox";
import { Button } from "../ui/button";

// import { listPorts, requestPort } from "@/utils/serial";
import { addConnection, resetGraph } from "@/utils/pathfinding";

import { useParams } from "react-router-dom";
import { Icons } from "../icons";
import { useSerial } from "@/contexts/SerialContext";
import { useEffect } from "react";
// import { getReader, getWriter, requestPort } from "@/utils/serial";

export function CableUndefined() {
	return (
		<h1 className="relative flex flex-row items-baseline text-2xl font-bold">
			<span className="sr-only">CableUndefined</span>
			<span className="tracking-tight hover:cursor-pointer text-primary">
				Cable
				<span className="text-muted-foreground hover:text-primary">Undefined</span>
			</span>
			<sup className="absolute left-[calc(100%+.1rem)] top-0 text-xs font-bold text-black hidden">
				[BETA]
			</sup>
		</h1>
	);
}

export function Applayout() {
	const { id } = useParams();

	const user = useAppSelector(selectUser);
	const diagram = useAppSelector(state => selectDiagramById(state, id || ""));

	const dispatch = useAppDispatch();
	const [logoutMutation, { isLoading, isError }] = useLogoutMutation();

	const location = useLocation();
	const match = useMatch("/dashboard/:id");

	const { toast } = useToast();

	const navigate = useNavigate();

	const { connect, write, portState, disconnect } = useSerial();

	const handleLogout = () => {
		try {
			logoutMutation()
				.unwrap()
				.then(() => {
					dispatch(logout());
					dispatch(setOpenProfile(false));
					toast({
						title: "Success",
						description: "Logged out successfully",
					});
					navigate("/login");
				});
			toast({
				title: "Logging out...",
				description: "Please wait",
				action: <Icons.spinner className="animate-spin h-6 w-6" />,
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "An error occurred while logging out",
				variant: "destructive",
			});
		}
	};

	const stateStyles = {
		closed: { bgColor: "bg-red-500", text: "Closed" },
		opening: { bgColor: "bg-red-500", text: "Opening..." },
		closing: { bgColor: "bg-yellow-500", text: "Closing..." },
		open: { bgColor: "bg-yellow-500", text: "Open" },
		ready: { bgColor: "bg-green-500", text: "Ready" },
	};

	const { bgColor, text } = stateStyles[portState] || {
		bgColor: "bg-red-500",
		text: "Error",
	};

	// useEffect(() => {
	// 	if (portState === "ready") {
	// 		resetGraph();

	// 		(diagram?.connections || []).forEach(async connection => {
	// 			let result = addConnection(connection);

	// 			if (result.connections.length === 0) {
	// 				toast({
	// 					title: "Connection Error",
	// 					description: `No connections found for ${connection[0]} to ${connection[1]}`,
	// 					variant: "destructive",
	// 				});
	// 				return;
	// 			}

	// 			await write(result.connections.join("\n") + "\n");
	// 		});
	// 	}
	// }, [portState]);

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
								<span className="text-5xl font-thin text-muted-foreground">/</span>
							</BreadcrumbSeparator>
							<BreadcrumbItem>
								<UserCombobox />
							</BreadcrumbItem>
							{match && location.pathname !== "/dashboard/new" && (
								<>
									<BreadcrumbSeparator>
										<span className="text-5xl font-thin text-muted-foreground">/</span>
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
					{match && location.pathname !== "/dashboard/new" && (
						<DropdownMenu>
							<DropdownMenuTrigger>
								<div className="flex items-center gap-3 font-bold px-4 py-2 bg-gray-100 rounded-md dark:bg-gray-800">
									<span
										className={`w-3 h-3 rounded-full ${bgColor} flex items-center justify-center`}></span>
									<span className="dark:text-white">{text}</span>
								</div>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem className="w-full">
									<Button
										className="w-full"
										onClick={async () => {
											try {
												if (portState === "open" || portState === "ready") {
													await disconnect();

													// ! When trying to reconnect to the same port, it fails because disconnect() is not awaited ???
													// TODO: check this
													const success = await connect();

													if (!success) {
														toast({
															title: "Error",
															description:
																"Failed to connect to the port. Are you sure you selected a port?",
															variant: "destructive",
														});
														return;
													}
												} else {
													const success = await connect();

													if (!success) {
														toast({
															title: "Error",
															description:
																"Failed to connect to the port. Are you sure you selected a port?",
															variant: "destructive",
														});
														return;
													}
												}
											} catch (error) {
												console.error(error);
												toast({
													title: "Error",
													description: (error as Error).message,
													variant: "destructive",
												});
											}
										}}>
										{portState === "closed" ? "Open device port" : "Change device port"}
									</Button>
								</DropdownMenuItem>
								{portState !== "closed" && (
									<DropdownMenuItem className="w-full">
										<Button
											className="w-full"
											onClick={async () => {
												try {
													await disconnect();
												} catch (error) {
													console.error(error);
													toast({
														title: "Error",
														description: (error as Error).message,
														variant: "destructive",
													});
												}
											}}>
											Close device port
										</Button>
									</DropdownMenuItem>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					)}

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
									<p className="text-sm font-medium leading-none">@{user.username}</p>
									<p className="text-xs leading-none text-muted-foreground">
										{user.email}
									</p>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuItem onClick={() => dispatch(setOpenProfile(true))}>
								<User className="mr-2 h-4 w-4" />
								<span>Profile</span>
							</DropdownMenuItem>
							{/* <DropdownMenuItem>
								<CreditCard className="mr-2 h-4 w-4" />
								<span>Billing</span>
							</DropdownMenuItem> */}
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
