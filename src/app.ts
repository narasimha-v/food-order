import dotenv from 'dotenv';
import express from 'express';
import { winstonLogger, winstonErrorLogger } from './middleware';
import { api } from './routes';

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(winstonLogger);
app.use(api);
app.use(winstonErrorLogger);

const start = async () => {
	try {
		// TODO: Database connection
		app.listen(PORT, () => {
			console.log(`Server running on http://localhost:${PORT}`);
		});
	} catch (error: any) {
		console.error(`Error:${error.message}`);
	}
};

start();
