import { useCallback, useEffect, useMemo, useState } from "react";

import ReactFlow, {
	MiniMap,
	Controls,
	Background,
	Handle,
	Position,
	applyNodeChanges,
	Node,
	NodeProps,
	NodeChange,
	BackgroundVariant,
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
import {
	LitElementWrapper,
	RenameElementForm,
} from "@/components/canvas/rename-element";

import {
	partsApiSlice,
	useRemovePartMutation,
	useUpdatePartMutation,
} from "@/redux/features/parts/parts-api-slice";

import { partMappings } from "@/types/wokwi-elements-mapping";

import type { Part } from "@/types/parts";
import type { Diagram } from "@/types/diagrams";
import { Icons } from "../icons";

type ReactFlowNode = Node<Part>;

function PartUpdaterNode(props: NodeProps<Part>) {
	// console.log(props.data);
	// data includes label and ...part
	// i need to get rid of the label

	const [removePart, { isLoading: isRemovingPart }] = useRemovePartMutation();

	const { toast } = useToast();

	return (
		<>
			<Handle type="target" position={Position.Top} />
			<Dialog>
				<ContextMenu>
					<ContextMenuTrigger>
						<LitElementWrapper
							part={{
								angle: props.data.angle,
								id: props.data.id,
								name: props.data.name,
								x: props.data.x,
								y: props.data.y,
								locked: props.data.locked,
							}}
						/>
					</ContextMenuTrigger>
					<ContextMenuContent className="w-48">
						<ContextMenuItem>
							<DialogTrigger asChild>
								<ContextMenuItem>Rename</ContextMenuItem>
							</DialogTrigger>
						</ContextMenuItem>
						<ContextMenuItem>Move up</ContextMenuItem>
						<ContextMenuItem>Rotate</ContextMenuItem>
						<ContextMenuItem
							onClick={() => {
								try {
									removePart({
										_id: props.data.id,
										partId: props.data.id,
									})
										.unwrap()
										.then(() => {
											toast({
												title: "Element removed",
												description: `Removed ${props.data.name} from canvas`,
											});
										});
									toast({
										title: `Removing element`,
										description: `Removing ${props.data.name} from canvas`,
										action: (
											<Icons.spinner className="animate-spin h-5 w-5" />
										),
									});
								} catch (error) {
									toast({
										variant: "destructive",
										title: "Failed to remove element",
										description: error as string,
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
						<DialogTitle>Rename Element</DialogTitle>
						<DialogDescription>
							Enter a new name for the element
						</DialogDescription>
					</DialogHeader>
					<RenameElementForm
						part={{
							angle: props.data.angle,
							id: props.data.id,
							name: props.data.name,
							x: props.data.x,
							y: props.data.y,
							locked: props.data.locked,
						}}
						initialName={props.data.name}
					/>
				</DialogContent>
			</Dialog>
			<div className="flex items-center space-x-2">{props.data.name}</div>
			<Handle type="source" position={Position.Bottom} />
		</>
	);
}

export default function CanvasFlow({ diagram }: { diagram: Diagram }) {
	const nodeTypes = useMemo(() => ({ partUpdater: PartUpdaterNode }), []);

	const [nodes, setNodes] = useState<ReactFlowNode[]>([]);

	const onNodesChange = useCallback(
		(changes: NodeChange[]) => {
			setNodes((nodes) => applyNodeChanges<Part>(changes, nodes));
		},
		[setNodes]
	);

	const [updatePart, { isLoading: isUpdatingPart }] = useUpdatePartMutation();

	const { toast } = useToast();

	useEffect(() => {
		if (diagram) {
			console.log(diagram);
			setNodes(
				diagram.parts.map(
					(part) =>
						({
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
						} as ReactFlowNode)
				)
			);
		}
	}, [diagram, setNodes]);

	return (
		<div className="flex-1 relative h-full">
			<ReactFlow
				panOnScroll={true}
				panOnDrag={true}
				nodesDraggable={true}
				// elementsSelectable
				fitView
				nodes={nodes}
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
				onNodeDragStop={(event, node) => {
					console.log(node, event);
					try {
						updatePart({
							diagramId: diagram._id,
							partId: node.data.id,
							update: {
								x: node.position.x,
								y: node.position.y,
								angle: node.data.angle,
								locked: node.data.locked,
								name: node.data.name,
							},
						})
							.unwrap()
							.then((res) => {
								toast({
									title: "Element moved",
									description: `Element "${
										node.data.name
									}" moved to ${node.position.x.toFixed(
										2
									)}, ${node.position.y.toFixed(2)}`,
								});
							});
					} catch (error) {
						toast({
							variant: "destructive",
							title: "Failed to move element",
							description: error as string,
						});
					}
				}}
			>
				<MiniMap />
				<Controls />
				{/* <Background color="#fff" gap={12} /> */}
			</ReactFlow>
		</div>
	);
}
