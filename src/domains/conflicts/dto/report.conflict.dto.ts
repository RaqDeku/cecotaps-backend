interface Location {
  lat: string;
  long: string;
}

interface Actors {
  id: number;
}

interface Reporter {
  name: string;
  email?: string;
  phone: string;
}

export class ReportConflictDto {
  region_id: number;
  district_id: number;
  location: Location;
  conflict_type: string;
  actors: Actors[];
  media_uploads?: string[];
  reporter?: Reporter;
}
