import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MovieModule } from './movie/movie.module';
import { S3Module } from './s3/s3.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => ({
        type: 'mysql',
        host: config.getOrThrow<string>('DB_HOST'),
        port: parseInt(config.get<string>('DB_PORT', '3306'), 10),
        username: config.getOrThrow<string>('DB_USERNAME'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_NAME'),
        // Feature modules register their entities via TypeOrmModule.forFeature();
        // autoLoadEntities wires those in without a manual entities array.
        autoLoadEntities: true,
        // Never auto-sync schema — migrations are applied manually.
        synchronize: false,
      }),
    }),
    MovieModule,
    S3Module,
  ],
})
export class AppModule {}
