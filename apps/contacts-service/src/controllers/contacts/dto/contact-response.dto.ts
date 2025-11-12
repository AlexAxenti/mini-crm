export class ContactResponseDto {
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
