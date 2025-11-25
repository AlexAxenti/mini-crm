import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NoteResponseDto } from "@/app/api-lib/queries/notes/get-notes";

export interface UpdateNoteDto {
  title?: string;
  body?: string;
}

interface UpdateNoteParams {
  noteId: string;
  contactId: string;
  data: UpdateNoteDto;
}

const updateNote = async ({
  noteId,
  data,
}: UpdateNoteParams): Promise<NoteResponseDto> => {
  const res = await fetch(`/api/notes/${noteId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update note");
  }

  return res.json();
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNote,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["notes", variables.contactId],
      });
    },
  });
};
