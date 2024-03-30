interface AddPart {
	x: number;
	y: number;
	name: string;
	angle: number;
	locked: boolean;
	version: number;
}

interface Part extends AddPart {
	_id: string;
}

export type { Part, AddPart };
