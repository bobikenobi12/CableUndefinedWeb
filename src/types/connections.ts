// type PowerType = "+" | "-";
// type PowerRow = IntRange<0, 25>;
// type PowerColumn = "L" | "R";

import { z } from "zod";

type OtherColumn = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
type MCURow = 0 | 1 | 2 | 3 | 4;
type MAINRow = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// Based on the breadboard type use the correct row type
// type PowerPin = `MAIN${PowerType}${PowerColumn}${PowerRow}`;
type MCUPin = `MCU${OtherColumn}${MCURow}`;
type MAINPin = `MAIN${OtherColumn}${MAINRow}`;
type Pin = MCUPin | MAINPin;

const PinSchema = z
	.string()
	.regex(/^MCU[A-H][0-3]|MAIN[A-H]([0-9]|1[01])$/) as z.ZodType<
	Pin,
	any,
	any
>;

export const ConnectionSchema = z.tuple([PinSchema, PinSchema]);

export type Connection = z.infer<typeof ConnectionSchema>;
