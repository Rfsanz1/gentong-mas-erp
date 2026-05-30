import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class POItemDto {
  @ApiPropertyOptional({ type: String, example: 'uuid-product-id' })
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiProperty({ type: String, example: 'Semen Tiga Roda 50kg' })
  @IsString()
  @IsNotEmpty()
  nama!: string;

  @ApiProperty({ type: Number, example: 10 })
  @IsNumber()
  @Min(1)
  qty!: number;

  @ApiProperty({ type: Number, example: 50000 })
  @IsNumber()
  @Min(0)
  hargaBeli!: number;

  @ApiPropertyOptional({ type: Number, example: 500000 })
  @IsNumber()
  @IsOptional()
  subtotal?: number;
}

export class CreatePurchaseOrderDto {
  @ApiProperty({ type: String, example: 'uuid-supplier-id' })
  @IsUUID()
  supplierId!: string;

  @ApiPropertyOptional({ type: String, example: 'uuid-warehouse-id' })
  @IsUUID()
  @IsOptional()
  warehouseId?: string;

  @ApiProperty({ type: String, example: '2026-01-15' })
  @IsDateString()
  tanggal!: string;

  @ApiPropertyOptional({ type: String, example: '2026-01-22' })
  @IsDateString()
  @IsOptional()
  tanggalKirim?: string;

  @ApiPropertyOptional({ type: String, example: 'Kirim ke gudang utama' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional({ type: Number, example: 0 })
  @IsNumber()
  @IsOptional()
  discountPercentage?: number;

  @ApiProperty({ type: () => [POItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => POItemDto)
  items!: POItemDto[];
}

export class GoodsReceiptItemDto {
  @ApiPropertyOptional({ type: String, example: 'uuid-product-id' })
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiProperty({ type: String, example: 'Semen Tiga Roda 50kg' })
  @IsString()
  @IsNotEmpty()
  nama!: string;

  @ApiProperty({ type: Number, example: 10 })
  @IsNumber()
  @Min(1)
  qtyOrdered!: number;

  @ApiProperty({ type: Number, example: 8 })
  @IsNumber()
  @Min(0)
  qtyReceived!: number;

  @ApiPropertyOptional({ type: Number, example: 50000 })
  @IsNumber()
  @IsOptional()
  hargaBeli?: number;
}

export class CreateGoodsReceiptDto {
  @ApiProperty({ type: String, example: 'uuid-purchase-order-id' })
  @IsUUID()
  purchaseOrderId!: string;

  @ApiProperty({ type: String, example: '2026-01-20' })
  @IsDateString()
  tanggal!: string;

  @ApiPropertyOptional({ type: String, example: 'Barang diterima kondisi baik' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ type: () => [GoodsReceiptItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoodsReceiptItemDto)
  items!: GoodsReceiptItemDto[];
}

export class ConfirmGoodsReceiptDto {
  @ApiPropertyOptional({ type: String, example: 'uuid-warehouse-id' })
  @IsUUID()
  @IsOptional()
  warehouseId?: string;
}

export class CreateSupplierDto {
  @ApiProperty({ type: String, example: 'PT Sumber Makmur' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ type: String, example: '021-5551234' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ type: String, example: 'supplier@sumbermakmur.com' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ type: String, example: 'Jl. Industri No. 1, Jakarta' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ type: String, example: 'Budi Santoso' })
  @IsString()
  @IsOptional()
  contactPerson?: string;
}

export class UpdateSupplierDto {
  @ApiPropertyOptional({ type: String, example: 'PT Sumber Makmur' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ type: String, example: '021-5551234' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ type: String, example: 'supplier@sumbermakmur.com' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ type: String, example: 'Jl. Industri No. 1, Jakarta' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ type: String, example: 'Budi Santoso' })
  @IsString()
  @IsOptional()
  contactPerson?: string;
}

export class ChangeStatusDto {
  @ApiProperty({ type: String, example: 'APPROVED', description: 'Status baru Purchase Order' })
  @IsString()
  @IsNotEmpty()
  status!: string;
}

export class UpdatePurchaseOrderDto {
  @ApiPropertyOptional({ type: String, example: 'uuid-supplier-id' })
  @IsUUID()
  @IsOptional()
  supplierId?: string;

  @ApiPropertyOptional({ type: String, example: 'uuid-warehouse-id' })
  @IsUUID()
  @IsOptional()
  warehouseId?: string;

  @ApiPropertyOptional({ type: String, example: '2026-01-15' })
  @IsDateString()
  @IsOptional()
  tanggal?: string;

  @ApiPropertyOptional({ type: String, example: '2026-01-22' })
  @IsDateString()
  @IsOptional()
  tanggalKirim?: string;

  @ApiPropertyOptional({ type: String, example: 'Kirim ke gudang utama' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional({ type: Number, example: 5 })
  @IsNumber()
  @IsOptional()
  discountPercentage?: number;

  @ApiPropertyOptional({ type: () => [POItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => POItemDto)
  @IsOptional()
  items?: POItemDto[];
}
