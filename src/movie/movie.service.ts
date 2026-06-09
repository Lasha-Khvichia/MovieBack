import { Injectable, NotFoundException } from '@nestjs/common';
import { SortOrder } from '../enums';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';
import { MovieRepository } from './movie.repository';

@Injectable()
export class MovieService {
  constructor(private readonly movieRepository: MovieRepository) {}

  create(dto: CreateMovieDto): Promise<Movie> {
    return this.movieRepository.create(dto);
  }

  findAll(order?: string): Promise<Movie[]> {
    const sort =
      order?.toUpperCase() === SortOrder.ASC ? SortOrder.ASC : SortOrder.DESC;
    return this.movieRepository.findAll(sort);
  }

  async findOne(id: number): Promise<Movie> {
    const movie = await this.movieRepository.findById(id);
    if (!movie) {
      throw new NotFoundException(`Movie ${id} not found`);
    }
    return movie;
  }

  async update(id: number, dto: UpdateMovieDto): Promise<Movie> {
    const movie = await this.findOne(id);
    Object.assign(movie, dto);
    return this.movieRepository.save(movie);
  }

  async remove(id: number): Promise<void> {
    const movie = await this.findOne(id);
    await this.movieRepository.remove(movie);
  }
}
