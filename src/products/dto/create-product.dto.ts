import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, Min, MinLength } from "class-validator";


export class CreateProductDto {

	@ApiProperty({
		description: 'Product title',
		uniqueItems: true,
		nullable: false
	})
	@IsString()
	@MinLength(5)
	title: string;

	@ApiProperty()
	@IsNumber()
	@IsPositive()
	@IsOptional()
	price?: number;

	@ApiProperty()
	@IsString()
	@IsOptional()
	description?: string;

	@ApiProperty()
	@IsString()
	@IsOptional()
	slug?: string;

	@ApiProperty()
	@IsInt()
	@IsPositive()
	@IsOptional()
	stock?: number;

	@ApiProperty()
	@IsString({
		each: true
	})
	@IsArray()
	sizes: string[];

	@ApiProperty()
	@IsIn(['men', 'women', 'kid', 'unisex'])
	gender: string;

	@ApiProperty()
	@IsString({
		each: true
	})
	@IsArray()
	@IsOptional()
	tags: string[];

	@ApiProperty()
	@IsString({
		each: true
	})
	@IsArray()
	@IsOptional()
	images?: string[];

}

