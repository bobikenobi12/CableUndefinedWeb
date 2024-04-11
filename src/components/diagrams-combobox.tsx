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
	CommandSeparator,
} from "@/components/ui/command";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { useLazyGetDiagramsQuery } from "@/redux/features/diagrams/diagrams-api-slice";
import { useAppSelector } from "@/redux/hooks";
import {
	selectDiagrams,
	selectDiagramById,
} from "@/redux/features/diagrams/diagrams-slice";

import type { Diagram } from "@/types/diagrams";

import { useNavigate, useParams } from "react-router-dom";
import { Skeleton } from "./ui/skeleton";

import { resetGraph } from "@/utils/pathfinding";

export function DiagramsCombobox() {
	const { id } = useParams();

	const [getDiagrams, { isLoading }] = useLazyGetDiagramsQuery();

	const diagrams = useAppSelector(selectDiagrams);
	const currentDiagramBySelector = useAppSelector((state) =>
		selectDiagramById(state, id ?? "")
	);
	const [open, setOpen] = React.useState(false);
	const [currentDiagram, setCurrentDiagram] = React.useState<Diagram>();

	const navigate = useNavigate();

	React.useLayoutEffect(() => {
		if (id) {
			if (!currentDiagramBySelector) {
				try {
					getDiagrams();
				} catch (error) {
					navigate("/not-found", { replace: true });
				}
			}
			setCurrentDiagram(currentDiagramBySelector);
		} else {
			navigate("/dashboard");
		}
	}, [diagrams]);

	React.useEffect(() => {
		resetGraph();
	}, []);

	if (isLoading) {
		return <Skeleton className="w-[220px] h-10" />;
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					role="combobox"
					aria-expanded={open}
					className="w-[220px] justify-between p-0"
				>
					<div className="flex items-center gap-2 w-full">
						<div
							className="mr-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-primary
						 p-0 font-bold text-primary-foreground"
						>
							<span>
								{currentDiagram
									? currentDiagram.name.charAt(0)
									: "D"}
							</span>
						</div>
						<span className="line-clamp-1 font-semibold">
							{currentDiagram
								? currentDiagram.name
								: "Select diagram"}
						</span>
					</div>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 mr-3" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[220px] p-0">
				<Command>
					<CommandInput placeholder="Search diagram..." />
					<CommandList>
						<CommandEmpty>No diagram found.</CommandEmpty>

						<CommandGroup
							heading="Diagrams"
							className="data-[disabled]:pointer-events-none"
						>
							{diagrams.map((diagram) => (
								<CommandItem
									key={diagram._id}
									value={diagram.name}
									onSelect={() => {
										navigate(`/dashboard/${diagram._id}`);
										setCurrentDiagram(diagram);
										resetGraph();
										setOpen(false);
									}}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4 shrink-0 opacity-50",
											diagram._id === currentDiagram?._id
												? "opacity-100"
												: "opacity-0"
										)}
									/>
									{diagram.name}
								</CommandItem>
							))}
						</CommandGroup>
						<CommandSeparator />
						<CommandGroup>
							<CommandItem
								onSelect={() => {
									setOpen(false);
									navigate("/dashboard/new");
								}}
							>
								<Plus className="mr-2 h-4 w-4" />
								Create new diagram
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
