"use client";

import { useGetUser } from "@/lib/api/queries/user/get-user";
import { UserResponseDto } from "@/app/api/user/dto";
import { createContext, useContext, ReactNode } from "react";

interface UserContextType {
  user: UserResponseDto | null;
  isLoading: boolean;
  isError: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { data: user, isLoading, isError } = useGetUser();

  return (
    <UserContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        isError,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
