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

import DiagramElement from "@/components/canvas/diagram-element";
import { useAppDispatch } from "@/redux/hooks";

import {
	useRemovePartMutation,
	useUpdatePartMutation,
} from "@/redux/features/parts/parts-api-slice";

import "@b.borisov/cu-elements";

import { useParams } from "react-router-dom";

import type { DiagramsElement } from "@/redux/features/diagrams/wokwi-elements-slice";
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
function LitElementWrapper({ element }: { element: DiagramsElement }) {
	const elRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const showPinsEl = partMappings["Show Pins"];
		const elementEl = partMappings[element.name];

		if (elRef.current && showPinsEl && elementEl) {
			// Append the current element to the ShowPinsElement
			showPinsEl.appendChild(elementEl.cloneNode(true));

			// Append the ShowPinsElement to the main container
			elRef.current.appendChild(showPinsEl.cloneNode(true));
		}

		return () => {
			// Clean up function
			elRef.current?.remove();
		};
	}, [element.name]);

	return <div ref={elRef} className="w-full h-full"></div>;
}

export default function ElementContextMenu({
	element,
	idx,
}: {
	element: DiagramsElement;
	idx: number;
}): JSX.Element {
	const { id } = useParams<{ id: string }>();

	const [removePart, { isLoading: isLoadingRemovePartMutation }] =
		useRemovePartMutation();
	const [updatePart, { isLoading: isLoadingUpdatePartMutation }] =
		useUpdatePartMutation();

	const { toast } = useToast();

	return (
		<Dialog>
			<ContextMenu>
				<ContextMenuTrigger>
					<DiagramElement key={idx} id={element.id}>
						<div className="flex items-center space-x-2">
							{element.name}
						</div>
						<LitElementWrapper element={element} key={idx} />
					</DiagramElement>
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
									partId: element.id,
								});
								toast({
									title: "Element removed",
									description: `Removed ${element.name} from canvas`,
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
				<RenameElementForm id={element.id} initialName={element.name} />
			</DialogContent>
		</Dialog>
	);
}
