import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { formatDate } from "@/utils/dates";

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

import { useToast } from "./ui/use-toast";

import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
	useUpdateUserMutation,
	useDeleteUserMutation,
} from "@/redux/features/auth/auth-api-slice";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
	selectUser,
	selectOpenDeleteProfile,
	setOpenDeleteProfile,
	selectOpenProfile,
	setOpenProfile,
	setOpenUpdateProfile,
	selectOpenUpdateProfile,
} from "@/redux/features/auth/auth-handler-slice";

import { ModeToggle } from "./mode-toggle";

const updateUserSchema = z.object({
	username: z.string().min(3, {
		message: "Username must be at least 3 characters long",
	}),
});

const deleteUserSchema = z.object({
	password: z.string().min(8, {
		message: "Password must be at least 8 characters long",
	}),
});

type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
type DeleteUserFormValues = z.infer<typeof deleteUserSchema>;

function ProfileStripe({
	header,
	children,
}: {
	header: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="border-b">
				<h2>{header}</h2>
			</div>
			<div className="flex flex-row items-center justify-between">
				{children}
			</div>
		</div>
	);
}

export function DeleteProfile() {
	const openDelete = useAppSelector(selectOpenDeleteProfile);
	const { toast } = useToast();

	const dispatch = useAppDispatch();
	const [deleteUser, { isLoading, isError }] = useDeleteUserMutation();

	const form = useForm<DeleteUserFormValues>({
		resolver: zodResolver(deleteUserSchema),
		defaultValues: {
			password: "",
		},
	});

	const onSubmit: SubmitHandler<DeleteUserFormValues> = async (data) => {
		try {
			await deleteUser({
				password: data.password,
			}).unwrap();
			toast({
				title: "Account Deleted",
				description: "Your account has been successfully deleted.",
			});
		} catch (error) {
			toast({
				title: "An error occurred.",
				description: "Unable to delete your account.",
				variant: "destructive",
			});
		}
	};

	return (
		<Dialog
			open={openDelete}
			onOpenChange={(isOpen) => dispatch(setOpenDeleteProfile(isOpen))}
		>
			{/* <DialogTrigger>
				<Button variant="destructive">
					<span>Delete</span>
					<span className="hidden sm:block"> Account</span>
				</Button>
			</DialogTrigger> */}
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						Are you sure you want to delete your account?
					</DialogTitle>
					<DialogDescription>
						This action cannot be undone. This will remove your
						account as well as any diagrams associated with it.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="password"
							disabled={isLoading}
							render={({ field, formState }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input
											id="password"
											type="password"
											autoComplete="current-password"
											{...field}
										/>
									</FormControl>
									<FormMessage>
										{formState.errors.password?.message}
									</FormMessage>
								</FormItem>
							)}
						/>
					</form>
				</Form>
				<DialogFooter>
					<Button
						variant="ghost"
						disabled={isLoading}
						onClick={() => {
							dispatch(setOpenDeleteProfile(false));
							form.reset();
						}}
					>
						Cancel
					</Button>
					<Button
						disabled={isLoading}
						variant="destructive"
						onClick={form.handleSubmit(onSubmit)}
					>
						Delete Account
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function Profile() {
	const user = useAppSelector(selectUser);
	const openProfile = useAppSelector(selectOpenProfile);

	const dispatch = useAppDispatch();

	return (
		<>
			<Dialog
				open={openProfile}
				onOpenChange={(isOpen) => dispatch(setOpenProfile(isOpen))}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Account</DialogTitle>
						<DialogDescription>
							Manage your account information
						</DialogDescription>
					</DialogHeader>

					<div className="mt-4 space-y-4">
						<ProfileStripe header="Profile">
							<span className="relative flex shrink-0 overflow-hidden rounded-full h-16 w-16">
								<img
									className="aspect-square h-full w-full"
									alt="Profile Image"
									src="https://images.clerk.dev/oauth_github/img_2Phl0Zuonoq3M8XXD6GV1jKveyF.png"
								/>
							</span>
							<div className="flex flex-col gap-1">
								<p>{user.username}</p>
								<p className="text-muted-foreground">
									{formatDate(user.createdAt)}
								</p>
							</div>
						</ProfileStripe>
						<ProfileStripe header="Email Addresses">
							<div className="flex w-full flex-row items-center justify-between gap-2">
								<div className="flex flex-row gap-1">
									<p className="text-sm">{user.email}</p>
									<span className="rounded bg-primary-foreground px-1.5 text-xs font-bold text-primary dark:bg-primary dark:text-primary-foreground">
										Primary
									</span>
								</div>
							</div>
						</ProfileStripe>
						<ProfileStripe header="Appearance">
							<div className="flex flex-col gap-1">
								<p className="text-sm">Theme</p>
								<p className="text-xs text-muted-foreground">
									Change the appearance of the app
								</p>
							</div>
							<ModeToggle />
						</ProfileStripe>

						<ProfileStripe header="Danger Zone">
							<div className="flex flex-col gap-1">
								<p className="text-sm">Delete your account</p>
								<p className="text-xs text-muted-foreground">
									Delete your account and all its associated
									data.
								</p>
							</div>
							<Button
								variant="destructive"
								onClick={() => {
									dispatch(setOpenDeleteProfile(true));
								}}
							>
								<span>Delete</span>
								<span className="hidden sm:block">
									{" "}
									Account
								</span>
							</Button>
						</ProfileStripe>
					</div>
				</DialogContent>
			</Dialog>
			<DeleteProfile />
		</>
	);
}
