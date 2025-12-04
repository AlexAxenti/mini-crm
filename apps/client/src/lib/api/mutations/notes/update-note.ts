import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NoteResponseDto, UpdateNoteDto } from "@/app/api/notes/dto";
import { throwApiError } from "../../util/throw-api-error";

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
    throwApiError("Failed to update note", res);
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
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};
