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
	selectDiagramConnections,
	selectPartsByDiagramId,
	updatePartState,
} from "@/redux/features/diagrams/diagrams-slice";
import { partTagsToConnectionStrings } from "@/types/wokwi-elements-mapping";
import { addConnection } from "@/utils/pathfinding";
import { Pin } from "@/types/connections";
import { useSerial } from "@/contexts/SerialContext";
import {
	useCreateConnectionMutation,
	useDeleteConnectionMutation,
} from "@/redux/features/connections/connections-api-slice";

type ReactFlowNode = Node<Part>;

function PartUpdaterNode(props: NodeProps<Part>) {
	// console.log(props.data);
	// data includes label and ...part
	// i need to get rid of the label

	const { toast } = useToast();

	return (
		<>
			<Handle type="target" position={Position.Top} />
			<div
				className={`${
					props.data.locked ? "bg-red-500" : "bg-green-500"
				} ${
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
			<Handle type="source" position={Position.Bottom} />
		</>
	);
}

export default function CanvasFlow({ diagram }: { diagram: Diagram }) {
	const nodeTypes = useMemo(() => ({ partUpdater: PartUpdaterNode }), []);

	const [nodes, setNodes] = useState<ReactFlowNode[]>([]);
	const [connection, setConnection] = useState<{
		0: Pin | "";
		1: Pin | "";
	}>({
		0: "",
		1: "",
	});

	const { portState, write } = useSerial();

	const onNodesChange = useCallback(
		(changes: NodeChange[]) => {
			setNodes(nodes => applyNodeChanges<Part>(changes, nodes));
		},
		[setNodes]
	);

	const [updatePart, { isLoading: isUpdatingPart }] = useUpdatePartMutation();
	const [removePart, { isLoading: isRemovingPart }] = useRemovePartMutation();

	const [removeConnection, { isLoading: isLoadingRemoveConnectionMutation }] =
		useDeleteConnectionMutation();
	const [createConnection, { isLoading: isLoadingCreateConnectionMutation }] =
		useCreateConnectionMutation();

	const { toast } = useToast();

	const handleCustomEvent = (event: CustomEvent) => {
		const { pin } = event.detail;
		const { elementName, pinName, x, y } = pin;
		const type = partTagsToConnectionStrings[pinName];

		console.log(diagram.connections, "connections");
		const connection = diagram.connections?.find(
			c =>
				c[0] === ((type + elementName) as Pin) ||
				c[1] === ((type + elementName) as Pin)
		);

		if (connection) {
			console.log(connection);
			removeConnection({
				diagramId: diagram._id,
				connection: connection,
			})
				.unwrap()
				.then(() => {
					toast({
						title: "Connection removed",
						description: `Removed connection between ${connection[0]} and ${connection[1]}`,
					});
				});
			return;
		}

		setConnection(prevConnection => {
			console.log("setting connection");
			// If both pins are empty, set the first pin
			if (prevConnection[0] === "" && prevConnection[1] === "") {
				return { ...prevConnection, 0: (type + elementName) as Pin };
			}

			// If the first pin is clicked again, reset the connection
			if (prevConnection[0] === type + elementName) {
				return { ...prevConnection, 0: "" };
			}

			// If the first pin is not empty and the second pin is empty, set the second pin
			if (prevConnection[0] !== "" && prevConnection[1] === "") {
				return { ...prevConnection, 1: (type + elementName) as Pin };
			}

			// Return previous state if none of the above conditions are met
			return prevConnection;
		});
	};

	useEffect(() => {
		if (connection[0] !== "" && connection[1] !== "") {
			try {
				const result = addConnection([connection[0], connection[1]]);

				if (result.connections.length > 0) {
					createConnection({
						diagramId: diagram._id,
						connection: [connection[0], connection[1]],
					})
						.unwrap()
						.then(() => {
							toast({
								title: "Connection created",
								description: `Connection between ${connection[0]} and ${connection[1]} created`,
							});

							if (portState === "ready") {
								write(result.connections.join("\n") + "\n");
							}

							// TODO: add connection to the diagram or invalidate the diagram and refetch it
						})
						.catch(error => {
							toast({
								variant: "destructive",
								title: "Failed to create connection",
								description: error as string,
							});
						});
				} else {
					toast({
						variant: "destructive",
						title: "Connection Error",
						description: `No connections found from ${connection[0]} to ${connection[1]}`,
					});
				}

				setConnection({ 0: "", 1: "" });
			} catch (error) {
				toast({
					variant: "destructive",
					title: "Failed to create connection",
					description: error as string,
				});
			}
		}
	}, [connection]);

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
	}, [handleCustomEvent]);

	useEffect(() => {
		console.log(diagram.parts, "parts changed");
		if (diagram.parts) {
			console.log(diagram, "diagram changed");
			setNodes(
				diagram.parts.map(part => ({
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
				elementsSelectable={true}
				fitView
				nodes={nodes}
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
				// onNodeDragStop={(event, node) => {
				// 	event.preventDefault();
				// 	// console.log(node);
				// 	console.log({ node, diagramId: diagram._id });
				// 	const { x, y } = node.position;
				// 	console.log(node.data.id, "node id");
				// 	updatePart({
				// 		diagramId: diagram._id,
				// 		partId: node.data.id,
				// 		update: {
				// 			x,
				// 			y,
				// 			angle: 0,
				// 			locked: false,
				// 			name: node.data.name,
				// 		},
				// 	})
				// 		.unwrap()
				// 		.then(res => {
				// 			// dispatch(updatePartState({ diagram: res.diagram }));
				// 			toast({
				// 				title: "Success",
				// 				description: `Part "${node.data.name}" position updated successfully.`,
				// 			});
				// 		})
				// 		.catch(error => {
				// 			toast({
				// 				title: "Error",
				// 				description: "Failed to update part position.",
				// 			});
				// 		});
				// }}
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
