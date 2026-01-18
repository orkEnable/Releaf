import { SignupForm } from "./components/signup-form";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 sm:p-8 bg-background">
      <div className="w-full max-w-md">
        <SignupForm />
      </div>
    </div>
  );
}
