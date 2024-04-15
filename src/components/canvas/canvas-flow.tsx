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

import { useToast } from "../ui/use-toast";

import { LitElementWrapper } from "@/components/canvas/rename-element";

import {
	useRemovePartMutation,
	useUpdatePartMutation,
} from "@/redux/features/parts/parts-api-slice";

import type { Part } from "@/types/parts";
import type { Diagram } from "@/types/diagrams";
import { Icons } from "../icons";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import {
	selectPartsByDiagramId,
	updatePartState,
} from "@/redux/features/diagrams/diagrams-slice";

type ReactFlowNode = Node<Part>;

function PartUpdaterNode(props: NodeProps<Part>) {
	// console.log(props.data);
	// data includes label and ...part
	// i need to get rid of the label

	const { toast } = useToast();

	return (
		<>
			<Handle
				type="target"
				position={Position.Top}
			/>
			<div
				className={`${props.data.locked ? "bg-red-500" : "bg-green-500"} ${
					props.selected ? "border border-dashed border-blue-500" : ""
				}
				h-64 w-64 items-center justify-center
				`}>
				<div className="nodrag">
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
				</div>
			</div>
			<Handle
				type="source"
				position={Position.Bottom}
			/>
		</>
	);
}

export default function CanvasFlow({ diagram }: { diagram: Diagram }) {
	const nodeTypes = useMemo(() => ({ partUpdater: PartUpdaterNode }), []);

	const [nodes, setNodes] = useState<ReactFlowNode[]>([]);

	const parts = useAppSelector(state =>
		selectPartsByDiagramId(state, diagram._id)
	);

	const onNodesChange = useCallback(
		(changes: NodeChange[]) => {
			setNodes(nodes => applyNodeChanges<Part>(changes, nodes));
		},
		[setNodes]
	);

	const [updatePart, { isLoading: isUpdatingPart }] = useUpdatePartMutation();
	const [removePart, { isLoading: isRemovingPart }] = useRemovePartMutation();

	const dispatch = useAppDispatch();

	const { toast } = useToast();

	useEffect(() => {
		console.log(parts, "parts changed");
		if (parts) {
			console.log(diagram, "diagram changed");
			setNodes(
				parts.map(part => ({
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
	}, [parts, diagram, setNodes]);

	return (
		<div className="flex-1 relative h-full">
			<ReactFlow
				panOnScroll={true}
				panOnDrag={true}
				nodesDraggable={true}
				elementsSelectable={true}
				fitView
				nodes={nodes}
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
				onNodeDragStop={(event, node) => {
					event.preventDefault();
					console.log(node);
					const { x, y } = node.position;
					updatePart({
						diagramId: diagram._id,
						partId: node.id,
						update: {
							x,
							y,
							angle: 0,
							locked: false,
							name: node.data.name,
						},
					})
						.unwrap()
						.then(res => {
							// dispatch(updatePartState({ diagram: res.diagram }));
							toast({
								title: "Success",
								description: `Part "${node.data.name}" position updated successfully.`,
							});
						})
						.catch(error => {
							toast({
								title: "Error",
								description: "Failed to update part position.",
							});
						});
				}}
				onNodesDelete={nodes => {
					nodes.forEach(node => {
						removePart({ diagramId: diagram._id, partId: node.id })
							.unwrap()
							.then(res => {
								toast({
									title: "Success",
									description: `Part "${node.data.name}" removed successfully.`,
								});
							})
							.catch(error => {
								toast({
									title: "Error",
									description: "Failed to remove part.",
								});
							});
					});
				}}>
				<MiniMap />
				<Controls />
				{/* <Background color="#fff" gap={12} /> */}
			</ReactFlow>
		</div>
	);
}
