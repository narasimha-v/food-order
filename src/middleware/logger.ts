import expressWinston from 'express-winston';
import winston, { addColors } from 'winston';

addColors({ info: 'cyan', warn: 'yellow', error: 'red', debug: 'magenta' });

const winstonLogger = expressWinston.logger({
	transports: [new winston.transports.Console()],
	format: winston.format.combine(
		winston.format.label({ label: '[LOGGER]' }),
		winston.format.timestamp({ format: 'YY-MM-DD HH:mm:ss' }),
		winston.format.printf((info) => {
			const { timestamp, label, level, message, meta } = info;
			return `${timestamp} ${label} [${level.toUpperCase()}] : ${message} ${
				meta.res.statusCode
			}`;
		}),
		winston.format.colorize({ all: true })
	)
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
