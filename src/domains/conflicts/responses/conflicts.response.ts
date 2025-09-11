import { Conflicts } from '../entities/conflict.entity';
import { RootCauses } from '../entities/conflict.root.cause.entity';

export interface Conflict {
  id: string;
  reference_id?: string;
  title: string;
  district: string;
  type: string;
  status: string;
  severity: string;
  date: string;
}

export interface EditConflictPayload {
  id: number;
  basic_info: {
    title: string;
    type: string;
    location: string;
    severity: string;
    status: string;
    date_reported: Date;
    reported_by?: any;
  };
  details: {
    description: string;
    root_causes: any[];
    trigger_events: any[];
    info_sources: any[];
  };
  actors: any[];
  media: any[];
}

export interface ConflictReports {
  id: number;
  type: string;
  reported_by?: string;
  tags?: string[];
  status?: string;
  security?: string;
  description: string;
}

export class ConflictResponses {
  static collection(data: any[]): Conflict[] {
    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      district: item?.location?.district?.name,
      type: item.conflict_type,
      status: item.status,
      severity: item.severity,
      date: item.date_reported,
      reference_id: item?.reference_id,
    }));
  }

  static editConflictPayload(conflict: Conflicts): EditConflictPayload {
    return {
      id: conflict?.id,
      basic_info: {
        title: conflict?.title,
        type: conflict?.conflict_type,
        location: conflict?.location?.district?.name,
        severity: conflict?.severity,
        status: conflict?.status,
        date_reported: conflict?.date_reported,
        reported_by: conflict?.reporter,
      },
      details: {
        description: conflict?.description,
        root_causes: conflict?.root_causes
          ?.filter((cause: RootCauses) => cause.cause_type === 'RootCause')
          .map((cause: RootCauses) => ({
            id: cause.id,
            name: cause.description,
          })),
        trigger_events: conflict?.root_causes
          ?.filter((cause: RootCauses) => cause.cause_type === 'TriggerEvent')
          .map((cause: RootCauses) => ({
            id: cause.id,
            name: cause.description,
          })),
        info_sources: conflict?.information_sources?.map((source) => ({
          id: source.id,
          source_name: source.source_name,
        })),
      },
      actors: conflict?.actors?.map((actor) => actor.id),
      media: conflict?.media_uploads,
    };
  }

  static conflictReports(data: any[]): ConflictReports[] {
    return data.map((item: any) => ({
      id: item.id,
      type: item.conflict_type,
      reported_by: item?.reporter,
      tags: item?.tags?.map((tag: any) => tag.name),
      status: item.status,
      security: item.severity,
      description: item.description,
    }));
  }
}
