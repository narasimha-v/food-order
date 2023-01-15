export const generateOtp = () => {
	const otp = Math.floor(100000 + Math.random() * 900000);
	let expiry = new Date();
	expiry.setMinutes(expiry.getMinutes() + 30);
	return { otp, expiry };
};

export const onRequestOtp = async (otp: number, to: string) => {
	const accountSid = process.env.TWILIO_ACCOUNT_SID;
	const authToken = process.env.TWILIO_AUTH_TOKEN;
	const client = require('twilio')(accountSid, authToken);
	const response = await client.messages.create({
		body: `Your OTP is ${otp}`,
		from: process.env.TWILIO_PHONE_NUMBER,
		to
	});
	return response;
};
