import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface SignupParams {
  email: string;
  password: string;
}

interface SignupResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const signup = async ({
  email,
  password,
}: SignupParams): Promise<SignupResponse> => {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  // Create user in the contacts service
  if (data.user) {
    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to create user in database:", errorData);
      }
    } catch (err) {
      console.error("Error creating user:", err);
    }
  }

  return {
    success: true,
    message: "Check your email to confirm your account!",
  };
};

export const useSignup = () => {
  return useMutation({
    mutationFn: signup,
  });
};
