import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMessageDTO {
  @IsOptional()
  chatId: string;

  @IsNotEmpty()
  senderId: string;

  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  senderName: string;

  @IsOptional()
  receiverId: string | null | undefined;
}
