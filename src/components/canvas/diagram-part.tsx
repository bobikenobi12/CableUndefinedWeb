import React, { useEffect, useRef, useState } from "react";

import Draggable, { DraggableData, DraggableEvent } from "react-draggable";

import { useUpdatePartMutation } from "@/redux/features/parts/parts-api-slice";

import type { Part } from "@/types/parts";

import { useParams } from "react-router-dom";
import { toast } from "../ui/use-toast";

import { LitElementWrapper } from "./element-context.menu";

interface PartProps {
	part: Part;
	children?: React.ReactNode;
}

export default function DiagramPart({
	part,
	children,
}: PartProps): JSX.Element {
	const { id: diagramId } = useParams<{ id: string }>();

	const [tempPosition, setTempPosition] = useState({ x: part.x, y: part.y });

	const [updatePart, { isLoading: isLoadingUpdatePartMutation }] =
		useUpdatePartMutation();

	const nodeRef = useRef(null);
	const [rotation, setRotation] = useState(0);

	const handleDrag = (e: DraggableEvent, ui: DraggableData) => {
		const { x, y } = ui;
		setTempPosition({ x, y });
	};

	const handleStop = (e: DraggableEvent, ui: DraggableData) => {
		e.preventDefault();
		if (part) {
			try {
				updatePart({
					_id: diagramId as string,
					part: {
						...part,
						x: tempPosition.x,
						y: tempPosition.y,
					},
				})
					.unwrap()
					.then((res) => {
						// set x and y because currently the part x and y get updated, but the element returns back to its initial spot and a little bit after returns to the new spot
						const foundPart = res.diagram.parts.find(
							(p) => p.id === part.id
						);

						if (foundPart) {
							setTempPosition({ x: foundPart.x, y: foundPart.y });
						}
						toast({
							title: "Part position updated.",
							description: "Part position updated successfully.",
						});
					});
			} catch (error) {
				toast({
					variant: "destructive",
					value: "Failed to update part position.",
				});
			}
		}
	};

	// const handleRotate = () => {
	// 	const newRotation = rotation + 45; // Adjust the rotation angle as needed
	// 	setRotation(newRotation);
	// 	onRotate(newRotation);
	// };

	// useEffect(() => {
	// 	if (part) {
	// 		setTempPosition({ x: part.x, y: part.y });
	// 	}
	// }, [part]);

	useEffect(() => {
		if (isLoadingUpdatePartMutation) {
			toast({
				title: "Updating part",
				description: "Updating part position...",
			});
		}
	}, [isLoadingUpdatePartMutation]);
	return (
		<Draggable
			nodeRef={nodeRef}
			position={{
				x: part ? part.x : 0,
				y: part ? part.y : 0,
			}}
			onDrag={handleDrag}
			onStop={handleStop}
			// bounds="parent"
			scale={1.3}
			positionOffset={{ x: "100%", y: "10%" }}
			axis={part?.locked ? "none" : "both"}
			// offsetParent={document.getElementById("canvas") as HTMLElement}
		>
			<div
				ref={nodeRef}
				style={{
					transform: `rotate(${rotation}deg)`,
					position: "absolute",
					transition: "transform 150ms ease",
				}}
				className="flex flex-col items-center space-y-2 p-2 rounded-md w-1/6"
			>
				<div className="flex items-center space-x-2">{part.name}</div>
				<LitElementWrapper element={part} />
			</div>
		</Draggable>
	);
}
