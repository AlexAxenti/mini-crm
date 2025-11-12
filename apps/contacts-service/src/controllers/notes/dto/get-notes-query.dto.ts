import { IsEnum, IsOptional } from 'class-validator';

export class GetNotesQueryDto {
  @IsOptional()
  @IsEnum(['updatedAt'])
  sortBy?: 'updatedAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc';
}
