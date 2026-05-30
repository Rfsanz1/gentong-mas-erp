import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiSuccessDto {
  @ApiProperty({ example: true, type: Boolean })
  success!: boolean;

  @ApiProperty({ type: Object, description: 'Payload hasil operasi' })
  data!: object;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z', type: String })
  timestamp!: string;
}

export class ApiErrorDto {
  @ApiProperty({ example: false, type: Boolean })
  success!: boolean;

  @ApiProperty({ example: 400, type: Number })
  statusCode!: number;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z', type: String })
  timestamp!: string;

  @ApiProperty({ example: '/api/resource', type: String })
  path!: string;

  @ApiProperty({ example: 'Validasi gagal', type: String })
  message!: string;

  @ApiPropertyOptional({ example: 'Bad Request', type: String })
  error?: string;
}
