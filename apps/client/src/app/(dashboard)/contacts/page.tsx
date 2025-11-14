"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ContactResponseDto, CreateContactDto } from "@/app/api/contacts/dto";
import { ContactModal } from "@/components/ContactModal";

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<ContactResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/contacts");
      const data: ContactResponseDto[] = await res.json();
      console.log("Fetched contacts:", data);
      setContacts(data);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleCreateContact = async (data: CreateContactDto) => {
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Failed to create contact");
    }

    // Refresh the list
    await fetchContacts();
  };

  const handleRowClick = (contactId: string) => {
    router.push(`/contacts/${contactId}`);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Contacts</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Contact
        </button>
      </div>

      {loading && <div className="text-center py-4">Loading...</div>}

      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateContact}
        title="Create Contact"
        submitText="Create"
      />

      <div className="bg-bg border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Company
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Title
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody>
            {contacts?.length > 0 &&
              contacts.map((contact) => (
                <tr
                  key={contact.id}
                  onClick={() => handleRowClick(contact.id)}
                  className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium">{contact.name}</td>
                  <td className="px-4 py-3 text-sm">{contact.email}</td>
                  <td className="px-4 py-3 text-sm">{contact.phone}</td>
                  <td className="px-4 py-3 text-sm">{contact.company}</td>
                  <td className="px-4 py-3 text-sm">{contact.title}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(contact.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {contacts.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          No contacts yet. Click &quot;Add Contact&quot; to get started.
        </div>
      )}
    </div>
  );
}
