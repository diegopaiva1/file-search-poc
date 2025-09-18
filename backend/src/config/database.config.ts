import { registerAs } from "@nestjs/config";

export interface DatabaseConfig {
  url: string;
  logging: boolean;
}

const buildDatabaseUrl = () => {
  const credentials = {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
  };

  const missing = Object.entries(credentials)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required database configuration: ${missing.join(", ")}. ` +
        "Please check your environment variables."
    );
  }

  const auth = `${credentials.user}:${credentials.password}`;
  const host = `${credentials.host}:${credentials.port}`;
  return `postgresql://${auth}@${host}/${credentials.database}`;
};

export default registerAs("database", (): DatabaseConfig => {
  return {
    url: buildDatabaseUrl(),
    logging: process.env.NODE_ENV === "development",
  };
});
