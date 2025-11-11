import { Module } from '@nestjs/common';
import { ContactsModule } from './controllers/contacts/contacts.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [ContactsModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
