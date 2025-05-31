import Pino, { type Logger, type LevelWithSilent } from "pino";
const VALID_LOG_LEVELS: LevelWithSilent[] = [
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
  "silent",
];
const DEFAULT_LOG_LEVEL: LevelWithSilent = "info";

function getLogLevel(envLevel?: string): LevelWithSilent {
  const level = envLevel?.toLowerCase();
  if (level && VALID_LOG_LEVELS.includes(level as LevelWithSilent)) {
    return level as LevelWithSilent;
  }
  return DEFAULT_LOG_LEVEL;
}

interface LoggerOptions {
  name?: string;
  level?: LevelWithSilent;
  prettyPrint?: boolean;
  // Add other pino options as needed
}

export async function createLogger(options?: LoggerOptions): Promise<Logger> {
  const nodeEnv = process.env.NODE_ENV || "development";
  const pretty = options?.prettyPrint ?? nodeEnv === "development";
  const logLevel = getLogLevel(options?.level || process.env.LOG_LEVEL);

  const pinoOptions: Pino.LoggerOptions = {
    level: logLevel,
    name: options?.name,
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
    formatters: {
      level: (label) => ({ level: label.toUpperCase() }),
      // bindings: (bindings) => ({ // To customize pid, hostname if needed
      //   pid: bindings.pid,
      //   hostname: bindings.hostname,
      //   // service: options?.name || 'unknown-service'
      // }),
    },
    // Standard pino error serializer
    serializers: {
      ...Pino.stdSerializers, // Includes err, req, res
    },
  };

  if (pretty) {
    const pinoPretty = (await import("pino-pretty")).PinoPretty;
    // For pretty printing, we create a stream
    const prettyStream = pinoPretty({
      colorize: true,
      translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
      ignore: "pid,hostname,name", // 'name' is often part of the log line in pretty format
      messageFormat: (log, messageKey, _levelLabel) => {
        // Custom message format if you want the name to appear
        const name = log.name ? `[${log.name}] ` : "";
        return `${name}${log[messageKey]}`;
      },
    });
    // Pino can take a stream directly
    return Pino(pinoOptions, prettyStream);
  }

  return Pino(pinoOptions);
}

export const pino = await createLogger({
  prettyPrint: false,
});
