import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { CardFooter } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

import { useNavigate } from "react-router-dom";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useCreateDiagramMutation } from "@/redux/features/diagrams/diagrams-api-slice";
import { useAddPartMutation } from "@/redux/features/parts/parts-api-slice";

import { Microcontroller } from "@/types/diagrams";

import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
	name: z.string().nonempty(),
	microcontroller: z.enum([
		Microcontroller.ATTiny85,
		Microcontroller.ArduinoNano,
		Microcontroller.RasberryPiPico,
		Microcontroller.ESP32,
	]),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateDiagram() {
	const navigate = useNavigate();
	const { toast } = useToast();

	const [createDiagram, { isLoading }] = useCreateDiagramMutation();
	const [addPart] = useAddPartMutation();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			microcontroller: Microcontroller.ATTiny85,
		},
	});

	const handleSubmit = form.handleSubmit((data) => {
		try {
			createDiagram({
				name: data.name,
				microcontroller: data.microcontroller,
			})
				.unwrap()
				.then((res) => {
					const diagramId = res._id;
					// add 2 breadboards and 1 microcontroller to the diagram
					addPart({
						_id: diagramId,
						part: {
							x: 150,
							y: 250,
							name: "MCU Breadboard",
							locked: false,
							angle: 90,
						},
					});

					addPart({
						_id: diagramId,
						part: {
							x: 300,
							y: 250,
							name: "Main Breadboard",
							locked: false,
							angle: 90,
						},
					});
					addPart({
						_id: diagramId,
						part: {
							x: 150,
							y: 150,
							name: data.microcontroller,
							locked: false,
							angle: 0,
						},
					});
					toast({
						title: "Success",
						description: "Diagram created successfully.",
					});
					navigate("/dashboard");
				});
		} catch (error) {
			toast({
				title: "Error",
				description: "An error occurred while creating the diagram.",
			});
		}
	});

	return (
		<Card className="w-[350px] mx-auto my-auto">
			<CardHeader>
				<CardTitle>Let's create your diagram</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={handleSubmit}>
						<div className="grid w-full items-center gap-4">
							<div className="flex flex-col space-y-1.5">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Diagram Name *
											</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="microcontroller"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Microcontroller *
											</FormLabel>
											<Select {...field}>
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
															ATTiny85 (Default)
														</SelectItem>
														<SelectItem
															value={
																Microcontroller.ArduinoNano
															}
														>
															Arduino Nano
														</SelectItem>
														<SelectItem
															value={
																Microcontroller.RasberryPiPico
															}
														>
															Rasberry Pi Pico
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
										</FormItem>
									)}
								/>
							</div>
						</div>
					</form>
				</Form>
			</CardContent>
			<CardFooter className="flex justify-between">
				<Button
					variant="outline"
					onClick={() => navigate("/dashboard")}
				>
					Cancel
				</Button>
				<Button
					disabled={isLoading}
					onClick={handleSubmit}
					type="submit"
				>
					Create
				</Button>
			</CardFooter>
		</Card>
	);
}
