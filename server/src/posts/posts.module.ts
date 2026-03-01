import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostEntity } from './entities/post.entity';
import { TagEntity } from '../tags/entities/tag.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, TagEntity])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
