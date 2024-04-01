import * as React from "react";

import { cn } from "../../lib/utils";
import { Icons } from "../icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";
import {
	Form,
	FormMessage,
	FormLabel,
	FormField,
	FormItem,
	FormControl,
} from "../ui/form";

import { useLoginMutation } from "../../redux/features/auth/auth-api-slice";

import { useForm, SubmitHandler } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams, useNavigate } from "react-router-dom";

const schema = z.object({
	email: z.string().email(),
	password: z.string().min(8, {
		message: "Password must be at least 8 characters long",
	}),
});

type FormValues = z.infer<typeof schema>;

interface UserLoginFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserLoginForm({ className, ...props }: UserLoginFormProps) {
	const { toast } = useToast();

	const [login, { isLoading }] = useLoginMutation();

	const navigate = useNavigate();

	const searchParams = useSearchParams();

	const form = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			email: searchParams[0].get("email") ?? "",
			password: searchParams[0].get("password") ?? "",
		},
	});

	const onSubmit: SubmitHandler<FormValues> = async (data: FormValues) => {
		try {
			await login({
				email: data.email,
				password: data.password,
			}).unwrap();
			navigate("/dashboard");

			toast({
				title: "Welcome back!",
				description: "You have successfully logged in.",
			});
		} catch (error) {
			toast({
				title: "An error occurred.",
				description: "Unable to login to your account.",
			});
		}
	};

	return (
		<div className={cn("grid gap-6", className)} {...props}>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className="grid gap-2">
						<div className="grid gap-1">
							<FormField
								control={form.control}
								name="email"
								render={({ field, formState }) => (
									<FormItem>
										<FormLabel className="sr-only">
											Email
										</FormLabel>
										<FormControl>
											<Input
												id="email"
												placeholder="name@example.com"
												type="email"
												autoCapitalize="none"
												autoComplete="email"
												autoCorrect="off"
												disabled={isLoading}
												{...field}
											/>
										</FormControl>
										<FormMessage>
											{formState.errors.email?.message}
										</FormMessage>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field, formState }) => (
									<FormItem>
										<FormLabel className="sr-only">
											Password
										</FormLabel>
										<FormControl>
											<Input
												id="password"
												placeholder="Password"
												type="password"
												autoCapitalize="none"
												autoComplete="current-password"
												autoCorrect="off"
												disabled={isLoading}
												{...field}
											/>
										</FormControl>
										<FormMessage>
											{formState.errors.password?.message}
										</FormMessage>
									</FormItem>
								)}
							/>
						</div>
						<Button disabled={isLoading}>
							{isLoading && (
								<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
							)}
							Log in
						</Button>
					</div>
				</form>
			</Form>
			{/* <div className="relative">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-t" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-background px-2 text-muted-foreground">
						Or continue with
					</span>
				</div>
			</div>
			<Button variant="outline" type="button" disabled={isLoading}>
				{isLoading ? (
					<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
				) : (
					<Icons.gitHub className="mr-2 h-4 w-4" />
				)}{" "}
				Github
			</Button> */}
		</div>
	);
}
