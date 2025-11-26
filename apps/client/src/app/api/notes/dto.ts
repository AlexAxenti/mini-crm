export interface CreateNoteDto {
  title: string;
  body: string;
}

export interface UpdateNoteDto {
  title?: string;
  body?: string;
}

export interface NoteResponseDto {
  id: string;
  title: string;
  body: string;
  contactId: string;
  createdAt: Date;
  updatedAt: Date;
}
