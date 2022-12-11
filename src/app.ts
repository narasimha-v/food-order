import dotenv from 'dotenv';
import express from 'express';
import { winstonErrorLogger, winstonLogger } from './middleware';
import { api } from './routes';
import { connectDB } from './utils';
import path from 'path';

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, './images')));
app.use(winstonLogger);
app.use(api);
app.use(winstonErrorLogger);

const start = async () => {
	try {
		await connectDB();
		app.listen(PORT, () => {
			console.log(`Server running on http://localhost:${PORT}`);
		});
	} catch (error: any) {
		console.error(`Error:${error.message}`);
	}
};

start();
