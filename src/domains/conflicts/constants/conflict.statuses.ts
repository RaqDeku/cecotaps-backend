export enum ConflictApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum ConflictSeverity {
  LOW = 'latent',
  MEDIUM = 'medium intensity',
  HIGH = 'extreme',
  MEDIUM_HIGH = 'high intensity',
  MEDIUM_LOW = 'low intensity',
}

export enum ConflictStatus {
  ACTIVE = 'active',
  ONGOING = 'ongoing - mediation',
  RESOLVED = 'resolved',
}
