'use client';
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

export function AuthActions() {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <UserButton />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <SignUpButton>
        <button className="subscribe-button">Subscribe</button>
      </SignUpButton>
      <SignInButton>
        <button className="login-button">Login</button>
      </SignInButton>
    </div>
  );
}
