import React, { useEffect, useRef, useState } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
	dragElement,
	getAllElements,
} from "@/redux/features/diagrams/wokwi-elements-slice";

interface ElementProps {
	id: string;
	children?: React.ReactNode;
}

export default function DiagramElement({
	id,
	children,
}: ElementProps): JSX.Element {
	const [tempPosition, setTempPosition] = useState({ x: 0, y: 0 });
	const dispatch = useAppDispatch();
	const element = useAppSelector((state) =>
		getAllElements(state).find((el) => el.id === id)
	);
	const nodeRef = useRef(null);
	const [rotation, setRotation] = useState(0);

	const handleDrag = (e: DraggableEvent, ui: DraggableData) => {
		const { x, y } = ui;
		setTempPosition({ x, y });
	};

	const handleStop = () => {
		dispatch(
			dragElement({
				id,
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
		if (element) {
			setTempPosition({ x: element.x, y: element.y });
		}
	}, [element]);

	return (
		<Draggable
			nodeRef={nodeRef}
			position={{
				x: element ? element.x : 0,
				y: element ? element.y : 0,
			}}
			onDrag={handleDrag}
			onStop={handleStop}
			// bounds="parent"
			scale={1.3}
			positionOffset={{ x: "100%", y: "10%" }}
			key={id}
			axis={element?.locked ? "none" : "both"}
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
