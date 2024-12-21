import { FileTypeValidator, MaxFileSizeValidator } from "@nestjs/common";

export const validators = [
	new FileTypeValidator({ fileType: '.(png|jpg|jpeg|gif)' }),
	new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 })
]
