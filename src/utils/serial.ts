import SerialPort from "serialport";

export type PortState = "closed" | "open";

let port: SerialPort;
let portState: PortState = "closed";

async function getPort(): Promise<SerialPort | Error> {
	if ("serial" in navigator) {
		if (portState === "closed") {
			try {
				// @ts-ignore
				port = await navigator.serial.requestPort();
				// @ts-ignore
				await port.open({ baudRate: 9600 });
				portState = "open";
			} catch (error) {
				portState = "closed";
				return error as Error;
			}
		}
		return port;
	}
	return new Error("Web Serial API not supported");
}

async function closePort(): Promise<void> {
	if (portState === "open") {
		await port.close();
		portState = "closed";
	}
}

function getWriter() {
	// @ts-ignore
	const writer = port.writable.getWriter();
	return writer;
}

function getReader() {
	// @ts-ignore
	const reader = port.readable.getReader();
	return reader;
}

export { getPort, closePort, getWriter, getReader };
