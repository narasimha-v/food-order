import expressWinston from 'express-winston';
import winston from 'winston';

const winstonLogger = expressWinston.logger({
	transports: [new winston.transports.Console()],
	format: winston.format.combine(
		winston.format.json(),
		winston.format.colorize({ all: true }),
		winston.format.prettyPrint({ colorize: true })
	),
	msg: '{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}',
	meta: true,
	expressFormat: true
});

const winstonErrorLogger = expressWinston.errorLogger({
	transports: [new winston.transports.Console()],
	format: winston.format.combine(
		winston.format.json(),
		winston.format.colorize({ all: true }),
		winston.format.prettyPrint({ colorize: true })
	)
});

export { winstonLogger, winstonErrorLogger };
