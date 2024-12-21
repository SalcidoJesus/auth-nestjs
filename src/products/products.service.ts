import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { validate as isUUID } from "uuid";
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { ProductImage, Product } from './entities';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProductsService {

	private readonly logger = new Logger('ProductsService');

	constructor(
		// le insertamos la entidad
		@InjectRepository(Product)
		private readonly productRepository: Repository<Product>,

		@InjectRepository(ProductImage)
		private readonly productImageRepository: Repository<ProductImage>,

		// esta cosa ya sabe la conexión
		private readonly dataSource: DataSource
	){}


	async create(createProductDto: CreateProductDto, user: User) {

		try {

			const { images = [], ...productDetails } = createProductDto;

			// crea la instancia del producto, pero aún no lo guarda
			const product = this.productRepository.create({
				...productDetails,
				user,
				images: images.map( image_url => this.productImageRepository.create({ url: image_url }) )
			})

			// guarda
			await this.productRepository.save( product );

			return {
				...product, images
			};

		} catch (error) {

			this.handleDBExceptions(error);

		}

	}

	async findAll( paginationDto: PaginationDto ) {

		try {

			const { limit = 10, page = 1 } = paginationDto;

			const products = await this.productRepository.find({
				take: limit,
				skip: ( page - 1 ) * limit,
				relations: {
					images: true
				}
			});

			return products.map( product => ({
				...product,
				images: product.images.map( img => img.url )
			}))

		} catch (error) {
			throw new InternalServerErrorException('Error al obtener la lista de productos');
		}

	}

	async findOne(term: string) {

		let product: Product;

		if ( isUUID(term) ) {
			product = await this.productRepository.findOneBy({ id: term });
		}

		if (!product) {
			const queryBuilder = this.productRepository.createQueryBuilder('prod')
			product = await queryBuilder
				.where('LOWER(title) =:title or LOWER(slug) =:slug', { title: term.toLowerCase(), slug: term.toLocaleLowerCase() })
				.leftJoinAndSelect('prod.images', 'prodImages')
				.getOne();
		}

		if (!product) throw new NotFoundException(`Product "${term}" not found`);

		return product;
	}

	async update(id: string, updateProductDto: UpdateProductDto, user: User) {

		const { images, ...toUpdate } = updateProductDto

		const product = await this.productRepository.preload({
			id,
			...toUpdate
		});

		if ( !product ) throw new NotFoundException(`Product with id "${id}" not found`);


		// hay imágenes, ejecutar el query runner
		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {

			// haay imágenes? borramos las anteriores
			if (images) {
				await queryRunner.manager.delete(ProductImage, {
					product: { id }
				});

				product.images = images.map( image_url => this.productImageRepository.create({ url: image_url }) );

			}

			product.user = user;
			await queryRunner.manager.save(product);
			// await this.productRepository.save(product);


			await queryRunner.commitTransaction();

			// desconecto
			await queryRunner.release();

			// return product;
			return this.findOnePlain( id );

		} catch (error) {
			await queryRunner.rollbackTransaction();
			await queryRunner.release();

			this.handleDBExceptions(error);
		}

	}

	async remove(id: string) {

		const producto = await this.findOne(id);

		try {
			return await this.productRepository.remove(producto);
		} catch (error) {
			throw new InternalServerErrorException('Error al eliminar el producto');
		}

	}

	private handleDBExceptions( error: any ){
		if ( error.code === '23505' ) {
			throw new BadRequestException(error.detail);
		}
		this.logger.error(error)
		throw new InternalServerErrorException('Error al guardar en la BD');
	}

	async findOnePlain ( term: string ) {
		const { images = [], ...rest } = await this.findOne(term);
		return {
			...rest,
			images: images.map( img => img.url )
		}
	}

	async deleteAllProducts() {
		const query = this.productRepository.createQueryBuilder('product');

		try {
			return await query
				.delete()
				.where({})
				.execute();
		} catch (error) {
			this.handleDBExceptions(error);
		}
	}

}
