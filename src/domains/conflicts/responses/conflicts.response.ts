import { ImpactAssessment, Intervention } from '../dto/edit.conflict.dto';
import { Actors } from '../entities/actors.entity';
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
    intervention_actions: number[];
    status: string;
    date_reported: Date;
    reported_by?: any;
  };
  details: {
    description: string;
    root_causes: string[];
    trigger_events: string[];
    info_sources: any[];
  };
  actors: number[];
  media: any[];
  intervention: Intervention | null;
  impact_assessment: any;
}

export interface ConflictReports {
  id: number;
  type: string;
  reported_by?: any;
  actors?: string[];
  severity?: string;
  description: string;
}

export class ConflictResponses {
  static collection(data: any[]): Conflict[] {
    return data.map((conflict: any) => ({
      id: conflict.id,
      title: conflict.title,
      district: conflict?.location?.district?.name,
      type: conflict.conflict_type,
      status: conflict.status,
      severity: conflict.severity,
      date: conflict.date_reported,
      reference_id: conflict?.reference_id,
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
        intervention_actions: conflict?.interventions_actions?.map(
          (action) => action.id,
        ),
        date_reported: conflict?.date_reported,
        reported_by: conflict?.reporter,
      },
      details: {
        description: conflict?.description,
        root_causes: conflict?.root_causes
          ?.filter((cause: RootCauses) => cause.cause_type === 'RootCause')
          .map((cause: RootCauses) => cause.description),
        trigger_events: conflict?.root_causes
          ?.filter((cause: RootCauses) => cause.cause_type === 'TriggerEvent')
          .map((cause: RootCauses) => cause.description),
        info_sources: conflict?.information_sources?.map((source) => ({
          id: source.id,
          name: source.source_name,
          reference: source.reference_link,
        })),
      },
      actors: conflict?.actors?.map((actor) => actor.id),
      media: conflict?.media_uploads,
      intervention: null,
      impact_assessment: {
        ...conflict?.impact_assessments,
        property_damages: conflict?.impact_assessments?.property_damages?.map(
          (damage) => damage.description,
        ),
      },
    };
  }

  static conflictReports(conflicts: Conflicts[]): ConflictReports[] {
    return conflicts.map((conflict: Conflicts) => ({
      id: conflict.id,
      type: conflict.conflict_type,
      reported_by: conflict?.reporter,
      actors: conflict?.actors?.map((actor: Actors) => actor.name),
      severity: conflict?.severity,
      description: conflict.description,
    }));
  }

  static conflictDetails(conflict: Conflicts): any {
    return {
      id: conflict?.id,
      title: conflict?.title,
      type: conflict?.conflict_type,
      severity: conflict?.severity,
      district: conflict?.location?.district?.name,
      region: conflict?.location?.region?.name,
      overview: {
        date_reported: conflict?.date_reported,
        reported_by: conflict?.reporter,
        last_updated: conflict?.last_updated,
        gps_coordinates: conflict?.location?.geom?.coordinates,
        impact_assessment: {
          ...conflict?.impact_assessments,
          property_damages: conflict?.impact_assessments?.property_damages?.map(
            (damage) => damage.description,
          ),
        },
        actors: conflict?.actors?.map((actor) => actor.name),
        description: conflict?.description,
        root_causes: conflict?.root_causes
          ?.filter((cause: RootCauses) => cause.cause_type === 'RootCause')
          .map((cause: RootCauses) => cause.description),
        trigger_events: conflict?.root_causes
          ?.filter((cause: RootCauses) => cause.cause_type === 'TriggerEvent')
          .map((cause: RootCauses) => cause.description),
        info_sources: conflict?.information_sources?.map((source) => ({
          id: source.id,
          name: source.source_name,
          reference: source.reference_link,
        })),
      },
      intervention_timeline: conflict?.interventions?.map((intervention) => ({
        ...intervention,
        actors: intervention?.actors?.map((actor) => actor.name),
      })),
      media: conflict?.media_uploads,
    };
  }
}
