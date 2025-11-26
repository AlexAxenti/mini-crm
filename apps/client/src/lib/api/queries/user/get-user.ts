import { useQuery } from "@tanstack/react-query";
import { throwApiError } from "../../util/throw-api-error";

export interface UserResponseDto {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const fetchUser = async (): Promise<UserResponseDto> => {
  const res = await fetch("/api/user");

  if (!res.ok) {
    throwApiError("Failed to fetch user", res);
  }
  return res.json();
};

export const useGetUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};
