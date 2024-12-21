import { join } from 'path';

import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync } from 'fs';

@Injectable()
export class FilesService {

	getStaticProductImage( imagename: string ) {

		// __dirname = donde estoy ahorita
		const path = join( __dirname, '../../static/products', imagename );

		if ( !existsSync( path ) ) {
			throw new NotFoundException(`No existe la imagen ${ imagename }`);
		}

		return path

	}

}
