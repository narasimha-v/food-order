import multer from 'multer';
import { v4 as uuid } from 'uuid';

const imageStorage = multer.diskStorage({
	destination: 'src/images',
	filename(_, file, callback) {
		callback(null, `${uuid()}-${file.originalname}`);
	}
});

export const uploadImagesHandler = multer({ storage: imageStorage }).array(
	'images',
	10
);
