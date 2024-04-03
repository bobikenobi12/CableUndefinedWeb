import { cn } from "../../lib/utils";
import { buttonVariants } from "../../components/ui/button";

import { UserLoginForm } from "./user-login-form";
import { UserRegisterForm } from "./user-register-form";
import { Link } from "react-router-dom";

interface Props {
	register?: boolean;
}

export function UserAuthPage({ register }: Props) {
	return (
		<>
			<div className="container relative h-screen flex flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
				<Link
					to={register ? "/login" : "/register"}
					className={cn(
						buttonVariants({ variant: "ghost" }),
						"absolute right-4 top-4 md:right-8 md:top-8"
					)}
				>
					{register ? "Login" : "Create an account"}
				</Link>
				<div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
					<div className="absolute inset-0 bg-zinc-900" />
					<div className="relative z-20 flex items-center text-lg font-medium">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="mr-2 h-6 w-6"
						>
							<path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
						</svg>
						Cable Undefined
					</div>
					<div className="relative z-20 mt-auto">
						<blockquote className="space-y-2">
							<p className="text-lg">
								&ldquo;This project has saved me countless hours
								of work and helped me deliver a better
								product.&rdquo;
							</p>
							<footer className="text-sm">Garistov</footer>
						</blockquote>
					</div>
				</div>
				<div className="lg:p-8">
					<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
						<div className="flex flex-col space-y-2 text-center">
							<h1 className="text-2xl font-semibold tracking-tight">
								{register
									? "Create an account"
									: "Welcome back"}
							</h1>
							<p className="text-sm text-muted-foreground">
								{register ? (
									<>
										Enter your email below to create your
										account
									</>
								) : (
									<>Log in to your account to continue.</>
								)}
							</p>
						</div>
						{register ? <UserRegisterForm /> : <UserLoginForm />}
						{register ? (
							<p className="px-8 text-center text-sm text-muted-foreground">
								By clicking continue, you agree to our{" "}
								<Link
									to="/terms"
									className="underline underline-offset-4 hover:text-primary"
								>
									Terms of Service
								</Link>{" "}
								and{" "}
								<Link
									to="/privacy"
									className="underline underline-offset-4 hover:text-primary"
								>
									Privacy Policy
								</Link>
								.
							</p>
						) : (
							<p className="px-8 text-center text-sm text-muted-foreground">
								Not on CableUndefined?{" "}
								<Link
									to="/register"
									className="underline underline-offset-4 hover:text-primary"
								>
									Create an account
								</Link>
							</p>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
