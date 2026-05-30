import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ type: String, example: 'user@erp.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ type: String, example: 'Budi Santoso' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ type: String, example: 'password123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ type: String, example: 'uuid-role-id' })
  @IsUUID()
  roleId!: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ type: String, example: 'Budi Santoso' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ type: String, example: 'user@erp.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ type: String, example: 'newpassword123', minLength: 8 })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ type: String, example: 'uuid-role-id' })
  @IsUUID()
  @IsOptional()
  roleId?: string;

  @ApiPropertyOptional({ type: Boolean, example: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class ChangePasswordDto {
  @ApiProperty({ type: String, example: 'oldpassword123' })
  @IsString()
  @IsNotEmpty()
  oldPassword!: string;

  @ApiProperty({ type: String, example: 'newpassword123', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
