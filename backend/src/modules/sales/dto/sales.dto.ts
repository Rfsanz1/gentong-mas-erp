import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiPropertyOptional({ type: String, example: 'uuid-product-id' })
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiProperty({ type: String, example: 'Semen Tiga Roda 50kg' })
  @IsString()
  @IsNotEmpty()
  nama!: string;

  @ApiProperty({ type: Number, example: 2 })
  @IsNumber()
  @Min(1)
  qty!: number;

  @ApiProperty({ type: Number, example: 65000 })
  @IsNumber()
  @Min(0)
  harga!: number;

  @ApiPropertyOptional({ type: Number, example: 130000 })
  @IsNumber()
  @IsOptional()
  subtotal?: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: String, example: 'PT Maju Jaya' })
  @IsString()
  @IsNotEmpty()
  namaCustomer!: string;

  @ApiPropertyOptional({ type: String, example: '081234567890' })
  @IsString()
  @IsOptional()
  noHp?: string;

  @ApiPropertyOptional({ type: String, example: 'Jl. Sudirman No. 1, Jakarta' })
  @IsString()
  @IsOptional()
  alamat?: string;

  @ApiPropertyOptional({ type: String, example: 'Tolong kirim pagi' })
  @IsString()
  @IsOptional()
  catatan?: string;

  @ApiPropertyOptional({ type: String, example: 'Budi Sales' })
  @IsString()
  @IsOptional()
  salesName?: string;

  @ApiPropertyOptional({ type: String, example: 'uuid-customer-id' })
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({ type: String, example: 'uuid-warehouse-id' })
  @IsUUID()
  @IsOptional()
  warehouseId?: string;

  @ApiProperty({ type: () => [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @ApiPropertyOptional({ type: Number, example: 130000 })
  @IsNumber()
  @IsOptional()
  totalHarga?: number;
}

export class UpdateOrderDto {
  @ApiPropertyOptional({ type: String, example: 'PT Maju Jaya' })
  @IsString()
  @IsOptional()
  namaCustomer?: string;

  @ApiPropertyOptional({ type: String, example: '081234567890' })
  @IsString()
  @IsOptional()
  noHp?: string;

  @ApiPropertyOptional({ type: String, example: 'Jl. Sudirman No. 1, Jakarta' })
  @IsString()
  @IsOptional()
  alamat?: string;

  @ApiPropertyOptional({ type: String, example: 'Tolong kirim pagi' })
  @IsString()
  @IsOptional()
  catatan?: string;

  @ApiPropertyOptional({ type: () => [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsOptional()
  items?: OrderItemDto[];

  @ApiPropertyOptional({ type: Number, example: 130000 })
  @IsNumber()
  @IsOptional()
  totalHarga?: number;
}

export class ConfirmOrderDto {
  @ApiPropertyOptional({ type: String, example: 'uuid-warehouse-id' })
  @IsUUID()
  @IsOptional()
  warehouseId?: string;

  @ApiPropertyOptional({ type: String, example: 'Dikonfirmasi oleh admin' })
  @IsString()
  @IsOptional()
  note?: string;
}

export class UpdatePengirimanDto {
  @ApiProperty({ type: String, enum: ['pending', 'proses', 'dikirim', 'selesai'], example: 'dikirim' })
  @IsString()
  @IsNotEmpty()
  statusPengiriman!: string;

  @ApiPropertyOptional({ type: String, example: 'Pak Budi' })
  @IsString()
  @IsOptional()
  driverName?: string;
}
