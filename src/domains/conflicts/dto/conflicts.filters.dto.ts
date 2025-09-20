import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsArray,
  IsNumber,
  IsString,
  IsEnum,
} from 'class-validator';
import { ConflictStatus } from '../constants/conflict.statuses';

export class ConflictFilters {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from_date?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to_date?: Date;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  region_id?: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map((v) => Number(v)) : [Number(value)],
  )
  districts?: number[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map((v) => v.trim());

    return undefined;
  })
  conflict_types?: string[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map((v) => Number(v)) : [Number(value)],
  )
  actors_involved?: number[];

  @IsOptional()
  @IsEnum(ConflictStatus, {
    message: `Status must be one of the following: ${Object.values(
      ConflictStatus,
    ).join(', ')}`,
  })
  status?: ConflictStatus;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map((v) => Number(v)) : [Number(value)],
  )
  intervention_actions?: number[];
}
