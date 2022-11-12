import bcrypt from 'bcrypt';

export const generateSalt = async () => {
	return await bcrypt.genSalt();
};

export const generatePassword = async (password: string, salt: string) => {
	return await bcrypt.hash(password, salt);
};
