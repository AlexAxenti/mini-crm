import { ContactResponseDto, CreateContactDto } from "@/app/api/contacts/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const createContact = async (
  data: CreateContactDto
): Promise<ContactResponseDto> => {
  const res = await fetch("/api/contacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create contact");
  }

  return res.json();
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};
