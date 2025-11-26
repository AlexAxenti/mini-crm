import { useMutation, useQueryClient } from "@tanstack/react-query";
import { throwApiError } from "../../util/throw-api-error";

const deleteContact = async (id: string): Promise<void> => {
  const res = await fetch(`/api/contacts/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throwApiError("Failed to delete contact", res);
  }
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteContact,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["contact", deletedId] });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.removeQueries({ queryKey: ["contact", deletedId] });
    },
  });
};
