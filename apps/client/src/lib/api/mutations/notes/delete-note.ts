import { useMutation, useQueryClient } from "@tanstack/react-query";
import { throwApiError } from "../../util/throw-api-error";

interface DeleteNoteParams {
  noteId: string;
  contactId: string;
}

const deleteNote = async ({ noteId }: DeleteNoteParams): Promise<void> => {
  const res = await fetch(`/api/notes/${noteId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throwApiError("Failed to delete note", res);
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
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};
