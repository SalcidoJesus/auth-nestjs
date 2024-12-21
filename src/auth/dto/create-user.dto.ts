import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {

	@IsString()
	@IsEmail()
	email: string;


	@IsString()
	@MinLength(8)
	@MaxLength(50)
	@Matches(
		/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: 'La contraseña debe tener al menos una letra mayúscula, una letra minúscula y un número'
	})
	password: string;


	@IsString()
	@MinLength(5)
	fullName: string;

}
