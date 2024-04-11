import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectGroup,
	SelectLabel,
	SelectItem,
} from "@/components/ui/select";

import { Icons } from "@/components/icons";

import {
	useLazyCodeQuery,
	useLazyWiringQuery,
} from "@/redux/features/predictions/predictions-api-slice";
import { predictionModules } from "@/types/predictions";

import type { Microcontroller } from "@/types/diagrams";

import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "../ui/use-toast";
import { Textarea } from "../ui/textarea";

const wiringSchema = z.object({
	module: z.string(),
});

const codeSchema = z.object({
	prompt: z.string(),
	module: z.string(),
});

type WiringFormValues = z.infer<typeof wiringSchema>;
type CodeFormValues = z.infer<typeof codeSchema>;

interface Props {
	type: "wiring" | "code";
	microcontroller: Microcontroller;
}
export function PredictionForm({ type, microcontroller }: Props) {
	const [generateCode, { isLoading: isLoadingGenerateCodeMutation }] =
		useLazyCodeQuery();
	const [
		generatePrediction,
		{ isLoading: isLoadingGeneratePredictionMutation },
	] = useLazyWiringQuery();

	const form = useForm<WiringFormValues | CodeFormValues>({
		resolver: zodResolver(type === "wiring" ? wiringSchema : codeSchema),
	});

	const { toast, dismiss } = useToast();

	const onSubmitGenerateCode: SubmitHandler<CodeFormValues> = (data) => {
		try {
			generateCode({
				microcontroller,
				module: data.module,
				prompt: data.prompt,
			})
				.unwrap()
				.then((res) => {
					toast({
						title: "Code generated",
						description: "Code generated successfully",
					});
					dismiss("generate-code");
				});
			toast({
				title: "Code is being generated",
				description: "Generating code for the selected module",
				action: <Icons.spinner className="h-4 w-4 animate-spin" />,
			});
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Failed to generate code",
				description: error as string,
			});
		}
	};

	const onSubmitGenerateWiring: SubmitHandler<WiringFormValues> = (data) => {
		try {
			generatePrediction({
				microcontroller,
				module: data.module,
			})
				.unwrap()
				.then((res) => {
					toast({
						title: "Wiring generated",
						description: "Wiring generated successfully",
					});
					dismiss("generate-wiring");
				});
			toast({
				title: "Wiring is being generated",
				description: "Generating wiring for the selected module",
				action: <Icons.spinner className="h-4 w-4 animate-spin" />,
			});
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Failed to generate wiring",
				description: error as string,
			});
		}
	};
	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(
					type === "wiring"
						? (onSubmitGenerateWiring as any)
						: (onSubmitGenerateCode as any)
				)}
			>
				<FormField
					control={form.control}
					name="module"
					render={({ field, formState }) => (
						<FormItem>
							<FormLabel>Choose Module</FormLabel>
							<FormControl>
								<Select
									{...field}
									onValueChange={field.onChange}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select a module" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectLabel>
												Choose Module
											</SelectLabel>
											{predictionModules[
												microcontroller
											].map((module, idx) => (
												<SelectItem
													key={idx}
													value={module}
												>
													{module}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage>
								{formState.errors.module?.message}
							</FormMessage>
						</FormItem>
					)}
				/>
				{type === "code" && (
					<FormField
						control={form.control}
						name="prompt"
						render={({ field, formState }) => (
							<FormItem>
								<FormLabel>Prompt</FormLabel>
								<FormControl>
									<Textarea
										{...field}
										className="rounded-md"
										rows={3}
									/>
								</FormControl>
								<FormMessage>
									{"prompt" in formState.errors &&
										formState.errors.prompt?.message}
								</FormMessage>
							</FormItem>
						)}
					/>
				)}
				<Button type="submit" disabled={form.formState.isSubmitting}>
					{type === "wiring" ? "Generate Wiring" : "Generate Code"}
				</Button>
			</form>
		</Form>
	);
}
