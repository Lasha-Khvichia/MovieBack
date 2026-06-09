import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SortOrder } from '../enums';
import { Movie } from './entities/movie.entity';

/**
 * Pure data access for movies. No business rules, no thrown exceptions —
 * returns null/empty when nothing is found and lets the service decide.
 */
@Injectable()
export class MovieRepository {
  constructor(
    @InjectRepository(Movie)
    private readonly repo: Repository<Movie>,
  ) {}

  create(data: Partial<Movie>): Promise<Movie> {
    return this.repo.save(this.repo.create(data));
  }

  findAll(order: SortOrder): Promise<Movie[]> {
    return this.repo.find({ order: { createdAt: order } });
  }

  findById(id: number): Promise<Movie | null> {
    return this.repo.findOne({ where: { id } });
  }

  save(movie: Movie): Promise<Movie> {
    return this.repo.save(movie);
  }

  async remove(movie: Movie): Promise<void> {
    await this.repo.remove(movie);
  }
}
