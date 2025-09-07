import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeorm from './config/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegionController } from './domains/regions/region.controller';
import { RegionModule } from './domains/regions/region.module';
import { DistrictsModule } from './domains/districts/districts.module';
import { ConflictsModule } from './domains/conflicts/conflict.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const typeormConfig = configService.get('typeorm');
        if (!typeormConfig) {
          throw new Error('TypeORM configuration is missing');
        }
        return typeormConfig;
      },
    }),
    RegionModule,
    DistrictsModule,
    ConflictsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
