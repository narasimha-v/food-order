export class CustomAPIError extends Error {
	statusCode: number;

	constructor(message: string, statusCode: number) {
		super(message);
		this.statusCode = statusCode;
	}
}

export const createCustomError = (msg: string, statusCode: number) => {
	return new CustomAPIError(msg, statusCode);
};
