import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class GetNotesQueryDto {
  @IsUUID()
  contactId: string;

  @IsOptional()
  @IsEnum(['updatedAt'])
  sortBy?: 'updatedAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc';
}
