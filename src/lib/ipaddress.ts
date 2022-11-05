import { Request } from 'express';

export const getIPAddress = (req: Request) => {
	if (
		typeof req.headers['x-forwarded-for'] == 'string' &&
		req.headers['x-forwarded-for'].length
	) {
		return req.headers['x-forwarded-for'].split(',')[0];
	}

	return req.socket.remoteAddress?.split(':').pop();
};
