function splitCodeResponse(inputStr: string) {
	const parts: string[] = inputStr.split("```");

	// Initialize variables to hold the parts
	let beforeText: string = "";
	let language: string = "";
	let code: string = "";
	let afterText: string = "";

	// Assign parts based on the split
	if (parts.length > 1) {
		beforeText = parts[0];

		const languageAndCode: string[] = parts[1].split("\n");
		language = languageAndCode[0];
		code = languageAndCode.slice(1).join("\n");

		if (parts.length > 2) {
			afterText = parts.slice(2).join("```");
		}
	}

	return { beforeText, language, code, afterText };
}

export { splitCodeResponse };
