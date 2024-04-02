import React, { useEffect } from "react";
import "@b.borisov/cu-elements";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
	ContextMenu,
	ContextMenuItem,
	ContextMenuCheckboxItem,
	ContextMenuContent,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";

import { useToast } from "@/components/ui/use-toast";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
	toggleGrid,
	getShowGrid,
	deleteElement,
} from "@/redux/features/diagrams/wokwi-elements-slice";

import { selectDiagramById } from "@/redux/features/diagrams/diagrams-slice";

import {
	useAddPartMutation,
	useRemovePartMutation,
} from "@/redux/features/parts/parts-api-slice";

import ElementContextMenu, {
	LitElementWrapper,
	RenameElementForm,
} from "@/components/canvas/element-context.menu";

import { partMappings } from "@/types/wokwi-elements-mapping";
import { Button } from "@/components/ui/button";

import { useParams } from "react-router-dom";
import DiagramPart from "@/components/canvas/diagram-part";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogTrigger,
} from "@/components/ui/dialog";

import { partTagsToConnectionStrings } from "@/types/wokwi-elements-mapping";
import { Connection } from "@/types/connections";

export default function Canvas(): JSX.Element {
	const { id } = useParams();

	const [removePart, { isLoading: isLoadingRemovePartMutation }] =
		useRemovePartMutation();

	const diagram = useAppSelector((state) =>
		selectDiagramById(state, id as string)
	);
	const showGrid = useAppSelector(getShowGrid);

	const [addPart, { isLoading: isLoadingAddPartMutation }] =
		useAddPartMutation();

	const { toast, dismiss } = useToast();
	const dispatch = useAppDispatch();

	const handleCustomEvent = (event: CustomEvent) => {
		const { pin, index } = event.detail;
		const { elementName, pinName, x, y } = pin;
		const connection = partTagsToConnectionStrings[elementName];
		if (connection) {
			console.log("Connection", connection, pinName, x, y, index);
		}
	};

	useEffect(() => {
		document.addEventListener(
			"pin-click",
			handleCustomEvent as EventListener
		);

		return () => {
			document.removeEventListener(
				"pin-click",
				handleCustomEvent as EventListener
			);
		};
	}, []);

	useEffect(() => {
		if (isLoadingRemovePartMutation) {
			toast({
				title: "Removing element",
				description: `Removing ${id} from canvas`,
			});
		}
	}, [isLoadingRemovePartMutation]);

	useEffect(() => {
		if (!isLoadingRemovePartMutation) {
			setTimeout(() => {
				dismiss();
			}, 3000);
		}
	}, [isLoadingRemovePartMutation]);

	return (
		<div className="mx-auto flex max-w-7xl grow py-6">
			<div className="flex flex-col w-fit-content p-2 space-y-2">
				<h1 className="text-2xl font-bold text-center p-2 bg-gray-100 rounded-md dark:bg-gray-800">
					Choose Elements:
				</h1>
				<ScrollArea
					className="flex flex-col items-center overflow-y-auto whitespace-nowrap rounded-md border h-[80vh] dark:border-gray-800"
					aria-orientation="vertical"
				>
					{Object.entries(partMappings).map(([name], idx) => (
						<div
							key={idx}
							className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer select-none dark:hover:bg-gray-800"
							onClick={() => {
								try {
									addPart({
										_id: id as string,
										part: {
											name,
											angle: 0,
											x: 0,
											y: 0,
											locked: false,
										},
									});
									toast({
										title: "Element added",
										action: (
											<Button
												onClick={() => {
													dispatch(
														deleteElement(idx)
													);
													dismiss();
												}}
											>
												Undo
											</Button>
										),
										description: `Added ${name} to canvas`,
									});
								} catch (error) {
									toast({
										variant: "destructive",
										title: "Failed to add element",
										description: error as string,
									});
								}
							}}
						>
							{name}
						</div>
					))}
				</ScrollArea>
			</div>
			<div
				className={`flex-1 relative ${showGrid ? "scene-grid" : ""}`}
				// id="canvas"
			>
				{/* <ContextMenu>
					<ContextMenuTrigger> */}
				{diagram &&
					diagram.parts.map((part, idx) => (
						// <KeepScale>
						<div key={idx}>
							<Dialog>
								<ContextMenu>
									<ContextMenuTrigger>
										<DiagramPart part={part} />
									</ContextMenuTrigger>
									<ContextMenuContent className="w-48">
										<ContextMenuItem>
											<DialogTrigger asChild>
												<ContextMenuItem>
													Rename
												</ContextMenuItem>
											</DialogTrigger>
										</ContextMenuItem>
										<ContextMenuItem>
											Move up
										</ContextMenuItem>
										<ContextMenuItem>
											Rotate
										</ContextMenuItem>
										<ContextMenuItem
											onClick={() => {
												try {
													removePart({
														_id: id as string,
														partId: part.id,
													});
													toast({
														title: "Element removed",
														description: `Removed ${part.name} from canvas`,
													});
												} catch (error) {
													toast({
														variant: "destructive",
														title: "Failed to remove element",
														description:
															error as string,
													});
												}
											}}
											className="hover:text-red-500 cursor-pointer"
										>
											Remove
										</ContextMenuItem>
									</ContextMenuContent>
								</ContextMenu>
								<DialogContent className="sm:max-w-md">
									<DialogHeader>
										<DialogTitle>
											Rename Element
										</DialogTitle>
										<DialogDescription>
											Enter a new name for the element
										</DialogDescription>
									</DialogHeader>
									<RenameElementForm
										id={part.id}
										initialName={part.name}
									/>
								</DialogContent>
							</Dialog>
						</div>

						// </KeepScale>
					))}
				{/* </ContextMenuTrigger>
					<ContextMenuContent>
						<ContextMenuCheckboxItem
							checked={showGrid}
							onCheckedChange={() => dispatch(toggleGrid())}
						>
							<div className="flex items-center space-x-2">
								Show Grid <div className="RightSlot">⌘+'</div>
							</div>
						</ContextMenuCheckboxItem>
					</ContextMenuContent>
				</ContextMenu> */}
			</div>
		</div>
	);
}
