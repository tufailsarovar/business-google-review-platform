import dotenv from "dotenv";

dotenv.config();

export const loadEnv = () => {
  const requiredVariables = [
    "MONGO_URI",
    "JWT_SECRET",
  ];

  const missingVariables =
    requiredVariables.filter(
      (variable) =>
        !process.env[variable] ||
        process.env[variable].trim() === ""
    );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVariables.join(
        ", "
      )}`
    );
  }

  return process.env;
};

export default loadEnv;