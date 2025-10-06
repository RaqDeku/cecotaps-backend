import {
  ConflictSeverity,
  ConflictStatus,
} from '../constants/conflict.statuses';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { MediaUpload } from './report.conflict.dto';

class BasicInfo {
  @IsString()
  title: string;

  @IsString()
  type: string;

  @IsString()
  @IsEnum(ConflictSeverity, {
    message: `Severity must be one of the following: ${Object.values(
      ConflictSeverity,
    ).join(', ')}`,
  })
  severity: string;

  @IsString()
  @IsEnum(ConflictStatus, {
    message: `Status must be one of the following: ${Object.values(
      ConflictStatus,
    ).join(', ')}`,
  })
  status: string;

  @IsArray()
  @IsNumber({}, { each: true })
  intervention_actions: number[];
}

class Details {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  root_causes: string[];

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  trigger_events: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InfoSource)
  info_sources: InfoSource[];
}

export class Intervention {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  outcome: string;

  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  actors: number[];
}

export class ImpactAssessment {
  @IsNotEmpty()
  @IsNumber()
  casualties: number;

  @IsNotEmpty()
  @IsNumber()
  displacements: number;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  property_damages: string[];
}

class InfoSource {
  @IsString()
  name: string;

  @IsString()
  reference: string;
}

export class EditConflictDto {
  @IsNotEmpty()
  @ValidateNested()
  // @Type(() => BasicInfo)
  basic_info: BasicInfo;

  @IsNotEmpty()
  @ValidateNested()
  // @Type(() => Details)
  details: Details;

  @IsOptional()
  media?: MediaUpload[];

  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  actors: number[];

  @IsOptional()
  @ValidateNested()
  // @Type(() => Intervention)
  intervention?: Intervention;

  @IsOptional()
  @ValidateNested()
  // @Type(() => ImpactAssessment)
  impact_assessment?: ImpactAssessment;
}
