import { apiSlice } from "@/redux/api/api-slice";
import type { Connection } from "@/types/connections";
import { addConnection } from "@/utils/pathfinding";
import { getPort, closePort, getWriter } from "@/utils/serial";

// export const serialApiSlice = apiSlice.injectEndpoints({
// 	endpoints: (builder) => ({
// 		addConnection: builder.query<
// 			{ response: string },
// 			Connection
// 		>({
// 			queryFn: (connection) => {
// 				getPort().then((port) => {
// 					if (port instanceof Error) {
// 						return { response: port.message };
// 					}

// 					return new Promise((resolve, reject) => {
// 						try {
// 							let result = addConnection(connection);
// 							if (result.connections.length === 0) {
// 								reject({ response: "No path found" });
// 							}
// 							const writer = getWriter();
// 							writer.write(
// 								new TextEncoder().encode(
// 									result.connections.join("\n")
// 								)
// 							);
// 							writer.releaseLock();
// 							resolve({ data: { response: "Connection added" } });
// 						} catch (error) {
// 							let newErr = error as Error;
// 							reject({ response: newErr.message });
// 						}
// 					});
// 				});
// 			},
// 		}),
// 	}),
// });
