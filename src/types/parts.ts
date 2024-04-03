interface AddPart {
	x: number;
	y: number;
	name: string;
	angle: number;
	locked: boolean;
}

interface Part extends AddPart {
	id: string;
}

enum PinType {
	Circle = "circle",
	Rect = "rect",
}

export type { Part, AddPart };
export { PinType };
