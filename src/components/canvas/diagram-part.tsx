import React, { useEffect, useRef, useState } from "react";

import Draggable, { DraggableData, DraggableEvent } from "react-draggable";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import { dragPart } from "@/redux/features/diagrams/diagrams-slice";

import { selectPartById } from "@/redux/features/diagrams/diagrams-slice";

import { useParams } from "react-router-dom";
interface PartProps {
	id: string;
	children?: React.ReactNode;
}

export default function DiagramPart({ id, children }: PartProps): JSX.Element {
	const { id: diagramId } = useParams<{ id: string }>();

	const [tempPosition, setTempPosition] = useState({ x: 0, y: 0 });

	const dispatch = useAppDispatch();

	const part = useAppSelector((state) =>
		selectPartById(state, diagramId as string, id)
	);

	const nodeRef = useRef(null);
	const [rotation, setRotation] = useState(0);

	const handleDrag = (e: DraggableEvent, ui: DraggableData) => {
		const { x, y } = ui;
		setTempPosition({ x, y });
	};

	const handleStop = () => {
		dispatch(
			dragPart({
				diagramId: diagramId as string,
				partId: id,
				x: tempPosition.x,
				y: tempPosition.y,
			})
		);
	};

	// const handleRotate = () => {
	// 	const newRotation = rotation + 45; // Adjust the rotation angle as needed
	// 	setRotation(newRotation);
	// 	onRotate(newRotation);
	// };

	useEffect(() => {
		if (part) {
			setTempPosition({ x: part.x, y: part.y });
		}
	}, [part]);

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
			key={id}
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
				{children}
			</div>
		</Draggable>
	);
}
