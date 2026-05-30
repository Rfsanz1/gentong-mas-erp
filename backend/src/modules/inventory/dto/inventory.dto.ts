import { IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ type: String, example: 'PRD-001' })
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @ApiProperty({ type: String, example: 'Semen Tiga Roda 50kg' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ type: String, example: 'Tiga Roda' })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ type: String, example: 'uuid-category-id' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ type: String, example: 'uuid-unit-id' })
  @IsUUID()
  @IsOptional()
  unitId?: string;

  @ApiPropertyOptional({ type: Number, example: 50000 })
  @IsNumber()
  @IsOptional()
  hargaBeli?: number;

  @ApiPropertyOptional({ type: Number, example: 65000 })
  @IsNumber()
  @IsOptional()
  hargaJual?: number;

  @ApiPropertyOptional({ type: Number, example: 10 })
  @IsInt()
  @IsOptional()
  stokMinimum?: number;

  @ApiPropertyOptional({ enum: ['FIFO', 'AVERAGE', 'STANDARD'], default: 'AVERAGE' })
  @IsEnum(['FIFO', 'AVERAGE', 'STANDARD'])
  @IsOptional()
  costingMethod?: 'FIFO' | 'AVERAGE' | 'STANDARD';
}

export class UpdateStockDto {
  @ApiProperty({ type: Number, example: 10 })
  @IsNumber()
  @Min(0.0001)
  qty!: number;

  @ApiProperty({ enum: ['in', 'out', 'adjustment', 'transfer'] })
  @IsEnum(['in', 'out', 'adjustment', 'transfer'])
  type!: 'in' | 'out' | 'adjustment' | 'transfer';

  @ApiPropertyOptional({ type: String, example: 'Stok masuk dari supplier' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional({ type: String, example: 'uuid-warehouse-id' })
  @IsUUID()
  @IsOptional()
  warehouseId?: string;

  @ApiPropertyOptional({ type: String, example: 'uuid-reference-id' })
  @IsString()
  @IsOptional()
  referenceId?: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ type: String, example: 'PRD-001' })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({ type: String, example: 'Semen Tiga Roda 50kg' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ type: String, example: 'Tiga Roda' })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ type: String, example: 'uuid-category-id' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ type: String, example: 'uuid-unit-id' })
  @IsUUID()
  @IsOptional()
  unitId?: string;

  @ApiPropertyOptional({ type: Number, example: 50000 })
  @IsNumber()
  @IsOptional()
  hargaBeli?: number;

  @ApiPropertyOptional({ type: Number, example: 65000 })
  @IsNumber()
  @IsOptional()
  hargaJual?: number;

  @ApiPropertyOptional({ type: Number, example: 10 })
  @IsInt()
  @IsOptional()
  stokMinimum?: number;

  @ApiPropertyOptional({ enum: ['FIFO', 'AVERAGE', 'STANDARD'] })
  @IsEnum(['FIFO', 'AVERAGE', 'STANDARD'])
  @IsOptional()
  costingMethod?: 'FIFO' | 'AVERAGE' | 'STANDARD';
}

export class CostingFIFODto {
  @ApiProperty({ type: String, example: 'uuid-product-id' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ type: Number, example: 10 })
  @IsNumber()
  @Min(0.0001)
  qty!: number;
}

export class CostingFIFOCommitDto {
  @ApiProperty({ type: String, example: 'uuid-product-id' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ type: Number, example: 10 })
  @IsNumber()
  @Min(0.0001)
  qty!: number;

  @ApiPropertyOptional({ type: String, example: 'uuid-reference-id' })
  @IsString()
  @IsOptional()
  referenceId?: string;
}

export class CostingAverageDto {
  @ApiProperty({ type: String, example: 'uuid-product-id' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ type: Number, example: 50, description: 'Qty masuk' })
  @IsNumber()
  @Min(0.0001)
  qtyMasuk!: number;

  @ApiProperty({ type: Number, example: 48000, description: 'Harga beli per unit' })
  @IsNumber()
  @Min(0)
  unitCost!: number;
}

export class RevaluateStockDto {
  @ApiProperty({ type: String, example: 'uuid-product-id' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ type: Number, example: 52000, description: 'Harga pokok baru' })
  @IsNumber()
  @Min(0)
  newCost!: number;

  @ApiPropertyOptional({ type: String, example: 'Koreksi harga akhir tahun' })
  @IsString()
  @IsOptional()
  note?: string;
}

export class CreateLotDto {
  @ApiProperty({ type: String, example: 'uuid-product-id' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ type: String, example: 'LOT-2026-001' })
  @IsString()
  @IsNotEmpty()
  nomorLot!: string;

  @ApiProperty({ type: Number, example: 100 })
  @IsNumber()
  @Min(0.0001)
  qtyAwal!: number;

  @ApiProperty({ type: Number, example: 50000 })
  @IsNumber()
  @Min(0)
  unitCost!: number;

  @ApiPropertyOptional({ type: String, example: '2027-01-01' })
  @IsString()
  @IsOptional()
  expiryDate?: string;

  @ApiPropertyOptional({ type: String, example: 'uuid-reference-id' })
  @IsString()
  @IsOptional()
  referenceId?: string;
}

export class LandedCostItemDto {
  @ApiProperty({ type: String, example: 'Biaya pengiriman' })
  @IsString()
  @IsNotEmpty()
  deskripsi!: string;

  @ApiProperty({ type: Number, example: 500000 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ type: String, enum: ['WEIGHT', 'QTY', 'VALUE'], example: 'WEIGHT' })
  @IsString()
  splitMethod!: string;
}

export class CreateLandedCostDto {
  @ApiProperty({ type: String, example: 'uuid-purchase-id' })
  @IsUUID()
  purchaseId!: string;

  @ApiProperty({ type: String, example: 'Biaya pengiriman' })
  @IsString()
  @IsNotEmpty()
  deskripsi!: string;

  @ApiProperty({ type: Number, example: 500000 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ type: String, enum: ['WEIGHT', 'QTY', 'VALUE'], example: 'WEIGHT', description: 'Metode alokasi biaya' })
  @IsString()
  splitMethod!: string;
}

export class ApplyLandedCostsDto {
  @ApiProperty({ type: String, example: 'uuid-purchase-id' })
  @IsUUID()
  purchaseId!: string;

  @ApiProperty({ type: () => [LandedCostItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LandedCostItemDto)
  costs!: LandedCostItemDto[];
}

export class StockTransferDto {
  @ApiProperty({ type: String, example: 'uuid-product-id' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ type: String, example: 'uuid-warehouse-from' })
  @IsUUID()
  fromWarehouseId!: string;

  @ApiProperty({ type: String, example: 'uuid-warehouse-to' })
  @IsUUID()
  toWarehouseId!: string;

  @ApiProperty({ type: Number, example: 5 })
  @IsNumber()
  @Min(0.0001)
  qty!: number;

  @ApiPropertyOptional({ type: String, example: 'Transfer stok antar gudang' })
  @IsString()
  @IsOptional()
  note?: string;
}
