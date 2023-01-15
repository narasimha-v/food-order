export class CustomAPIError extends Error {
	statusCode: number;
	json?: any;

	constructor(message: string, statusCode: number, json?: JSON) {
		super(message);
		this.statusCode = statusCode;
		this.json = json;
	}
}

export const createCustomError = (
	msg: string,
	statusCode: number,
	json?: any
) => {
	return new CustomAPIError(msg, statusCode, json);
};
