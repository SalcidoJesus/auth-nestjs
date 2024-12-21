import { Controller, Get, Post, Body, UseGuards, Req, Headers, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { Auth, GetUser, RawHeaders } from './decorators';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/roleprotected/role-protected.decorator';
import { ValidRoles } from './interfaces';


@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) { }

	@Post('register')
	create(@Body() createUserDto: CreateUserDto) {
		return this.authService.create(createUserDto);
	}


	@Post('login')
	login(@Body() loginUserDto: LoginUserDto) {
		return this.authService.login(loginUserDto);
	}

	@Get('check-auth-status')
	@Auth()
	checkAuthStatus(
		@GetUser() user: User
	) {
		return this.authService.checkAuthStatus(user);
	}


	@Get('private')
	// el AuthGuard usa la autenticación por defecto que definimos en el jwt.strategy.ts
	@UseGuards( AuthGuard() )
	testingPrivateRoute(
		// @Req() request: Express.Request,
		@GetUser('fullName') user: User,
		// user: User,
		// @RawHeaders() rawHeaders: string[]
		@Headers() headers: IncomingHttpHeaders
	) {

		return {
			user,
			headers
		};
	}


	// @SetMetadata('roles', ['admin', 'super-user'])

	@Get('private2')
	@RoleProtected( ValidRoles.admin, ValidRoles.superUser )
	@UseGuards( AuthGuard(), UserRoleGuard )
	privateRoute2(
		@GetUser() user: User
	) {

		return {
			ok: true,
			user
		}

	}

	@Get('private3')
	@Auth( ValidRoles.superUser )
	privateRoute3(
		@GetUser() user: User
	) {

		return {
			hola: 'mundo',
			ok: true,
			user
		}

	}

}
