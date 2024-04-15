import { Button } from "@/components/ui/button";

import { Link } from "react-router-dom";

import { CableUndefined } from "@/components/layouts/AppLayout";
import { Footer } from "@/components/layouts/Footer";
import { Cable } from "lucide-react";

export default function Home(): JSX.Element {
	return (
		<div className="h-screen flex flex-col justify-between">
			<div className="absolute left-0 top-0 -z-10 h-full w-full overflow-hidden">
				<div
					className="pointer-events-none absolute inset-x-0 transform-gpu overflow-hidden blur-3xl sm:-top-80"
					aria-hidden="true">
					<div
						className="relative left-[calc(50%)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-orange-400 to-primary-muted opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
						style={{
							clipPath:
								"polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
						}}
					/>
				</div>
				<div
					className="pointer-events-none absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
					aria-hidden="true">
					<div
						className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-red-300 to-orange-800 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
						style={{
							clipPath:
								"polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
						}}
					/>
				</div>
			</div>
			<header className="sticky top-0 z-50 w-full bg-gradient-to-b from-white via-white/60 via-70% dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
				<nav
					className="mx-auto flex max-w-7xl items-center justify-between gap-x-6 p-6 lg:px-8"
					aria-label="Global">
					<div className="flex lg:flex-1">
						<Link to="/">
							<CableUndefined />
						</Link>
					</div>
					{/* <div className="hidden lg:flex lg:gap-x-12">
						<a
							href="/docs"
							target="_blank"
							className="text-sm font-semibold leading-6 text-gray-900"
							rel="noreferrer"
						>
							Docs
						</a>
						<a
							href="/pricing"
							target="_self"
							className="text-sm font-semibold leading-6 text-gray-900"
							rel="noreferrer"
						>
							Pricing
						</a>
					</div> */}
					<div className="hidden flex-1 items-center justify-end gap-x-6 md:flex">
						<Button
							className="hidden lg:flex"
							variant={"secondary"}>
							<Link to="/login">Log in</Link>
						</Button>
					</div>
				</nav>
			</header>
			<div className="-mt-16">
				<div className="flex items-center justify-center overflow-auto">
					<div className="relative isolate px-6 py-14 lg:px-8">
						<div className="max-w-2xl">
							<div className="hidden sm:mb-8 sm:flex sm:justify-center">
								<div className="relative rounded-full px-3 py-1 text-sm leading-6 text-muted-foreground bg-primary-muted">
									Announcing our open source release!{" "}
									<Link
										className="font-semibold text-primary"
										to="https://github.com/Pupe6"
										target="_blank">
										<span
											className="absolute inset-0"
											aria-hidden="true"></span>
										More info <span aria-hidden="true">→</span>
									</Link>
								</div>
							</div>
							<div className="text-center">
								<h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-gray-100">
									Connecting the dots,
									<br />
									without the wires
								</h1>
								<p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
									Embedded programming is better than ever. Cable connections need
									catching up.
								</p>
								<div className="mt-10 flex items-center justify-center gap-x-6">
									<Button variant={"secondary"}>
										<Link to="/login">Get started</Link>
									</Button>
									{/* <Link
										className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100"
										to="/docs"
									>
										Learn more{" "}
										<span aria-hidden="true">→</span>
									</Link> */}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
}
