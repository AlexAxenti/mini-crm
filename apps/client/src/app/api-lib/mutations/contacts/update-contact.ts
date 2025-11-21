import { ContactResponseDto, UpdateContactDto } from "@/app/api/contacts/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
    throw new Error("Failed to update contact");
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
