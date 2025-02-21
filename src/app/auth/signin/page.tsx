'use client';

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function SignIn() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="w-full max-w-sm space-y-4 rounded-lg border p-6 shadow-lg">
				<h1 className="text-2xl font-bold text-center">Sign In</h1>
				<Button 
					className="w-full"
					onClick={() => signIn('github', { callbackUrl: '/' })}
				>
					Continue with GitHub
				</Button>
			</div>
		</div>
	);
}