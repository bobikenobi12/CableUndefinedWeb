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

	const [updatePart, { isLoading: isUpdatingPart }] = useUpdatePartMutation();

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
			>
				<MiniMap />
				<Controls />
				{/* <Background color="#fff" gap={12} /> */}
			</ReactFlow>
		</div>
	);
}
