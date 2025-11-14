"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ContactResponseDto, CreateContactDto } from "@/app/api/contacts/dto";
import { ContactModal } from "@/components/ContactModal";

type SearchField = "name" | "email" | "phone" | "company" | "title";
type SortOption = "name-asc" | "name-desc" | "date-desc" | "date-asc";

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<ContactResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchField, setSearchField] = useState<SearchField>("name");
  const [searchValue, setSearchValue] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("name-asc");

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();

      // Add search params if there's a search value
      if (searchValue.trim()) {
        params.append(searchField, searchValue.trim());
      }

      // Add sort params
      const [sortBy, order] = sortOption.split("-");
      if (sortBy === "name") {
        params.append("sortBy", "name");
        params.append("order", order);
      } else {
        params.append("sortBy", "updatedAt");
        params.append("order", order);
      }

      const queryString = params.toString();
      const url = queryString
        ? `/api/contacts?${queryString}`
        : "/api/contacts";

      const res = await fetch(url);
      const data: ContactResponseDto[] = await res.json();
      setContacts(data);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setLoading(false);
    }
  }, [searchValue, searchField, sortOption]);

  useEffect(() => {
    fetchContacts();
  }, []);

  const ExecuteSearch = async () => {
    await fetchContacts();
  };

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

      {/* Search and Sort Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search Section */}
        <div className="flex-1 flex gap-2">
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value as SearchField)}
            className="px-3 py-2 bg-bg text-fg border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="company">Company</option>
            <option value="title">Title</option>
          </select>
          <input
            type="text"
            placeholder={`Search by ${searchField}...`}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="flex-1 px-3 py-2 bg-bg text-fg border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Sort Section */}
        <div className="flex gap-2">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="px-3 py-2 bg-bg text-fg border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name-asc">A-Z</option>
            <option value="name-desc">Z-A</option>
            <option value="date-desc">Newest to Oldest</option>
            <option value="date-asc">Oldest to Newest</option>
          </select>
          <button
            onClick={() => ExecuteSearch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Search
          </button>
        </div>
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
