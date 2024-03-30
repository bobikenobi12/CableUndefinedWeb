interface AddPart {
	x: number;
	y: number;
	name: string;
	angle: number;
	locked: boolean;
}

interface Part extends AddPart {
	_id: string;
}

export type { Part, AddPart };
