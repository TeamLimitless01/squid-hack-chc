import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.POSTGRE_URI as string,
  },
});
