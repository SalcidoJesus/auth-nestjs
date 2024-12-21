import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class SeedService {


	constructor(
		private readonly productsService: ProductsService,

		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) {}


	async executeSeed() {

		await this.deleteTables();
		const adminUser = await this.insertUsers();

		const count = await this.insertNewProducts( adminUser );



		return {
			message: 'Seed executed successfully',
			count
		}

	}

	private async deleteTables() {
		// borro productos
		await this.productsService.deleteAllProducts();

		// borro usuarios
		const queryBuilder = this.userRepository.createQueryBuilder();
		await queryBuilder.delete().where({}).execute();
	}

	private async insertUsers() {

		const seedusers = initialData.users;
		const users: User[] = [];

		seedusers.forEach( user => {
			users.push(this.userRepository.create(user));
		});

		const dbUsers = await this.userRepository.save( seedusers );

		return dbUsers[0]

	}

	private async insertNewProducts( user: User ) {

		await this.productsService.deleteAllProducts();

		const products = initialData.products;

		const insertPromises = [];

		products.forEach( product => {
			insertPromises.push(
				this.productsService.create(product, user)
			);
		});

		const res = await Promise.all( insertPromises );

		return products.length
	}

}
