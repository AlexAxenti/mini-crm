import { ContactResponseDto, UpdateContactDto } from "@/app/api/contacts/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { throwApiError } from "../../util/throw-api-error";

interface UpdateContactParams {
  id: string;
  data: UpdateContactDto;
}

const updateContact = async ({
  id,
  data,
}: UpdateContactParams): Promise<ContactResponseDto> => {
  const res = await fetch(`/api/contacts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throwApiError("Failed to update contact", res);
  }

  return res.json();
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateContact,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["contact", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};
