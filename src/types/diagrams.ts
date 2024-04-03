import type { Part } from "./parts";
import type { Connection } from "./connections";

interface Diagram {
	_id: string;
	createdAt: string;
	updatedAt: string;
	_owner: string;
	name: string;
	microcontroller: Microcontroller;
	parts: Part[];
	connection: Connection[];
}

enum Microcontroller {
	ATTiny85 = "ATTiny85",
	ArduinoNano = "Arduino Nano",
	RasberryPiPico = "Rasberry Pi Pico",
	ESP32 = "ESP32",
}

export type { Diagram };
export { Microcontroller };
