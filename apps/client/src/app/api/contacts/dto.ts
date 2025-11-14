export interface CreateContactDto {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
}

export interface UpdateContactDto {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
}

export interface ContactResponseDto {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  title: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetContactsQueryDto {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  sortBy?: "name" | "updatedAt";
  order?: "asc" | "desc";
}
