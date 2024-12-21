
import { BadRequestException } from "@nestjs/common";

export const exceptionFactory = ( error: string ) => {


	let msg = 'Ocurrió un error al validar este archivo';

	if ( error === 'File is required') {

		msg = 'Debes subir un archivo';

	} else if ( error.includes('expected type is') ) {

		msg = 'El archivo debe ser una imagen en formato jpg, jpeg, png o gif';

	} else if ( error.includes('expected size is less than') ) {

		msg = 'El archivo debe ser menor a 5MB';

	} else {
		// todo: guardar este error en los logs, en caso de que sea diferente de loso del if
		console.log(error);
	}


	return new BadRequestException(msg)

}
