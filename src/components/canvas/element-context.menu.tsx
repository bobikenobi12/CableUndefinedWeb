import { useEffect, useRef } from "react";

import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuTrigger,
	ContextMenuItem,
} from "@/components/ui/context-menu";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogTrigger,
	DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";

import { useToast } from "../ui/use-toast";

import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { DialogFooter } from "@/components/ui/dialog";
import { editElementName } from "@/redux/features/diagrams/wokwi-elements-slice";

import DiagramPart from "@/components/canvas/diagram-part";

import { useAppDispatch } from "@/redux/hooks";

import { useRemovePartMutation } from "@/redux/features/parts/parts-api-slice";

import * as wokwiElements from "@b.borisov/cu-elements";

import { useParams } from "react-router-dom";

import type { Part } from "@/types/parts";
import { partMappings } from "@/types/wokwi-elements-mapping";

import { PinType } from "@/types/parts";

const schema = z.object({
	name: z.string(),
});

type FormValues = z.infer<typeof schema>;

export const RenameElementForm = ({
	id,
	initialName,
}: {
	id: string;
	initialName: string;
}) => {
	const dispatch = useAppDispatch();

	const form = useForm<FormValues>({
		mode: "onSubmit",
		resolver: zodResolver(schema),
		defaultValues: {
			name: initialName,
		},
	});

	const onSubmit: SubmitHandler<FormValues> = async (data: FormValues) => {
		dispatch(
			editElementName({
				id: id,
				name: data.name,
			})
		);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="name"
					render={({ field, formState }) => (
						<FormItem>
							<FormControl>
								<Input
									id="name"
									type="text"
									autoCapitalize="none"
									autoComplete="off"
									autoCorrect="off"
									placeholder="Enter a new name"
									className="w-full"
									disabled={false}
									{...field}
								/>
							</FormControl>
							<FormMessage className="text-red-500 pt-1">
								{formState.errors.name?.message}
							</FormMessage>
						</FormItem>
					)}
				/>

				<DialogFooter className="flex justify-end items-center space-x-2 mt-2 rounded-b-md">
					<DialogClose asChild>
						<Button type="button" variant="secondary">
							Close
						</Button>
					</DialogClose>
					<DialogClose asChild>
						<Button type="submit" size="sm" className="px-3">
							Rename
						</Button>
					</DialogClose>
				</DialogFooter>
			</form>
		</Form>
	);
};

// for each LitElementWrapper, we need to render the ShowPinsElement and the current element
// <wokwi-show-pins> --> partMappings["Show Pins"]
// // element: DiagramsElement
// </wokwi-show-pins>
export function LitElementWrapper({ element }: { element: Part }) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (containerRef.current) {
			const el = partMappings[element.name];
			console.log(el);
			console.log(element.name);
			if (el) {
				const showPins = new wokwiElements.ShowPinsElement();
				switch (element.name) {
					case "MCU Breadboard" || "Main Breadboard":
						showPins.pinRadius = 5;
						showPins.pinHeight = 10;
						showPins.pinHeight = 10;
						showPins.pinType = PinType.Circle;
						break;
					case "Arduino Nano" || "Arduino Uno" || "Arduino Mega":
						showPins.pinRadius = 3;
						showPins.pinType = PinType.Rect;
						break;
					default:
						showPins.pinRadius = 3;
						showPins.pinType = PinType.Circle;
						break;
				}
				containerRef.current.innerHTML = "";
				containerRef.current.appendChild(showPins);
				showPins.appendChild(el);
			}
		}

		return () => {
			if (containerRef.current) {
				containerRef.current.innerHTML = "";
			}
		};
	}, [element]);

	return <div ref={containerRef}></div>;
}

export default function ElementContextMenu({
	part,
}: {
	part: Part;
}): JSX.Element {
	const { id } = useParams<{ id: string }>();

	const [removePart, { isLoading: isLoadingRemovePartMutation }] =
		useRemovePartMutation();

	const { toast, dismiss } = useToast();

	useEffect(() => {
		if (isLoadingRemovePartMutation) {
			toast({
				title: "Removing element",
				description: `Removing ${part.name} from canvas`,
			});
		}
	}, [isLoadingRemovePartMutation]);

	useEffect(() => {
		if (!isLoadingRemovePartMutation) {
			dismiss();
		}
	}, [isLoadingRemovePartMutation]);

	return (
		<Dialog>
			<ContextMenu>
				<ContextMenuTrigger>
					<DiagramPart part={part} />
				</ContextMenuTrigger>
				<ContextMenuContent className="w-48">
					<ContextMenuItem>
						<DialogTrigger asChild>
							<ContextMenuItem>Rename</ContextMenuItem>
						</DialogTrigger>
					</ContextMenuItem>
					<ContextMenuItem>Move up</ContextMenuItem>
					<ContextMenuItem>Rotate</ContextMenuItem>
					<ContextMenuItem
						onClick={() => {
							try {
								removePart({
									_id: id as string,
									partId: part.id,
								});
								toast({
									title: "Element removed",
									description: `Removed ${part.name} from canvas`,
								});
							} catch (error) {
								toast({
									variant: "destructive",
									title: "Failed to remove element",
									description: error as string,
								});
							}
						}}
						className="hover:text-red-500 cursor-pointer"
					>
						Remove
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Rename Element</DialogTitle>
					<DialogDescription>
						Enter a new name for the element
					</DialogDescription>
				</DialogHeader>
				<RenameElementForm id={part.id} initialName={part.name} />
			</DialogContent>
		</Dialog>
	);
}
