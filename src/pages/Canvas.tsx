import React, { useEffect } from "react";
import "@b.borisov/cu-elements";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
	ContextMenu,
	ContextMenuCheckboxItem,
	ContextMenuContent,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";

import { useToast } from "@/components/ui/use-toast";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
	toggleGrid,
	getShowGrid,
	getAllElements,
	addElement,
	deleteElement,
} from "@/redux/features/diagrams/wokwi-elements-slice";

import { useAddPartMutation } from "@/redux/features/parts/parts-api-slice";

import ElementContextMenu from "@/components/canvas/element-context.menu";

import { partMappings } from "@/types/wokwi-elements-mapping";
import { Button } from "@/components/ui/button";

import { useParams } from "react-router-dom";

import "@b.borisov/cu-elements";

const Canvas: React.FC = () => {
	const { id } = useParams();

	const elements = useAppSelector(getAllElements);
	const showGrid = useAppSelector(getShowGrid);

	const [addPart, { isLoading: isLoadingAddPartMutation }] =
		useAddPartMutation();

	const { toast, dismiss } = useToast();
	const dispatch = useAppDispatch();

	const handleCustomEvent = (event: CustomEvent) => {
		console.log("Custom event caught!", event.detail);
		// Do something with the event data
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
									console.error(error);
								}
							}}
						>
							{name}
						</div>
					))}
				</ScrollArea>
			</div>
			<div className="flex-1 relative" id="canvas">
				<ContextMenu>
					<ContextMenuTrigger>
						<div
							className={`flex-1 ${showGrid ? "scene-grid" : ""}`}
						>
							{elements.map((element, idx) => (
								// <KeepScale>
								<ElementContextMenu
									key={idx}
									element={element}
									idx={idx}
								/>

								// </KeepScale>
							))}
						</div>
					</ContextMenuTrigger>
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
				</ContextMenu>
			</div>
		</div>
	);
};

export default Canvas;
