import { useCallback, useEffect, useState } from "react";

// Note types matching backend DTOs
interface NoteResponseDto {
  id: string;
  title: string;
  body: string;
  contactId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateNoteDto {
  title: string;
  body: string;
}

interface UpdateNoteDto {
  title?: string;
  body?: string;
}

type SortOrder = "newest" | "oldest";

interface NotesProps {
  contactId: string;
}

const Notes = ({ contactId }: NotesProps) => {
  // Notes state
  const [notes, setNotes] = useState<NoteResponseDto[]>([]);
  const [selectedNote, setSelectedNote] = useState<NoteResponseDto | null>(
    null
  );
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [isNewNote, setIsNewNote] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);

  const handleNoteSelect = (note: NoteResponseDto) => {
    setSelectedNote(note);
    setNoteTitle(note.title);
    setNoteBody(note.body);
    setIsNewNote(false);
  };

  const handleCreateNote = () => {
    setSelectedNote(null);
    setNoteTitle("");
    setNoteBody("");
    setIsNewNote(true);
  };

  const handleSaveNote = async () => {
    setNoteSaving(true);
    try {
      if (isNewNote) {
        // Create new note
        const createData: CreateNoteDto = {
          title: noteTitle,
          body: noteBody,
        };

        const res = await fetch(`/api/contacts/${contactId}/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(createData),
        });

        if (!res.ok) throw new Error("Failed to create note");

        const newNote: NoteResponseDto = await res.json();
        setNotes([newNote, ...notes]);
        setSelectedNote(newNote);
        setIsNewNote(false);
      } else if (selectedNote) {
        // Update existing note
        const updateData: UpdateNoteDto = {
          title: noteTitle,
          body: noteBody,
        };

        const res = await fetch(`/api/notes/${selectedNote.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });

        if (!res.ok) throw new Error("Failed to update note");

        const updatedNote: NoteResponseDto = await res.json();
        setNotes(
          notes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
        );
        setSelectedNote(updatedNote);
      }

      // Refresh notes list to get proper sorting
      await fetchNotes();
    } catch (error) {
      console.error("Failed to save note:", error);
      alert("Failed to save note");
    } finally {
      setNoteSaving(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNote) return;
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const res = await fetch(`/api/notes/${selectedNote.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete note");

      setNotes(notes.filter((note) => note.id !== selectedNote.id));
      setSelectedNote(null);
      setNoteTitle("");
      setNoteBody("");
    } catch (error) {
      console.error("Failed to delete note:", error);
      alert("Failed to delete note");
    }
  };

  const fetchNotes = useCallback(async () => {
    try {
      // Build query params for sorting
      const params = new URLSearchParams();
      params.append("sortBy", "updatedAt");
      params.append("order", sortOrder === "newest" ? "desc" : "asc");

      const queryString = params.toString();
      const url = `/api/notes?${queryString}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch notes");

      const data: NoteResponseDto[] = await res.json();
      // Filter notes by contactId on the frontend
      const contactNotes = data.filter((note) => note.contactId === contactId);
      setNotes(contactNotes);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    }
  }, [sortOrder, contactId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold">Notes</h3>
        <button
          onClick={handleCreateNote}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          + New Note
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notes List */}
        <div className="lg:col-span-1">
          <div className="mb-3 flex justify-between items-center">
            <label className="text-sm font-semibold">Sort by:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="px-3 py-1 text-sm bg-bg text-fg border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>

          <div className="bg-bg border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
            {notes.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notes yet. Click &quot;New Note&quot; to create one.
              </div>
            ) : (
              <div className="divide-y divide-gray-300 dark:divide-gray-700">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => handleNoteSelect(note)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 ${
                      selectedNote?.id === note.id
                        ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600"
                        : ""
                    }`}
                  >
                    <h4 className="font-semibold truncate">{note.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {note.body}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Note Editor */}
        <div className="lg:col-span-2">
          <div className="bg-bg border border-gray-300 dark:border-gray-700 rounded-lg p-6">
            {selectedNote || isNewNote ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Enter note title..."
                    className="w-full px-3 py-2 bg-bg text-fg border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Body
                  </label>
                  <textarea
                    value={noteBody}
                    onChange={(e) => setNoteBody(e.target.value)}
                    placeholder="Enter note content..."
                    rows={12}
                    className="w-full px-3 py-2 bg-bg text-fg border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  {!isNewNote && selectedNote && (
                    <button
                      onClick={handleDeleteNote}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    onClick={handleSaveNote}
                    disabled={
                      noteSaving || !noteTitle.trim() || !noteBody.trim()
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {noteSaving
                      ? "Saving..."
                      : isNewNote
                      ? "Create Note"
                      : "Save Changes"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Select a note from the list or create a new one
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;
