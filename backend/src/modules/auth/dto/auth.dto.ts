import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
