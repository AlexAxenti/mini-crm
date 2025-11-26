export interface EventResponseDto {
  id: string;
  userId: string;
  type: string;
  entityType: string;
  entityId: string;
  createdAt: Date;
  meta: any | null;
}
