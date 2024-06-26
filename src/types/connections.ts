import { z } from "zod";

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

const PinSchema = z
	.string()
	.regex(/^MCU[A-H][0-3]|MAIN[A-H]([0-9]|1[01])$/) as z.ZodType<
	Pin,
	any,
	any
>;

export const ConnectionSchema = z.tuple([PinSchema, PinSchema]);

export type Connection = z.infer<typeof ConnectionSchema>;
