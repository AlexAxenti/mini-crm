import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteNoteParams {
  noteId: string;
  contactId: string;
}

const deleteNote = async ({ noteId }: DeleteNoteParams): Promise<void> => {
  const res = await fetch(`/api/notes/${noteId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete note");
  }
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNote,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["notes", variables.contactId],
      });
    },
  });
};
