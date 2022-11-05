import expressWinston from 'express-winston';
import winston from 'winston';

const winstonLogger = expressWinston.logger({
	transports: [new winston.transports.Console()],
	format: winston.format.combine(
		winston.format.colorize({
			all: true,
			colors: { error: 'red', warn: 'yellow', info: 'cyan', debug: 'green' }
		}),
		winston.format.json(),
		winston.format.prettyPrint()
	),
	meta: true,
	msg: 'HTTP {{req.method}} {{req.url}}',
	expressFormat: true,
	colorize: true
});

const winstonErrorLogger = expressWinston.errorLogger({
	transports: [new winston.transports.Console()],
	format: winston.format.combine(
		winston.format.colorize(),
		winston.format.json()
	)
});

export { winstonLogger, winstonErrorLogger };
