import { useMutation, useQueryClient } from "@tanstack/react-query";

const deleteContact = async (id: string): Promise<void> => {
  const res = await fetch(`/api/contacts/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete contact");
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
