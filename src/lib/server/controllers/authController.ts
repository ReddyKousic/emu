import jwt from 'jsonwebtoken';
import { student } from '../db/schema/student';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '$lib';

const secretKey = process.env.JWT_SECRET || 'your-secret-key'; // Use an environment variable
export interface StudentTokenPayload {
	id: number;
	email: string;
	name: string;
	role: string;
	iat?: number;
	exp?: number;
}
export class authController {
	async studentLogin(email: string, password: string) {
		try {
			// Fetch student record
			const studentRecord = await db
				.select()
				.from(student)
				.where(eq(student.email, String(email)))
				.limit(1);

			// Check if student exists
			if (studentRecord.length === 0) {
				throw new Error('Invalid email or password');
			}

			// Verify password
			const studentPasswordHash = studentRecord[0].password;
			const passwordMatch = await verifyPassword(String(password), studentPasswordHash);

			if (!passwordMatch) {
				throw new Error('Invalid email or password');
			}

			// Generate JWT Token
			const token = this.generateToken({
				role: 'student',
				name: studentRecord[0].name,
				email,
				id: studentRecord[0].id
			});

			console.log(token);
			return { token }; // Return token
		} catch (error) {
			console.error(error);
			throw new Error(error instanceof Error ? error.message : String(error));
		}
	}

	async getLocalStudentDetails(token: string): Promise<StudentTokenPayload> {
		try {
			// Verify token
			const StudentTokenPayload = this.verifyToken(token) as StudentTokenPayload;
			console.log(StudentTokenPayload);
			return StudentTokenPayload;
		} catch (error) {
			console.error(error);
			throw new Error('Invalid token');
		}
	}

	// Token generation function
	private generateToken(payload: StudentTokenPayload): string {
		return jwt.sign(payload, secretKey, { expiresIn: '6h' }); // Token expires in 1 hour
	}

	private verifyToken(token: string): StudentTokenPayload {
		try {
			// Verify the token and cast the payload to the StudentTokenPayload type
			const decoded = jwt.verify(token, secretKey) as StudentTokenPayload;
			return decoded;
		} catch (error) {
			console.error('Token verification failed:', error);

			// Handle specific errors
			if (error instanceof jwt.TokenExpiredError) {
				throw new Error('Token expired');
			} else if (error instanceof jwt.JsonWebTokenError) {
				throw new Error('Invalid token');
			} else {
				throw new Error('Token verification failed');
			}
		}
	}
}
