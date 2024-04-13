import { useCallback, useEffect, useMemo, useState } from "react";

import ReactFlow, {
	MiniMap,
	Controls,
	Handle,
	Position,
	applyNodeChanges,
	Node,
	NodeProps,
	NodeChange,
} from "reactflow";

import {
	ContextMenu,
	ContextMenuTrigger,
	ContextMenuContent,
	ContextMenuItem,
} from "@/components/ui/context-menu";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";

import { useToast } from "../ui/use-toast";

import DiagramPart from "./diagram-part";
import { RenameElementForm } from "@/components/canvas/rename-element";

import {
	partsApiSlice,
	useRemovePartMutation,
} from "@/redux/features/parts/parts-api-slice";

import { partMappings } from "@/types/wokwi-elements-mapping";

import type { Part } from "@/types/parts";
import type { Diagram } from "@/types/diagrams";

type ReactFlowNode = Node<Part>;

function PartUpdaterNode(props: NodeProps<Part>) {
	// console.log(props.data);
	// data includes label and ...part
	// i need to get rid of the label
	return (
		<>
			<Handle type="target" position={Position.Top} />
			<DiagramPart
				part={{
					angle: props.data.angle,
					id: props.data.id,
					name: props.data.name,
					x: props.data.x,
					y: props.data.y,
					locked: props.data.locked,
				}}
			/>
			<Handle type="source" position={Position.Bottom} />
		</>
	);
}

export default function CanvasFlow({ diagram }: { diagram: Diagram }) {
	const nodeTypes = useMemo(() => ({ partUpdater: PartUpdaterNode }), []);

	const [nodes, setNodes] = useState<ReactFlowNode[]>([]);

	const onNodesChange = useCallback(
		(changes: NodeChange[]) => {
			console.log(changes);
			setNodes((nodes) => applyNodeChanges<Part>(changes, nodes));
		},
		[setNodes]
	);

	const [removePart, { isLoading: isRemovingPart }] = useRemovePartMutation();

	const { toast } = useToast();

	useEffect(() => {
		if (diagram) {
			console.log(diagram, "diagram changed");
			setNodes(
				diagram.parts.map((part) => ({
					id: part.id,
					type: "partUpdater",
					data: {
						label: part.name,
						...part,
					},
					position: {
						x: part.x,
						y: part.y,
					},
				}))
			);
		}
	}, [diagram]);

	return (
		<div className="flex-1 relative h-full w-full">
			<ReactFlow
				panOnScroll={true}
				panOnDrag={true}
				nodesDraggable={true}
				// elementsSelectable
				fitView
				nodes={nodes}
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
			>
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
														_id: part.id,
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
										part={part}
										initialName={part.name}
									/>
								</DialogContent>
							</Dialog>
						</div>

						// </KeepScale>
					))}
				<MiniMap />
				<Controls />
			</ReactFlow>
		</div>
	);
}
