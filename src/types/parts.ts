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

export type { Part, AddPart };
