import * as React from "react";

import { cn } from "../../lib/utils";
import { Icons } from "../icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";
import {
	Form,
	FormControl,
	FormMessage,
	FormLabel,
	FormField,
	FormItem,
} from "../ui/form";

import { useRegisterMutation } from "../../redux/features/auth/auth-api-slice";

import { useForm, SubmitHandler } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams } from "react-router-dom";

const schema = z
	.object({
		username: z.string().regex(/^[a-zA-Z0-9]+$/, {
			message:
				"Username must only contain letters and numbers, no spaces or special characters",
		}),

		email: z.string().email(),
		password: z
			.string()
			.regex(/^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9]).{6,})\S$/, {
				message:
					"Password must contain at least 6 characters, one uppercase letter, one lowercase letter, and one number",
			}),

		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type FormValues = z.infer<typeof schema>;

interface UserRegisterFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserRegisterForm({
	className,
	...props
}: UserRegisterFormProps) {
	const { toast } = useToast();

	const [signUp, { isLoading }] = useRegisterMutation();

	const searchParams = useSearchParams();

	const form = useForm<FormValues>({
		resolver: zodResolver(schema),

		defaultValues: {
			username: searchParams[0].get("username") ?? "",
			email: searchParams[0].get("email") ?? "",
			password: searchParams[0].get("password") ?? "",
			confirmPassword: searchParams[0].get("confirmPassword") ?? "",
		},
	});

	const onSubmit: SubmitHandler<FormValues> = async (data: FormValues) => {
		try {
			await signUp({
				email: data.email,
				password: data.password,
				username: data.username,
			}).unwrap();

			toast({
				title: "Account created.",
				description: "We've created your account for you.",
			});
		} catch (error) {
			toast({
				title: "An error occurred.",
				description: "Unable to create your account.",
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
								name="username"
								render={({ field, formState }) => (
									<FormItem>
										<FormLabel className="sr-only">
											Username
										</FormLabel>
										<FormControl>
											<Input
												id="username"
												placeholder="Username"
												type="text"
												autoCapitalize="none"
												autoComplete="username"
												autoCorrect="off"
												disabled={isLoading}
												{...field}
											/>
										</FormControl>
										<FormMessage>
											{formState.errors.username?.message}
										</FormMessage>
									</FormItem>
								)}
							/>
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
							<FormField
								control={form.control}
								name="confirmPassword"
								render={({ field, formState }) => (
									<FormItem>
										<FormLabel className="sr-only">
											Confirm Password
										</FormLabel>
										<FormControl>
											<Input
												id="confirm-password"
												placeholder="Confirm Password"
												type="password"
												autoCapitalize="none"
												autoComplete="current-password"
												autoCorrect="off"
												disabled={isLoading}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<Button disabled={isLoading}>
							{isLoading && (
								<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
							)}
							Create Account
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
