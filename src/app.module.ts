import * as multer from 'multer'
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { MailerModule } from '@nestjs-modules/mailer'; 
import { ScheduleModule } from '@nestjs/schedule'
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { UserEntity } from './user/user.entity';
import { DockerModule } from './docker/docker.module';
import { CatelogModule } from './catelog/catelog.module';
import { SpecsModule } from './specs/specs.module';
import { FilesModule } from './files/files.module';
import { StockModule } from './stock/stock.module';
import { FutureProjectsModule } from './future-projects/future-projects.module';
import { TaskModule } from './task/task.module';
import { InquiryModule } from './inquiry/inquiry.module';
import { TreeModule } from './tree/tree.module';
import { FileEntity } from './files/files.entity';
import { ProjectModule } from './project/project.module';
import { ProjectEntity } from './project/project.entity';
import { StockEntity } from './stock/stock.entity';
import { SoftwareEntity } from './software/software.entity';
import { FutureProjectEntity } from './future-projects/future-projects.entity';
import { SpecEntity } from './specs/spces.entity';
import { TaskEntity } from './task/task.entity';
import { InquiryEntity } from './inquiry/inquiry.entity';
import { SoftwareModule } from './software/software.module';
import { ContainerEntity } from './docker/container/container.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SystemModule } from './system/system.module';
import { SystemEntity } from './system/system.entity';
import { MemberModule } from './member/member.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRoot({
      database: process.env.MYSQL_DATABASE,
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      port: parseInt(process.env.MYSQL_TCP_PORT!),
      type: "mysql",
      host: "mysql",
      entities: [
        UserEntity, 
        FileEntity, 
        ProjectEntity, 
        StockEntity, 
        SoftwareEntity, 
        FutureProjectEntity,
        SpecEntity,
        TaskEntity,
        InquiryEntity,
        ContainerEntity,
        SystemEntity
      ],
      synchronize: true
    }),

    MulterModule.register({
      storage: multer.diskStorage({
        destination: "./files",
        filename: (_, file, callback) => {
          return callback(null, file.originalname);
        }
      }),
    }),
    JwtModule.register({
      secret: process.env.AUTH_SECRET_KEY,
      signOptions: { expiresIn: "24h" }
    }),
    DockerModule,
    ProjectModule,
    UserModule,
    AuthModule,
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.SMTP_HOST,
          port: +parseInt(process.env.SMTP_PORT!),
          secure: false,
          tls: {
            rejectUnauthorized: false,
          },
        },
        defaults: {
          from: process.env.FROM,
        },
        // template: {
        //   dir: __dirname + '/../../templates',
        //   adapter: new PugAdapter(),
        //   options: {
        //     strict: true,
        //   },
        // },
      }),
    }),
    SoftwareModule,
    ScheduleModule.forRoot({}),
    CatelogModule,
    SpecsModule,
    FilesModule,
    StockModule,
    FutureProjectsModule,
    TaskModule,
    InquiryModule,
    TreeModule,
    SystemModule,
    MemberModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {};
