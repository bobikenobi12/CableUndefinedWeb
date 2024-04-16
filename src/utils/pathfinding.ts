type Enumerate<
	N extends number,
	Acc extends number[] = []
> = Acc["length"] extends N
	? Acc[number]
	: Enumerate<N, [...Acc, Acc["length"]]>;

type IntRange<F extends number, T extends number> = Exclude<
	Enumerate<T>,
	Enumerate<F>
>;

type OtherColumn = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
type MCURow = IntRange<0, 4>;
type MAINRow = IntRange<0, 12>;

// Based on the breadboard type use the correct row type
type MCUPin = `MCU${OtherColumn}${MCURow}`;
type MAINPin = `MAIN${OtherColumn}${MAINRow}`;
export type Pin = MCUPin | MAINPin;

// Defining the enum for device types
enum DeviceType {
	DEVICE,
	MULTIPLEXER,
	BREADBOARD,
}

// Base Device class
class Device {
	number: number;
	type: DeviceType;

	constructor(number: number, type: DeviceType) {
		this.number = number;
		this.type = type;
	}
}

// ConnectionNode class to represent connections
class ConnectionNode {
	device: Device;
	index: number;

	constructor(device: Device, index: number) {
		this.device = device;
		this.index = index;
	}
}

// Multiplexer class extending Device
// A multiplexer has 16 X pins and 8 Y pins
class Multiplexer extends Device {
	x: (ConnectionNode | null)[] = new Array(16).fill(null);
	y: (ConnectionNode | null)[] = new Array(8).fill(null);

	constructor(number: number) {
		super(number, DeviceType.MULTIPLEXER);
	}
}

// Breadboard class extending Device
class Breadboard extends Device {
	pin: (ConnectionNode | null)[] = new Array(24).fill(null);

	constructor(number: number) {
		super(number, DeviceType.BREADBOARD);
	}
}

// Graph class for representing the connections
class Graph {
	numberOfVertices: number;
	adjacencyLists: Map<number, number[]> = new Map();
	globalUsedPins: boolean[];

	constructor(numberOfVertices: number) {
		this.numberOfVertices = numberOfVertices;
		this.globalUsedPins = new Array(numberOfVertices).fill(false);
	}

	addEdge(source: number, destination: number) {
		if (!this.adjacencyLists.has(source)) {
			this.adjacencyLists.set(source, []);
		}

		if (!this.adjacencyLists.has(destination)) {
			this.adjacencyLists.set(destination, []);
		}

		this.adjacencyLists.get(source)!.push(destination);
		this.adjacencyLists.get(destination)!.push(source);
	}

	isBreadboardPin(pin: number): boolean {
		const mainBreadboardStart = 2 * 24;
		const mainBreadboardEnd = 2 * 24 + 23;

		const mcuBreadboardStart = 3 * 24;
		const mcuBreadboardEnd = 3 * 24 + 7;

		return (
			(pin >= mainBreadboardStart && pin <= mainBreadboardEnd) ||
			(pin >= mcuBreadboardStart && pin <= mcuBreadboardEnd)
		);
	}

	findPath(
		startVertex: number,
		endVertex: number,
		ignoreUsedPins: boolean = false
	): number[] {
		const visited = new Array(this.numberOfVertices).fill(false);
		const parent: number[] = new Array(this.numberOfVertices).fill(-1);

		const queue: number[] = [];
		const path: number[] = [];

		visited[startVertex] = true;

		queue.push(startVertex);
		let found = false;

		while (queue.length > 0 && !found) {
			const current = queue.shift();

			const adjacentVertices = this.adjacencyLists.get(current!) || [];

			for (const adjacentVertex of adjacentVertices) {
				const canVisit = ignoreUsedPins
					? !visited[adjacentVertex]
					: !visited[adjacentVertex] &&
					  (!this.globalUsedPins[adjacentVertex] ||
							this.isBreadboardPin(adjacentVertex));

				if (canVisit) {
					parent[adjacentVertex] = current!;
					visited[adjacentVertex] = true;

					queue.push(adjacentVertex);

					if (adjacentVertex === endVertex) {
						found = true;
						break;
					}
				}
			}
		}

		if (!found) {
			return [];
		}

		// Construct the path in reverse
		for (
			let currentVertex = endVertex;
			currentVertex >= 0;
			currentVertex = parent[currentVertex]
		) {
			path.push(currentVertex);

			if (!this.isBreadboardPin(currentVertex)) {
				this.globalUsedPins[currentVertex] = true;
			}
		}

		return path.reverse();
	}

	removePath(startVertex: number, endVertex: number): number[] {
		const path = this.findPath(startVertex, endVertex, true);

		if (path.length > 0) {
			for (let i = 0; i < path.length - 1; i++) {
				if (!this.isBreadboardPin(path[i])) {
					this.globalUsedPins[path[i]] = false;
				}
			}

			// Mark the last pin in the path as unused as well
			if (!this.isBreadboardPin(path[path.length - 1])) {
				this.globalUsedPins[path[path.length - 1]] = false;
			}
		}

		return path;
	}
}

const mux1 = new Multiplexer(0);
const mux2 = new Multiplexer(1);
const mainBreadboard = new Breadboard(3);
const mcuBreadboard = new Breadboard(4);

// Initialize Graph with the total number of vertices
// 2 Multiplexers with 16 X pins and 8 Y pins each
// Main breadboard with 24 pins
// MCU breadboard with 8 pins
const graph = new Graph(2 * (16 + 8) + 1 * 24 + 1 * 8);

function getGraphVertexID(
	device: Device,
	type: "p" | "x" | "y",
	pinIndex: number
): number {
	let deviceId = device.number;

	if (device.type === DeviceType.MULTIPLEXER) {
		return deviceId * 24 + (type === "x" ? pinIndex : 16 + pinIndex);
	} else if (device.type === DeviceType.BREADBOARD) {
		if (deviceId === 3) {
			// Main breadboard
			return 2 * 24 + pinIndex;
		} else if (deviceId === 4) {
			// MCU breadboard
			return 2 * 24 + 24 + pinIndex;
		}
	}

	return -1; // Error case
}

function printDeviceSpecifications(vertexID: number): string {
	const numMultiplexers = 2;
	const multiplexerPins = 24;
	const mainBreadboardPins = 24;

	if (vertexID < numMultiplexers * multiplexerPins) {
		let deviceId = Math.floor(vertexID / multiplexerPins);
		let pinIndex = vertexID % multiplexerPins;
		let type = pinIndex < 16 ? "x" : "y";
		pinIndex = pinIndex < 16 ? pinIndex : pinIndex - 16; // Adjust pinIndex for 'y' type

		return `MUX${deviceId + 1} ${type}${pinIndex}`;
	} else if (
		vertexID <
		numMultiplexers * multiplexerPins + mainBreadboardPins
	) {
		let pinIndex = vertexID - numMultiplexers * multiplexerPins;
		return `MainBreadboard ${pinIndex}`;
	} else {
		let pinIndex =
			vertexID - (numMultiplexers * multiplexerPins + mainBreadboardPins);
		return `MCUBreadboard ${pinIndex}`;
	}
}

function getMUXConnections(
	path: number[],
	addingConnection: boolean
): string[] {
	const connections: string[] = [];

	path.forEach((vertex, index) => {
		if (index < path.length - 1) {
			const device1 = printDeviceSpecifications(vertex);
			const device2 = printDeviceSpecifications(path[index + 1]);

			// "MUX1" or "MUX2"
			const device1Substr = device1.substring(0, 4);
			const device2Substr = device2.substring(0, 4);

			const pin1 = device1.substring(5);
			const pin2 = device2.substring(5);

			let string = `${pin1};${pin2};${addingConnection}`;

			if (device1Substr === "MUX1" && device1Substr === device2Substr) {
				connections.push(`1000;${string}`);
			}

			if (device1Substr === "MUX2" && device1Substr === device2Substr) {
				connections.push(`1001;${string}`);
			}
		}
	});

	return connections;
}

function parsePin(pin: Pin): [Device, number] {
	const isMCU = pin.startsWith("MCU");
	const device = isMCU ? mcuBreadboard : mainBreadboard;

	const prefixLength = isMCU ? 3 : 4;

	// get the column
	const column = pin[prefixLength];

	// get the row
	const row = parseInt(pin.slice(prefixLength + 1));

	// get the pin number
	let pinNumber = row;

	// if column is E, F, G, or H, add the offset
	if (column >= "E") {
		pinNumber += isMCU ? 4 : 12;
	}

	return [device, pinNumber];
}

let multiplexers: Multiplexer[] = [mux1, mux2];

// Add edges to the graph for every X to Y connection in the multiplexers
for (let i = 0; i < 2; i++) {
	for (let j = 0; j < 16; j++) {
		for (let k = 0; k < 8; k++) {
			let sourceVertex = getGraphVertexID(multiplexers[i], "x", j);
			let destinationVertex = getGraphVertexID(multiplexers[i], "y", k);

			graph.addEdge(sourceVertex, destinationVertex);
		}
	}
}

// ! DO NOT TOUCH THE CODE IN THIS BLOCK
{
	// MUX1 pins edge connections FIXED
	graph.addEdge(
		getGraphVertexID(mux1, "x", 0),
		getGraphVertexID(mux2, "y", 0)
	);
	graph.addEdge(
		getGraphVertexID(mux1, "x", 1),
		getGraphVertexID(mux2, "y", 1)
	);
	graph.addEdge(
		getGraphVertexID(mux1, "x", 2),
		getGraphVertexID(mux2, "y", 2)
	);
	graph.addEdge(
		getGraphVertexID(mux1, "x", 3),
		getGraphVertexID(mux2, "y", 3)
	);
	graph.addEdge(
		getGraphVertexID(mux1, "x", 4),
		getGraphVertexID(mux2, "y", 4)
	);
	graph.addEdge(
		getGraphVertexID(mux1, "x", 5),
		getGraphVertexID(mux2, "y", 5)
	);
	graph.addEdge(
		getGraphVertexID(mux1, "x", 6),
		getGraphVertexID(mux2, "y", 6)
	);
	graph.addEdge(
		getGraphVertexID(mux1, "x", 7),
		getGraphVertexID(mux2, "y", 7)
	);
	graph.addEdge(
		getGraphVertexID(mux1, "x", 8),
		getGraphVertexID(mainBreadboard, "p", 12)
	);
	graph.addEdge(
		getGraphVertexID(mux1, "x", 9),
		getGraphVertexID(mainBreadboard, "p", 13)
	);
	graph.addEdge(
		getGraphVertexID(mux1, "x", 10),
		getGraphVertexID(mainBreadboard, "p", 14)
	);
	graph.addEdge(
		getGraphVertexID(mux1, "x", 11),
		getGraphVertexID(mainBreadboard, "p", 15)
	);
	graph.addEdge(
		getGraphVertexID(mux1, "x", 12),
		getGraphVertexID(mainBreadboard, "p", 16)
	);
	graph.addEdge(
		getGraphVertexID(mux1, "x", 13),
		getGraphVertexID(mainBreadboard, "p", 17)
	);
	graph.addEdge(
		getGraphVertexID(mux1, "x", 14),
		getGraphVertexID(mainBreadboard, "p", 18)
	);
	graph.addEdge(
		getGraphVertexID(mux1, "x", 15),
		getGraphVertexID(mainBreadboard, "p", 19)
	);

	graph.addEdge(
		getGraphVertexID(mux1, "y", 0),
		getGraphVertexID(mcuBreadboard, "p", 0)
	);
	graph.addEdge(
		getGraphVertexID(mux1, "y", 1),
		getGraphVertexID(mcuBreadboard, "p", 1)
	);
	graph.addEdge(
		getGraphVertexID(mux1, "y", 2),
		getGraphVertexID(mcuBreadboard, "p", 2)
	);
	graph.addEdge(
		getGraphVertexID(mux1, "y", 3),
		getGraphVertexID(mcuBreadboard, "p", 3)
	);
	graph.addEdge(
		getGraphVertexID(mux1, "y", 4),
		getGraphVertexID(mcuBreadboard, "p", 4)
	);
	graph.addEdge(
		getGraphVertexID(mux1, "y", 5),
		getGraphVertexID(mcuBreadboard, "p", 5)
	);
	graph.addEdge(
		getGraphVertexID(mux1, "y", 6),
		getGraphVertexID(mcuBreadboard, "p", 6)
	);
	graph.addEdge(
		getGraphVertexID(mux1, "y", 7),
		getGraphVertexID(mcuBreadboard, "p", 7)
	);

	// MUX2 pins edge connections FIXED
	graph.addEdge(
		getGraphVertexID(mux2, "x", 0),
		getGraphVertexID(mainBreadboard, "p", 20)
	);
	graph.addEdge(
		getGraphVertexID(mux2, "x", 1),
		getGraphVertexID(mainBreadboard, "p", 21)
	);
	graph.addEdge(
		getGraphVertexID(mux2, "x", 2),
		getGraphVertexID(mainBreadboard, "p", 22)
	);
	graph.addEdge(
		getGraphVertexID(mux2, "x", 3),
		getGraphVertexID(mainBreadboard, "p", 23)
	);
	graph.addEdge(
		getGraphVertexID(mux2, "x", 4),
		getGraphVertexID(mainBreadboard, "p", 0)
	);
	graph.addEdge(
		getGraphVertexID(mux2, "x", 5),
		getGraphVertexID(mainBreadboard, "p", 1)
	);
	graph.addEdge(
		getGraphVertexID(mux2, "x", 6),
		getGraphVertexID(mainBreadboard, "p", 2)
	);
	graph.addEdge(
		getGraphVertexID(mux2, "x", 7),
		getGraphVertexID(mainBreadboard, "p", 3)
	);
	graph.addEdge(
		getGraphVertexID(mux2, "x", 8),
		getGraphVertexID(mainBreadboard, "p", 4)
	);
	graph.addEdge(
		getGraphVertexID(mux2, "x", 9),
		getGraphVertexID(mainBreadboard, "p", 5)
	);
	graph.addEdge(
		getGraphVertexID(mux2, "x", 10),
		getGraphVertexID(mainBreadboard, "p", 6)
	);
	graph.addEdge(
		getGraphVertexID(mux2, "x", 11),
		getGraphVertexID(mainBreadboard, "p", 7)
	);
	graph.addEdge(
		getGraphVertexID(mux2, "x", 12),
		getGraphVertexID(mainBreadboard, "p", 8)
	);
	graph.addEdge(
		getGraphVertexID(mux2, "x", 13),
		getGraphVertexID(mainBreadboard, "p", 9)
	);
	graph.addEdge(
		getGraphVertexID(mux2, "x", 14),
		getGraphVertexID(mainBreadboard, "p", 10)
	);
	graph.addEdge(
		getGraphVertexID(mux2, "x", 15),
		getGraphVertexID(mainBreadboard, "p", 11)
	);
}

export function addConnection(connection: [Pin, Pin]) {
	const [startPin, endPin] = connection;

	const [startDevice, startPinNumber] = parsePin(startPin);
	const [endDevice, endPinNumber] = parsePin(endPin);

	const startVertex = getGraphVertexID(startDevice, "p", startPinNumber);
	const endVertex = getGraphVertexID(endDevice, "p", endPinNumber);

	const path = graph.findPath(startVertex, endVertex);
	let pathDescription = "";
	const connections: string[] = [];

	if (path.length > 0) {
		pathDescription = path
			.map(vertex => printDeviceSpecifications(vertex))
			.join(" -> ");

		connections.push(...getMUXConnections(path, true));

		let splitPath = pathDescription.split(" -> ");

		connections[0] += `;${splitPath[0].trim()};${splitPath[
			splitPath.length - 1
		].trim()}`;
	} else {
		pathDescription = `No path found from ${printDeviceSpecifications(
			startVertex
		)} to ${printDeviceSpecifications(endVertex)}.`;
	}

	return { pathDescription, connections };
}

export function removeConnection(connection: [Pin, Pin]) {
	const [startPin, endPin] = connection;

	const [startDevice, startPinNumber] = parsePin(startPin);
	const [endDevice, endPinNumber] = parsePin(endPin);

	const startVertex = getGraphVertexID(startDevice, "p", startPinNumber);
	const endVertex = getGraphVertexID(endDevice, "p", endPinNumber);

	// path -> find already existing path in the graph
	const path = graph.removePath(startVertex, endVertex);

	let pathDescription = "";
	const connections: string[] = [];

	if (path.length > 0) {
		pathDescription = path
			.map(vertex => printDeviceSpecifications(vertex))
			.join(" -> ");

		connections.push(...getMUXConnections(path, false));

		let splitPath = pathDescription.split(" -> ");

		connections[0] += `;${splitPath[0].trim()};${splitPath[
			splitPath.length - 1
		].trim()}`;
	} else {
		pathDescription = `No path found from ${printDeviceSpecifications(
			startVertex
		)} to ${printDeviceSpecifications(endVertex)}.`;
	}

	return { pathDescription, connections };
}

export function resetGraph() {
	console.log("Graph has been reset!");
	graph.globalUsedPins.fill(false);
}

// ? Examples
const path1 = addConnection(["MCUH0", "MAINH11"]);
const path2 = addConnection(["MCUH1", "MAINH10"]);
const path3 = addConnection(["MCUH0", "MAINH11"]);

console.log("Path Description:", path1.pathDescription);
console.log("Connections:", path1.connections.join("   "));

console.log("Path Description:", path2.pathDescription);
console.log("Connections:", path2.connections.join("   "));

console.log("Path Description:", path3.pathDescription);
console.log("Connections:", path3.connections.join("   "));

const removedPath1 = removeConnection(["MCUH0", "MAINH11"]);
console.log("Path Description:", removedPath1.pathDescription);
console.log("Connections:", removedPath1.connections.join("\n"));
console.log("Removed connection from MCUH0 to MAINH11");

const path4 = addConnection(["MCUH0", "MAINH11"]);
console.log("Path Description:", path4.pathDescription);
console.log("Connections:", path4.connections.join("\n"));

const path5 = addConnection(["MCUH1", "MAINH10"]);
console.log("Path Description:", path5.pathDescription);
console.log("Connections:", path5.connections.join("\n"));

const removedPath2 = removeConnection(["MCUH1", "MAINH10"]);
console.log("Path Description:", removedPath2.pathDescription);
console.log("Connections:", removedPath2.connections.join("\n"));
console.log("Removed connection from MCUH1 to MAINH10");

const path6 = addConnection(["MCUH1", "MAINH10"]);
console.log("Path Description:", path6.pathDescription);
console.log("Connections:", path6.connections.join("\n"));

resetGraph();
console.log("Reset Graph!");

const path7 = addConnection(["MCUH1", "MAINH10"]);
console.log("Path Description:", path7.pathDescription);
console.log("Connections:", path7.connections.join("\n"));

const path8 = addConnection(["MCUH1", "MAINH10"]);
console.log("Path Description:", path8.pathDescription);
console.log("Connections:", path8.connections.join("\n"));

const path9 = addConnection(["MCUH0", "MAINH11"]);
console.log("Path Description:", path9.pathDescription);
console.log("Connections:", path9.connections.join("\n"));
