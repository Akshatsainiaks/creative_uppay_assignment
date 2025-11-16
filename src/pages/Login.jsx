import React from "react";
import { SignIn } from "@clerk/clerk-react";

export default function Login() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow">
        <SignIn
          path="/login"
          routing="path"
          signUpUrl="/signup"
          afterSignInUrl="/dashboard"
        />
      </div>
    </div>
  );
}
