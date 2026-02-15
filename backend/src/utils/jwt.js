import jwttoken from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secretKey = process.env.JWT_SECRET;

export const generateToken = (payload) => {
    return jwttoken.sign(payload, secretKey, { expiresIn: '7d' });

}

export const verifyToken = (token) => {
    try {
        return jwttoken.verify(token, secretKey);
    } catch (error) {
        return null;
    }   
}   

