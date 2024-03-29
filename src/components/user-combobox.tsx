import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { useAppSelector } from "@/redux/hooks";
import { selectUser } from "@/redux/features/auth/auth-handler-slice";

import { useNavigate } from "react-router-dom";

export function UserCombobox() {
	const user = useAppSelector(selectUser);
	const [open, setOpen] = React.useState(false);

	const navigate = useNavigate();

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					role="combobox"
					aria-expanded={open}
					className="w-[220px] justify-between p-0"
				>
					<div className="flex items-center gap-2">
						<span className="mr-1 flex h-8 w-8 flex-shrink-0 items-center justify-center">
							<img
								className="aspect-square h-full w-full rounded-md"
								alt="User Avatar"
								src="https://images.clerk.dev/oauth_github/img_2Phl0Zuonoq3M8XXD6GV1jKveyF.png"
							/>
						</span>
						<span className="line-clamp-1 font-semibold">
							{user?.username ?? "User"}
						</span>
					</div>

					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 mr-3" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[220px] p-0">
				<Command>
					<CommandInput placeholder="Search workspace..." />
					<CommandList>
						<CommandEmpty>No user found</CommandEmpty>

						<CommandGroup heading="Personal account">
							<CommandItem
								onSelect={() => {
									setOpen(false);
									navigate("/dashboard");
								}}
								className="justify-between"
							>
								<div className="flex items-center gap-2">
									<span className="mr-1 flex h-5 w-5 flex-shrink-0 items-center justify-center">
										<img
											className="aspect-square h-full w-full rounded-full"
											alt="User Avatar"
											src="https://images.clerk.dev/oauth_github/img_2Phl0Zuonoq3M8XXD6GV1jKveyF.png"
										/>
									</span>
									<span className="truncate">
										{user?.username ?? "User"}
									</span>
								</div>
								<Check className="mr-2 h-4 w-4 shrink-0" />
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
