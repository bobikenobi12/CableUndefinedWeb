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

import "@b.borisov/cu-elements";

import { useParams } from "react-router-dom";

import type { Part } from "@/types/parts";
import { partMappings } from "@/types/wokwi-elements-mapping";

const schema = z.object({
	name: z.string(),
});

type FormValues = z.infer<typeof schema>;

const RenameElementForm = ({
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
function LitElementWrapper({ element }: { element: Part }) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (containerRef.current) {
			const el = partMappings[element.name]; // HTMLElement
			if (el) {
				const showPins = partMappings["Show Pins"];
				containerRef.current.appendChild(showPins);
				containerRef.current.appendChild(el);
			}
		}
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

	const { toast } = useToast();
	return (
		<div>
			<Dialog>
				<ContextMenu>
					<ContextMenuTrigger>
						<DiagramPart id={part._id}>
							<div className="flex items-center space-x-2">
								{part.name}
							</div>
							<LitElementWrapper element={part} />
						</DiagramPart>
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
										partId: part._id,
									});
									toast({
										title: "Element removed",
										description: `Removed ${part.name} from canvas`,
									});
								} catch (error) {
									console.error(error);
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
					<RenameElementForm id={part._id} initialName={part.name} />
				</DialogContent>
			</Dialog>
		</div>
	);
}
