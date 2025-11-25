import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { UserResponseDto } from "@/app/api-lib/queries/user/get-user";

interface LoginParams {
  email: string;
  password: string;
}

const login = async ({
  email,
  password,
}: LoginParams): Promise<UserResponseDto> => {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  // Ensure user exists in database and fetch/return user data
  if (data.user) {
    try {
      // Try to get the user first
      const checkResponse = await fetch("/api/user");

      if (checkResponse.ok) {
        // User exists, return the data
        return await checkResponse.json();
      }

      if (checkResponse.status === 404) {
        // User doesn't exist, create them
        const createResponse = await fetch("/api/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        if (createResponse.ok) {
          // Return the newly created user
          return await createResponse.json();
        }
      }
    } catch (err) {
      console.error("Error ensuring user exists:", err);
    }
  }

  throw new Error("Failed to fetch or create user");
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (userData) => {
      queryClient.setQueryData(["user"], userData);
    },
  });
};
