import React, { useEffect } from "react";

import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import { ScrollArea } from "@/components/ui/scroll-area";

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

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";

import { useToast } from "@/components/ui/use-toast";

import { Icons } from "@/components/icons";

import { Combine, CodeXml, Component, Settings } from "lucide-react";

import { useTheme } from "@/hooks/useTheme";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import {
	useDeleteDiagramMutation,
	useUpdateDiagramMutation,
} from "@/redux/features/diagrams/diagrams-api-slice";
import {
	selectDiagramById,
	selectOpenDeleteDiagramDialog,
	setOpenDeleteDiagramDialog,
} from "@/redux/features/diagrams/diagrams-slice";

import {
	useAddPartMutation,
	useRemovePartMutation,
} from "@/redux/features/parts/parts-api-slice";

import {
	useCreateConnectionMutation,
	useDeleteConnectionMutation,
} from "@/redux/features/connections/connections-api-slice";

import {
	useLazyCodeQuery,
	useLazyWiringQuery,
} from "@/redux/features/predictions/predictions-api-slice";
import {
	Tab,
	setTab,
	selectTab,
	selectCode,
	selectPrediction,
} from "@/redux/features/predictions/predictions-slice";
import { PredictionForm } from "@/components/canvas/prediction-form";

import {
	partMappings,
	partTagsToConnectionStrings,
} from "@/types/wokwi-elements-mapping";

import { useParams } from "react-router-dom";

import { Pin } from "@/types/connections";
import { Button } from "@/components/ui/button";
import { Diagram, Microcontroller } from "@/types/diagrams";

import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useNavigate } from "react-router-dom";

import { CopyBlock, atomOneDark, atomOneLight } from "react-code-blocks";

import CanvasFlow from "@/components/canvas/canvas-flow";
import { useSerial } from "@/contexts/SerialContext";
import { addConnection } from "@/utils/pathfinding";

const updateDiagramSchema = z.object({
	name: z.string().min(1),
	microcontroller: z.enum([
		Microcontroller.ATTiny85,
		Microcontroller.ArduinoNano,
		Microcontroller.RasberryPiPico,
		Microcontroller.ESP32,
	]),
});

type UpdateDiagramFormValues = z.infer<typeof updateDiagramSchema>;

export default function Canvas(): JSX.Element {
	const { id } = useParams<{ id: string }>();

	const [updateDiagram, { isLoading: isLoadingUpdateDiagram }] =
		useUpdateDiagramMutation();
	const [deleteDiagram, { isLoading: isLoadingDeleteDiagram }] =
		useDeleteDiagramMutation();

	const [removePart, { isLoading: isLoadingRemovePartMutation }] =
		useRemovePartMutation();

	const [, { isLoading: isLoadingGeneratePredictionMutation }] =
		useLazyWiringQuery();
	const [, { isLoading: isLoadingGenerateCodeMutation }] = useLazyCodeQuery();

	const diagram = useAppSelector(state =>
		selectDiagramById(state, id as string)
	);

	const tab = useAppSelector(selectTab);
	const openDeleteDiagramDialog = useAppSelector(
		selectOpenDeleteDiagramDialog
	);
	const generatedCode = useAppSelector(selectCode);
	const generatedPrediction = useAppSelector(selectPrediction);

	const [addPart, { isLoading: isLoadingAddPartMutation }] =
		useAddPartMutation();

	const { theme } = useTheme();
	const { toast, dismiss, toasts } = useToast();

	const dispatch = useAppDispatch();
	const navigate = useNavigate();

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
				diagramId: id as string,
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

	const updateDiagramForm = useForm<UpdateDiagramFormValues>({
		resolver: zodResolver(updateDiagramSchema),
		defaultValues: {
			name: diagram?.name ?? "",
			microcontroller:
				diagram?.microcontroller ?? Microcontroller.ATTiny85,
		},
	});

	const onSubmit: SubmitHandler<UpdateDiagramFormValues> = data => {
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

	const themeOptions = {
		dark: atomOneDark,
		light: atomOneLight,
		system: window.matchMedia("(prefers-color-scheme: dark)").matches
			? atomOneDark
			: atomOneLight,
	};

	// @ts-ignore
	const themeOption = themeOptions[theme];

	return (
		<div className="flex flex-1">
			<aside className="w-14 flex-col border-r bg-background sm:flex sm:h-full">
				<nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
					<Tooltip>
						<TooltipTrigger
							asChild
							onClick={() => dispatch(setTab(Tab.PARTS))}>
							<div
								className={`flex h-9 w-9 items-center justify-center rounded-lg ${
									tab === Tab.PARTS
										? "bg-accent text-accent-foreground"
										: "text-muted-foreground"
								} transition-colors hover:text-foreground md:h-8 md:w-8`}>
								<Component className="h-5 w-5" />
								<span className="sr-only">Parts</span>
							</div>
						</TooltipTrigger>
						<TooltipContent side="right">Parts</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger
							asChild
							onClick={() => dispatch(setTab(Tab.CODE))}>
							<div
								className={`flex h-9 w-9 items-center justify-center rounded-lg 
								${
									tab === Tab.CODE
										? "bg-accent text-accent-foreground"
										: "text-muted-foreground"
								} transition-colors hover:text-foreground md:h-8 md:w-8`}>
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
							onClick={() => dispatch(setTab(Tab.PREDICTION))}>
							<div
								className={`flex h-9 w-9 items-center justify-center rounded-lg ${
									tab === Tab.PREDICTION
										? "bg-accent text-accent-foreground"
										: "text-muted-foreground"
								} transition-colors hover:text-foreground md:h-8 md:w-8`}>
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
							}}>
							<div
								className={`flex h-9 w-9 items-center justify-center rounded-lg ${
									tab === Tab.SETTINGS
										? "bg-accent text-accent-foreground"
										: "text-muted-foreground"
								}  transition-colors hover:text-foreground md:h-8 md:w-8`}>
								<Settings className="h-5 w-5" />
								<span className="sr-only">Settings</span>
							</div>
						</TooltipTrigger>
						<TooltipContent side="right">Settings</TooltipContent>
					</Tooltip>
				</nav>
			</aside>
			<div className="flex-1 relative w-full">
				{tab === Tab.SETTINGS ? (
					<div className="flex flex-col w-fit-content p-2 space-y-2 px-4">
						<PageHeader className="flex w-full flex-col-reverse items-center justify-between gap-4 px-6 md:flex-row">
							<PageHeaderHeading>Settings</PageHeaderHeading>
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
										<Form {...updateDiagramForm}>
											<form
												onSubmit={updateDiagramForm.handleSubmit(
													onSubmit
												)}>
												<div className="grid gap-2">
													<div className="grid gap-3">
														<FormField
															control={
																updateDiagramForm.control
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
																updateDiagramForm.control
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
																			{...field}>
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
																						}>
																						ATTiny85
																					</SelectItem>
																					<SelectItem
																						value={
																							Microcontroller.ArduinoNano
																						}>
																						Arduino
																						Nano
																					</SelectItem>
																					<SelectItem
																						value={
																							Microcontroller.RasberryPiPico
																						}>
																						Rasberry
																						Pi
																						Pico
																					</SelectItem>
																					<SelectItem
																						value={
																							Microcontroller.ESP32
																						}>
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
																(updateDiagramForm.getValues()
																	.name ===
																	diagram?.name &&
																	updateDiagramForm.getValues()
																		.microcontroller ===
																		diagram?.microcontroller)
															}>
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
									<AlertDialog open={openDeleteDiagramDialog}>
										<AlertDialogTrigger asChild>
											<Button
												variant="destructive"
												onClick={() =>
													dispatch(
														setOpenDeleteDiagramDialog(
															{
																open: true,
															}
														)
													)
												}>
												Delete Diagram
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>
													Are you sure you want to
													delete this diagram?
												</AlertDialogTitle>
												<AlertDialogDescription>
													This action cannot be
													undone. This will delete all
													parts and settings
													associated with this
													diagram.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel
													onClick={() => {
														dispatch(
															setOpenDeleteDiagramDialog(
																{
																	open: false,
																}
															)
														);
													}}>
													Cancel
												</AlertDialogCancel>
												<AlertDialogAction className="px-0">
													<Button
														variant="destructive"
														disabled={
															isLoadingDeleteDiagram
														}
														onClick={() => {
															try {
																deleteDiagram(
																	id as string
																)
																	.unwrap()
																	.then(
																		() => {
																			dispatch(
																				setOpenDeleteDiagramDialog(
																					{
																						open: false,
																					}
																				)
																			);
																			navigate(
																				"/dashboard"
																			);
																			toast(
																				{
																					title: "Diagram deleted",
																					description: `Deleted diagram with id ${id}`,
																				}
																			);
																		}
																	);
															} catch (error) {
																toast({
																	variant:
																		"destructive",
																	title: "Failed to delete diagram",
																	description:
																		error as string,
																});
															}
														}}>
														{isLoadingDeleteDiagram && (
															<Icons.spinner className="h-5 w-5 animate-spin mr-2" />
														)}
														Delete Diagram
													</Button>
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</CardContent>
							</Card>
						</div>
					</div>
				) : (
					<ResizablePanelGroup
						direction="horizontal"
						className="h-full">
						<ResizablePanel defaultSize={20}>
							{tab === Tab.PARTS ? (
								<div className="flex flex-col w-fit-content p-2 space-y-2 h-full">
									<h1 className="text-2xl font-bold text-center p-2">
										Choose Elements
									</h1>
									<ScrollArea
										className="flex flex-col items-center overflow-y-auto whitespace-nowrap rounded-md border h-[80vh] dark:border-gray-800"
										aria-orientation="vertical">
										{Object.entries(partMappings).map(
											([name], idx) => (
												<div
													key={idx}
													className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer select-none dark:hover:bg-gray-800"
													onClick={() => {
														addPart({
															diagramId:
																id as string,
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
																(res: {
																	diagram: Diagram;
																}) => {
																	toast({
																		title: "Element added",
																		action: (
																			<Button
																				onClick={() =>
																					// give last part id
																					removePartHandler(
																						res.diagram.parts.slice(
																							-1
																						)[0]
																							.id
																					)
																				}>
																				Undo
																			</Button>
																		),
																		description: `Added ${name} to canvas`,
																		duration: 5000,
																	});
																}
															)
															.catch(error => {
																toast({
																	variant:
																		"destructive",
																	title: "Failed to add element",
																	description:
																		error as string,
																});
															});
													}}>
													{name}
												</div>
											)
										)}
									</ScrollArea>
								</div>
							) : tab === Tab.CODE ? (
								<div className="flex flex-col w-fit-content p-2 space-y-2 h-full">
									<h1 className="text-2xl font-bold text-center p-2">
										Generate Code
									</h1>

									{/* <pre className="mt-2 rounded-md p-4 bg-slate-950 dark:bg-gray-800 max-w-sm overflow-x-auto h-96"> */}
									{isLoadingGenerateCodeMutation ? (
										<div className="flex justify-center items-center">
											<Icons.spinner className="h-6 w-6 animate-spin" />
											<span className="ml-2 text-white">
												Generating code...
											</span>
										</div>
									) : generatedCode.code !== "" ? (
										// <code className="text-white dark:text-gray-200 whitespace-pre-wrap">
										// 	{JSON.stringify(
										// 		generatedCode,
										// 		null,
										// 		2
										// 	)}
										// </code>
										<div className="flex flex-1 flex-col items-center w-full overflow-y-scroll px-2 py-3 rounded-md bg-gray-100 dark:bg-gray-800">
											<span className="text-sm font-bold text-muted-foreground mb-3">
												{generatedCode.beforeText}
											</span>
											<CopyBlock
												language={
													generatedCode.language
												}
												text={generatedCode.code}
												showLineNumbers={false}
												theme={themeOption}
												wrapLongLines
												codeBlock
											/>
											<span className="text-sm font-bold text-muted-foreground mt-3">
												{generatedCode.afterText}
											</span>
										</div>
									) : (
										<div className="flex justify-center items-center mt-3">
											<span className="text-white">
												No code generated yet
											</span>
										</div>
									)}
									<div className="flex flex-col items-center space-y-2">
										<PredictionForm
											microcontroller={
												diagram?.microcontroller ||
												Microcontroller.ATTiny85
											}
											type="code"
										/>
									</div>
									{/* </pre> */}
								</div>
							) : tab === Tab.PREDICTION ? (
								<div className="flex flex-col w-fit-content p-2 space-y-2">
									<h1 className="text-2xl font-bold text-center p-2">
										Prediction
									</h1>
									<div className="flex flex-col items-center space-y-2">
										<PredictionForm
											microcontroller={
												diagram?.microcontroller ||
												Microcontroller.ATTiny85
											}
											type="wiring"
										/>
									</div>
									<div className="flex flex-col items-center space-y-2">
										{isLoadingGeneratePredictionMutation ? (
											<div className="flex justify-center items-center">
												<Icons.spinner className="h-6 w-6 animate-spin" />
												<span className="ml-2 text-white">
													Generating prediction...
												</span>
											</div>
										) : generatedPrediction !== "" ? (
											<div className="flex flex-1 flex-col items-center w-full px-2 py-3 rounded-md bg-gray-100 dark:bg-gray-800">
												<span className="text-sm font-bold text-muted-foreground mb-3">
													{generatedPrediction}
												</span>
											</div>
										) : (
											<div className="flex justify-center items-center mt-3">
												<span className="text-white">
													No prediction generated yet
												</span>
											</div>
										)}
									</div>
								</div>
							) : null}
						</ResizablePanel>
						<ResizableHandle />
						<ResizablePanel>
							{diagram && <CanvasFlow diagram={diagram} />}
						</ResizablePanel>
					</ResizablePanelGroup>
				)}
			</div>
		</div>
	);
}
