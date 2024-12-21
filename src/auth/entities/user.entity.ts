import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "src/products/entities";

@Entity('users')
export class User {


	@PrimaryGeneratedColumn('uuid')
	id: string;


	@Column('text', {
		unique: true
	})
	email: string;


	@Column('text', {
		select: false
	})
	password: string;


	@Column('text', {
		name: 'full_name'
	})
	fullName: string;


	@Column('bool', {
		name: 'is_active',
		default: true
	})
	isActive: boolean;


	@Column('text', {
		array: true,
		default: ['user']
	})
	roles: string[];


	@OneToMany(
		() => Product,
		product => product.user
	)
	product: Product


	@BeforeInsert()
	@BeforeUpdate()
	changeEmailToLower() {
		this.email = this.email.toLowerCase().trim();
	}
}

