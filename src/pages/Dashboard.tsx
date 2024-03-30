import { useNavigate } from "react-router-dom";

import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import { useGetDiagramsQuery } from "@/redux/features/diagrams/diagrams-api-slice";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Dashboard() {
	const navigate = useNavigate();

	const { data: diagrams, isLoading } = useGetDiagramsQuery();

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="mx-auto flex max-w-7xl grow flex-col py-6">
			<PageHeader className="flex w-full flex-col-reverse items-center justify-between gap-4 px-6 md:flex-row">
				<PageHeaderHeading>Your Diagrams</PageHeaderHeading>
				<Button onClick={() => navigate("/dashboard/new")}>
					<Plus />
					<span className="blockmd:hiddenlg:blockml-2">
						Create New Diagram
					</span>
				</Button>
			</PageHeader>
			<ul
				className="flex w-full flex-col items-center justify-center gap-2 overflow-y-auto p-6 md:grid md:grid-cols-2 md:gap-0 lg:grid-cols-3"
				role="list"
			>
				{diagrams ? (
					diagrams.map((diagram) => (
						<Card
							onClick={() =>
								navigate(`/dashboard/${diagram._id}`)
							}
							key={diagram._id}
							className="w-[368px] h-[256px] cursor-pointer"
						>
							<div
								className="flex h-2/6 items-center justify-center bg-neutral-100 px-4 py-5 font-bold text-background dark:bg-zinc-950 sm:p-6 rounded-t-sm"
								style={{
									backgroundImage:
										'url(\'data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z" fill="%23e51c23" fill-opacity="0.4" fill-rule="evenodd"/%3E%3C/svg%3E\')',
								}}
							/>
							<CardContent className="p-4">
								<div className="text-lg font-bold">
									{diagram.name}
								</div>
								<div className="text-sm text-muted-foreground">
									Created on{" "}
									{new Date(
										diagram.createdAt
									).toLocaleString()}
								</div>
							</CardContent>
						</Card>
					))
				) : (
					<div>No diagrams found</div>
				)}
			</ul>
		</div>
	);
}
