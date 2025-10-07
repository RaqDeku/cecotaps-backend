import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { ConflictSeverity } from '../constants/conflict.statuses';

class Location {
  @IsNotEmpty()
  @IsNumberString()
  lat: string;

  @IsNotEmpty()
  @IsNumberString()
  lng: string;
}

class Actors {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

class Reporter {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsNotEmpty()
  @IsString()
  phone: string;
}

export class MediaUpload {
  @IsOptional()
  @IsNumber()
  conflict_id?: number;

  @IsString()
  @IsNotEmpty()
  url: string;
}

export class ReportConflictDto {
  @IsNumber()
  @IsNotEmpty()
  region_id: number;

  @IsNumber()
  @IsNotEmpty()
  district_id: number;

  @IsNotEmpty()
  location: Location;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsEnum(ConflictSeverity, {
    message: `Severity must be one of the following: ${Object.values(
      ConflictSeverity,
    ).join(', ')}`,
  })
  severity: string;

  @IsNotEmpty()
  @IsString()
  conflict_type: string;

  @IsNotEmpty()
  conflict_date?: Date;

  @IsNotEmpty()
  actors: Actors[];

  @IsOptional()
  media_uploads?: MediaUpload[];

  @IsOptional()
  reporter?: Reporter;
}
