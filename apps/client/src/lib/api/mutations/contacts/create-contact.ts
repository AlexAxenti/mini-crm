import { ContactResponseDto, CreateContactDto } from "@/app/api/contacts/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { throwApiError } from "../../util/throw-api-error";

const createContact = async (
  data: CreateContactDto
): Promise<ContactResponseDto> => {
  const res = await fetch("/api/contacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throwApiError("Failed to create contact", res);
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
