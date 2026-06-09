import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { Movie } from '../movie/entities/movie.entity';

// Load .env for the standalone CLI process (the running app uses ConfigModule).
config();

/**
 * DataSource used ONLY by the TypeORM CLI for migrations. The running app
 * configures its own connection in AppModule — keep the two option sets in sync.
 */
export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Movie],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
