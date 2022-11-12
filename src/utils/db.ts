import mongoose from 'mongoose';

export const connectDB = async () => {
	try {
		const MONGO_URI = process.env.MONGO_URI;
		if (!MONGO_URI) throw new Error('MONGO_URI not found.');
		console.log('Connecting to MongoDB...');
		const conn = await mongoose.connect(MONGO_URI, {
			retryWrites: true,
			w: 'majority'
		});
		console.log(`MongoDB connected: ${conn.connection.host}`);
	} catch (error: any) {
		console.error(`Error:${error.message}`);
		process.exit(1);
	}
};
