import "dotenv/config";
export const config = {
  db: process.env.DB_URL || "",
  jwt_secret: process.env.JWT_SECRET || "",
  redis_url: process.env.REDIS_URL || "",
  redis_token: process.env.REDIS_TOKEN || "",
};
