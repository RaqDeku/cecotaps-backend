import { IsString, IsEnum } from 'class-validator';
import { ConflictSeverity } from '../constants/conflict.statuses';

class BasicInfo {
  title: string;
  type: string;
  @IsString()
  @IsEnum(ConflictSeverity, {
    message: `Severity must be one of the following: ${Object.values(
      ConflictSeverity,
    ).join(', ')}`,
  })
  severity: string;
  status: string;
}

class Details {
  description: string;
  root_causes: string[];
  trigger_events: string[];
  info_sources: { name: string; reference: string }[];
}

class Media {
  id: number;
  url: string;
}

class Actors {
  id: number;
}

export class EditConflictDto {
  basic_info: BasicInfo;
  details: Details;
  media: Media[];
  actors: Actors[];
}
