import React, { useEffect } from "react";

import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogTrigger,
} from "@/components/ui/dialog";

import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import { ScrollArea } from "@/components/ui/scroll-area";

import {
	ContextMenu,
	ContextMenuItem,
	ContextMenuContent,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";

import { useToast } from "@/components/ui/use-toast";

import { Home, Combine, CodeXml, Component, Settings, Mic } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
	toggleGrid,
	getShowGrid,
} from "@/redux/features/diagrams/wokwi-elements-slice";

import {
	useDeleteDiagramMutation,
	useUpdateDiagramMutation,
} from "@/redux/features/diagrams/diagrams-api-slice";
import { selectDiagramById } from "@/redux/features/diagrams/diagrams-slice";

import {
	useAddPartMutation,
	useRemovePartMutation,
} from "@/redux/features/parts/parts-api-slice";

import {
	useCreateConnectionMutation,
	useDeleteConnectionMutation,
} from "@/redux/features/connections/connections-api-slice";

import {
	useLazyGenerateCodeQuery,
	useLazyPredictionsQuery,
} from "@/redux/features/index/index-api-slice";
import { Tab, setTab, selectTab } from "@/redux/features/index/index-slice";

import { RenameElementForm } from "@/components/canvas/element-context.menu";

import {
	partMappings,
	partTagsToConnectionStrings,
} from "@/types/wokwi-elements-mapping";

import { useParams } from "react-router-dom";

import DiagramPart from "@/components/canvas/diagram-part";
import { Pin } from "@/types/connections";
import { Button } from "@/components/ui/button";
import { Microcontroller } from "@/types/diagrams";
import { CopyBlock } from "react-code-blocks";
import {
	PageHeader,
	PageHeaderDescription,
	PageHeaderHeading,
} from "@/components/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const schema = z.object({
	name: z.string().nonempty(),
	microcontroller: z.enum([
		Microcontroller.ATTiny85,
		Microcontroller.ArduinoNano,
		Microcontroller.RasberryPiPico,
		Microcontroller.ESP32,
	]),
});

type UpdateDiagramFormValues = z.infer<typeof schema>;

export default function Canvas(): JSX.Element {
	const { id } = useParams<{ id: string }>();

	const [connection, setConnection] = React.useState<{
		0: Pin | "";
		1: Pin | "";
	}>({
		0: "",
		1: "",
	});

	const [updateDiagram, { isLoading: isLoadingUpdateDiagram }] =
		useUpdateDiagramMutation();
	const [deleteDiagram, { isLoading: isLoadingDeleteDiagram }] =
		useDeleteDiagramMutation();

	const [removePart, { isLoading: isLoadingRemovePartMutation }] =
		useRemovePartMutation();
	const [removeConnection, { isLoading: isLoadingRemoveConnectionMutation }] =
		useDeleteConnectionMutation();
	const [createConnection, { isLoading: isLoadingCreateConnectionMutation }] =
		useCreateConnectionMutation();

	const [
		generateCode,
		{ data: generatedCode, isLoading: isLoadingGenerateCodeMutation },
	] = useLazyGenerateCodeQuery();
	const [
		generatePrediction,
		{
			data: generatedPrediction,
			isLoading: isLoadingGeneratePredictionMutation,
		},
	] = useLazyPredictionsQuery();

	const diagram = useAppSelector((state) =>
		selectDiagramById(state, id as string)
	);
	const showGrid = useAppSelector(getShowGrid);
	const tab = useAppSelector(selectTab);

	const [addPart, { isLoading: isLoadingAddPartMutation }] =
		useAddPartMutation();

	const { toast, dismiss } = useToast();

	const dispatch = useAppDispatch();

	const handleCustomEvent = (event: CustomEvent) => {
		const { pin } = event.detail;
		const { elementName, pinName, x, y } = pin;
		const type = partTagsToConnectionStrings[pinName];

		setConnection((prevConnection) => {
			// If both pins are empty, set the first pin
			if (prevConnection[0] === "" && prevConnection[1] === "") {
				return { ...prevConnection, 0: (type + elementName) as Pin };
			}

			// If the first pin is clicked again, reset the connection
			if (prevConnection[0] === type + elementName) {
				return { ...prevConnection, 0: "" };
			}

			// If the first pin is not empty and the second pin is empty, set the second pin
			if (prevConnection[0] !== "" && prevConnection[1] === "") {
				return { ...prevConnection, 1: (type + elementName) as Pin };
			}

			// Return previous state if none of the above conditions are met
			return prevConnection;
		});
	};

	useEffect(() => {
		document.addEventListener(
			"pin-click",
			handleCustomEvent as EventListener
		);

		return () => {
			document.removeEventListener(
				"pin-click",
				handleCustomEvent as EventListener
			);
		};
	}, []);

	useEffect(() => {
		if (isLoadingRemovePartMutation) {
			toast({
				title: "Removing element",
				description: `Removing ${id} from canvas`,
			});
		}
	}, [isLoadingRemovePartMutation]);

	useEffect(() => {
		if (!isLoadingRemovePartMutation) {
			setTimeout(() => {
				dismiss();
			}, 3000);
		}
	}, [isLoadingRemovePartMutation]);

	function removePartHandler(partId: string) {
		try {
			removePart({
				_id: id as string,
				partId,
			});
			toast({
				title: "Element removed",
				description: `Removed ${partId} from canvas`,
			});
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Failed to remove element",
				description: error as string,
			});
		}
	}

	const form = useForm<UpdateDiagramFormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: diagram?.name ?? "",
			microcontroller:
				diagram?.microcontroller ?? Microcontroller.ATTiny85,
		},
	});

	const onSubmit: SubmitHandler<UpdateDiagramFormValues> = (data) => {
		try {
			updateDiagram({
				id: id as string,
				name: data.name,
				microcontroller: data.microcontroller,
			}).unwrap();
			toast({
				title: "Diagram updated",
				description: `Updated diagram with name ${data.name} and microcontroller ${data.microcontroller}`,
			});
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Failed to update diagram",
				description: error as string,
			});
		}
	};

	return (
		<div className="flex grow py-6">
			<aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
				<nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
					<Tooltip>
						<TooltipTrigger
							asChild
							onClick={() => dispatch(setTab(Tab.PARTS))}
						>
							<div
								className={`flex h-9 w-9 items-center justify-center rounded-lg ${
									tab === Tab.PARTS
										? "bg-accent text-accent-foreground"
										: "text-muted-foreground"
								} transition-colors hover:text-foreground md:h-8 md:w-8`}
							>
								<Component className="h-5 w-5" />
								<span className="sr-only">Parts</span>
							</div>
						</TooltipTrigger>
						<TooltipContent side="right">Parts</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger
							asChild
							onClick={() => dispatch(setTab(Tab.CODE))}
						>
							<div
								className={`flex h-9 w-9 items-center justify-center rounded-lg 
								${
									tab === Tab.CODE
										? "bg-accent text-accent-foreground"
										: "text-muted-foreground"
								} transition-colors hover:text-foreground md:h-8 md:w-8`}
							>
								<CodeXml className="h-5 w-5" />
								<span className="sr-only">Generate Code</span>
							</div>
						</TooltipTrigger>
						<TooltipContent side="right">
							Generate Code
						</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger
							asChild
							onClick={() => dispatch(setTab(Tab.PREDICTION))}
						>
							<div
								className={`flex h-9 w-9 items-center justify-center rounded-lg ${
									tab === Tab.PREDICTION
										? "bg-accent text-accent-foreground"
										: "text-muted-foreground"
								} transition-colors hover:text-foreground md:h-8 md:w-8`}
							>
								<Combine className="h-5 w-5" />
								<span className="sr-only">Prediction</span>
							</div>
						</TooltipTrigger>
						<TooltipContent side="right">Prediction</TooltipContent>
					</Tooltip>
				</nav>
				<nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
					<Tooltip>
						<TooltipTrigger
							asChild
							onClick={() => {
								dispatch(setTab(Tab.SETTINGS));
							}}
						>
							<div
								className={`flex h-9 w-9 items-center justify-center rounded-lg ${
									tab === Tab.SETTINGS
										? "bg-accent text-accent-foreground"
										: "text-muted-foreground"
								}  transition-colors hover:text-foreground md:h-8 md:w-8`}
							>
								<Settings className="h-5 w-5" />
								<span className="sr-only">Settings</span>
							</div>
						</TooltipTrigger>
						<TooltipContent side="right">Settings</TooltipContent>
					</Tooltip>
				</nav>
			</aside>
			<div className="flex-1 relative lg:ml-14 h-full w-full">
				{tab === Tab.SETTINGS ? (
					<div className="flex flex-col w-fit-content p-2 space-y-2 px-4">
						<PageHeader className="flex w-full flex-col-reverse items-center justify-between gap-4 px-6 md:flex-row">
							<PageHeaderHeading>Setting</PageHeaderHeading>
							<PageHeaderDescription>
								Configure the settings for this diagram
							</PageHeaderDescription>
						</PageHeader>
						<div className="flex w-full flex-col items-center justify-center">
							<Card className="mt-4 w-full rounded-lg border p-4 sm:p-6">
								<CardHeader>
									<div className="text-lg font-bold">
										General
									</div>
									<div className="text-sm text-muted-foreground">
										Adjust your diagram's name and
										microcontroller
									</div>
								</CardHeader>
								<CardContent>
									<div className="flex flex-col">
										<Form {...form}>
											<form
												onSubmit={form.handleSubmit(
													onSubmit
												)}
											>
												<div className="grid gap-2">
													<div className="grid gap-3">
														<FormField
															control={
																form.control
															}
															name="name"
															render={({
																field,
																formState,
															}) => (
																<FormItem>
																	<FormLabel>
																		Diagram
																		Name
																	</FormLabel>
																	<FormControl>
																		<Input
																			id="name"
																			placeholder="Diagram Name"
																			type="text"
																			autoCapitalize="none"
																			autoCorrect="off"
																			{...field}
																		/>
																	</FormControl>
																	<FormMessage>
																		{
																			formState
																				.errors
																				.name
																				?.message
																		}
																	</FormMessage>
																</FormItem>
															)}
														/>
														<FormField
															control={
																form.control
															}
															name="microcontroller"
															render={({
																field,
																formState,
															}) => (
																<FormItem>
																	<FormLabel>
																		Diagram
																		Microcontroller
																	</FormLabel>
																	<FormControl>
																		<Select
																			{...field}
																		>
																			<SelectTrigger>
																				<SelectValue placeholder="Select a microcontroller" />
																			</SelectTrigger>
																			<SelectContent>
																				<SelectGroup>
																					<SelectLabel>
																						Microcontrollers
																					</SelectLabel>
																					<SelectItem
																						value={
																							Microcontroller.ATTiny85
																						}
																					>
																						ATTiny85
																					</SelectItem>
																					<SelectItem
																						value={
																							Microcontroller.ArduinoNano
																						}
																					>
																						Arduino
																						Nano
																					</SelectItem>
																					<SelectItem
																						value={
																							Microcontroller.RasberryPiPico
																						}
																					>
																						Rasberry
																						Pi
																						Pico
																					</SelectItem>
																					<SelectItem
																						value={
																							Microcontroller.ESP32
																						}
																					>
																						ESP32
																					</SelectItem>
																				</SelectGroup>
																			</SelectContent>
																		</Select>
																	</FormControl>
																	<FormMessage>
																		{
																			formState
																				.errors
																				.microcontroller
																				?.message
																		}
																	</FormMessage>
																</FormItem>
															)}
														/>
													</div>
													<div className="flex justify-end mt-4">
														<Button
															type="submit"
															disabled={
																isLoadingUpdateDiagram ||
																(form.getValues()
																	.name ===
																	diagram?.name &&
																	form.getValues()
																		.microcontroller ===
																		diagram?.microcontroller)
															}
														>
															Save Changes
														</Button>
													</div>
												</div>
											</form>
										</Form>
									</div>
								</CardContent>
							</Card>
							<Card className="mt-4 w-full rounded-lg border p-4 sm:p-6">
								<CardHeader>
									<div className="text-lg font-bold">
										Danger Zone
									</div>
									<div className="text-sm text-muted-foreground">
										The following actions are destructive
										and cannot be reversed.
									</div>
								</CardHeader>
								<CardContent>
									<Button
										variant="destructive"
										onClick={() => {
											try {
												deleteDiagram(id as string);
												toast({
													title: "Diagram deleted",
													description: `Deleted diagram with id ${id}`,
												});
											} catch (error) {
												toast({
													variant: "destructive",
													title: "Failed to delete diagram",
													description:
														error as string,
												});
											}
										}}
									>
										Delete Diagram
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>
				) : (
					<ResizablePanelGroup
						direction="horizontal"
						className="h-full"
					>
						<ResizablePanel
							defaultSize={50}
							onCompositionEnd={(e) => console.log(e)}
						>
							{tab === Tab.PARTS ? (
								<div className="flex flex-col w-fit-content p-2 space-y-2">
									<h1 className="text-2xl font-bold text-center p-2 bg-gray-100 rounded-md dark:bg-gray-800">
										Choose Elements:
									</h1>
									<ScrollArea
										className="flex flex-col items-center overflow-y-auto whitespace-nowrap rounded-md border h-[80vh] dark:border-gray-800"
										aria-orientation="vertical"
									>
										{Object.entries(partMappings).map(
											([name], idx) => (
												<div
													key={idx}
													className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer select-none dark:hover:bg-gray-800"
													onClick={() => {
														try {
															addPart({
																_id: id as string,
																part: {
																	name,
																	angle: 0,
																	x: 0,
																	y: 0,
																	locked: false,
																},
															})
																.unwrap()
																.then(
																	(
																		res: any
																	) => {
																		toast({
																			title: "Element added",
																			action: (
																				<Button
																					onClick={() =>
																						removePartHandler(
																							res
																								.data
																								.diagram
																								.parts[
																								-1
																							]
																								.id
																						)
																					}
																				>
																					Undo
																				</Button>
																			),
																			description: `Added ${name} to canvas`,
																			duration: 5000,
																		});
																	}
																);
														} catch (error) {
															toast({
																variant:
																	"destructive",
																title: "Failed to add element",
																description:
																	error as string,
															});
														}
													}}
												>
													{name}
												</div>
											)
										)}
									</ScrollArea>
								</div>
							) : tab === Tab.CODE ? (
								<div className="flex flex-col w-fit-content p-2 space-y-2">
									<h1 className="text-2xl font-bold text-center p-2 bg-gray-100 rounded-md dark:bg-gray-800">
										Generate Code:
									</h1>
									<div className="flex flex-col items-center space-y-2">
										<Button
											onClick={() => {
												try {
													generateCode({
														microcontroller:
															diagram?.microcontroller as Microcontroller,
														module: "wifi",
														prompt: "Connect to wifi",
													});
													toast({
														title: "Code generated",
														description:
															"Code generated successfully",
													});
												} catch (error) {
													toast({
														variant: "destructive",
														title: "Failed to generate code",
														description:
															error as string,
													});
												}
											}}
										>
											Generate Code
										</Button>
									</div>
									<CopyBlock
										text={generatedCode?.code as string}
										language="c"
										showLineNumbers={true}
									/>
								</div>
							) : tab === Tab.PREDICTION ? (
								<div className="flex flex-col w-fit-content p-2 space-y-2">
									<h1 className="text-2xl font-bold text-center p-2 bg-gray-100 rounded-md dark:bg-gray-800">
										Prediction:
									</h1>
									<div className="flex flex-col items-center space-y-2">
										<Button
											onClick={() => {
												try {
													generatePrediction({
														microcontroller:
															diagram?.microcontroller as Microcontroller,
														module: "wifi",
													});
												} catch (error) {
													toast({
														variant: "destructive",
														title: "Failed to generate prediction",
														description:
															error as string,
													});
												}
											}}
										>
											Generate Prediction
										</Button>
									</div>
									<CopyBlock
										text={
											generatedPrediction?.prediction as string
										}
										language="plaintext"
										showLineNumbers={true}
									/>
								</div>
							) : null}
						</ResizablePanel>
						<ResizableHandle />
						<ResizablePanel defaultSize={200}>
							<div
								className={`flex-1 relative ${
									showGrid ? "scene-grid" : ""
								}`}
								// id="canvas"
							>
								{/* <ContextMenu>
					<ContextMenuTrigger> */}
								{diagram &&
									diagram.parts.map((part, idx) => (
										// <KeepScale>
										<div key={idx}>
											<Dialog>
												<ContextMenu>
													<ContextMenuTrigger>
														<DiagramPart
															part={part}
														/>
													</ContextMenuTrigger>
													<ContextMenuContent className="w-48">
														<ContextMenuItem>
															<DialogTrigger
																asChild
															>
																<ContextMenuItem>
																	Rename
																</ContextMenuItem>
															</DialogTrigger>
														</ContextMenuItem>
														<ContextMenuItem>
															Move up
														</ContextMenuItem>
														<ContextMenuItem>
															Rotate
														</ContextMenuItem>
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
																		variant:
																			"destructive",
																		title: "Failed to remove element",
																		description:
																			error as string,
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
														<DialogTitle>
															Rename Element
														</DialogTitle>
														<DialogDescription>
															Enter a new name for
															the element
														</DialogDescription>
													</DialogHeader>
													<RenameElementForm
														part={part}
														initialName={part.name}
													/>
												</DialogContent>
											</Dialog>
										</div>

										// </KeepScale>
									))}
								{/* </ContextMenuTrigger>
					<ContextMenuContent>
						<ContextMenuCheckboxItem
							checked={showGrid}
							onCheckedChange={() => dispatch(toggleGrid())}
						>
							<div className="flex items-center space-x-2">
								Show Grid <div className="RightSlot">⌘+'</div>
							</div>
						</ContextMenuCheckboxItem>
					</ContextMenuContent>
				</ContextMenu> */}
							</div>
						</ResizablePanel>
					</ResizablePanelGroup>
				)}
			</div>
		</div>
	);
}
