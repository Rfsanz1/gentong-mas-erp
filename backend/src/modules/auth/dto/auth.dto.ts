import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ type: String, example: 'admin@erp.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ type: String, example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class RefreshTokenDto {
  @ApiProperty({ type: String, example: 'eyJhbGciOiJIUzI1NiJ9...' })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class RegisterDto {
  @ApiProperty({ type: String, example: 'admin@erp.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ type: String, example: 'Admin User' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ type: String, example: 'password123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ type: String, example: 'role-uuid' })
  @IsString()
  @IsNotEmpty()
  roleId!: string;
}

export class SendOtpDto {
  @ApiProperty({ type: String, example: 'user-uuid' })
  @IsString()
  @IsNotEmpty()
  userId!: string;
}

export class VerifyOtpDto {
  @ApiProperty({ type: String, example: 'user-uuid' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ type: String, example: '123456' })
  @IsString()
  @Length(6, 6)
  code!: string;
}

export class SelectTenantDto {
  @ApiProperty({ type: String, example: 'user-uuid' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ type: String, example: 'company-uuid' })
  @IsString()
  @IsNotEmpty()
  companyId!: string;
}

export class GoogleCallbackQueryDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  state?: string;
}
