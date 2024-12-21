import { BadRequestException, Controller, Get, Param, ParseFilePipe, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { FilesService } from './files.service';
import { fileNamer, exceptionFactory, validators } from './helpers';
import { Response } from 'express';


@Controller('files')
export class FilesController {
	constructor(
		private readonly filesService: FilesService,
		private readonly configService: ConfigService
	) { }

	@Get('products/:imageName')
	findProductImage(
		@Res() res: Response,
		@Param('imageName') imageName: string
	) {
		// return this.filesService.getStaticProductImage(imageName);
		res.sendFile( this.filesService.getStaticProductImage(imageName) );
	}


	@Post('products')
	@UseInterceptors(FileInterceptor('file', {
		storage: diskStorage({
			destination: './static/products',
			filename: fileNamer,
		})
	}))
	uploadFile(
		@UploadedFile(
			new ParseFilePipe({
				validators, exceptionFactory
			})
		) file: Express.Multer.File
	) {

		if (!file) {
			throw new BadRequestException('Debes subir una imagen');
		}

		const secureUrl = `${ this.configService.get('HOST_API') }/files/products/${ file.filename }`;

		return { secureUrl };
	}

}
