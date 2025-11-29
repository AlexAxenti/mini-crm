import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: 'postgresql://postgres:Fq9gYUxNCSXpoUeN@db.mdnekoynwfbhdaawrujl.supabase.co:5432/postgres?schema=contacts',
  },
});
