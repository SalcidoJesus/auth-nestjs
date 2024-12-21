import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

// representación del objeto en la BD
@Entity({
	name: 'products'
})
export class Product {

	@ApiProperty({
		example: '46780f41-2c58-43f0-a4cb-63a9cb1c1ed8',
		description: 'Product ID',
		uniqueItems: true
	})
	@PrimaryGeneratedColumn('uuid')
	id: string;


	@ApiProperty({
		example: 'Men’s 3D Small Wordmark Tee',
		description: 'Product title',
		uniqueItems: true
	})
	@Column('text', {
		unique: true,
	})
	title: string;


	@ApiProperty({
		example: 0,
		description: 'Product price'
	})
	@Column('float', {
		default: 0
	})
	price: number;


	@ApiProperty({
		example: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
		description: 'Product description',
		default: null
	})
	@ApiProperty()
	@Column({
		type: 'text',
		nullable: true
	})
	description: string;


	@ApiProperty({
		example: 'men_3d_small_wordmark_tee',
		description: 'Product SLUG - for SEO routes',
		uniqueItems: true
	})
	@ApiProperty()
	@Column('text', {
		unique: true
	})
	slug: string;


	@ApiProperty({
		example: 10,
		description: 'Product stock'
	})
	@Column('int', {
		default: 0
	})
	stock: number;


	@ApiProperty({
		example: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
		description: 'Product sizes'
	})
	@Column('text', {
		array: true,
		default: []
	})
	sizes: string[];


	@ApiProperty({
		example: 'men',
		description: 'Product gender'
	})
	@Column('text')
	gender: string;

	// tags
	@ApiProperty({
		example: ['shirts', 'pants', 'hoodies', 'hats'],
		description: 'Product tags'
	})
	@Column('text', {
		array: true,
		default: []
	})
	tags: string[];



	// images
	// el eaguer es para que automáticamente cargue las imágenes
	@ApiProperty()
	@OneToMany(
		() => ProductImage,
		(productImage) => productImage.product,
		{ cascade: true, eager: true }
	)
	images?: ProductImage[]


	@ManyToOne(
		() => User,
		(user) => user.product,
		{ eager: true }
	)
	user: User


	@BeforeInsert()
	checkSlugInsert(){

		if ( !this.slug ) {
			this.slug = this.title;
		}

		this.slug = this.slug
			.toLocaleLowerCase()
			.replaceAll(' ', '_')
			.replaceAll("'", '');

	}

	@BeforeUpdate()
	checkSlugUpdate() {

		this.slug = this.slug
			.toLocaleLowerCase()
			.replaceAll(' ', '_')
			.replaceAll("'", '');

	}
}

