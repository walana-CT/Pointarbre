import { nextCookies } from 'better-auth/next-js';
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@pointarbre/db";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),



	trustedOrigins: [process.env.CORS_ORIGIN || ""],
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
		sendSignUpEmail: false,
	},

	secret: process.env.BETTER_AUTH_SECRET,
  	plugins: [nextCookies()]
});

