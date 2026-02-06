import { useState } from "react";
import { usePeople, useAddPerson, useRemovePerson } from "../api/hooks";

function PeopleManager() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data: people = [] } = usePeople();
  const addPersonMutation = useAddPerson();
  const removePersonMutation = useRemovePerson();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name.trim()) {
      setError("Please enter a name");
      return;
    }
    if (people.includes(name.trim())) {
      setError("This person is already in the group");
      return;
    }
    addPersonMutation.mutate(name.trim(), {
      onSuccess: () => {
        setSuccess(`${name.trim()} added successfully!`);
        setName("");
        setTimeout(() => setSuccess(""), 3000);
      },
      onError: (err: Error) => {
        setError(err.message || "Failed to add person");
      },
    });
  };

  const handleRemove = (person: string) => {
    if (window.confirm(`Remove ${person}? This will also remove all their expenses.`)) {
      removePersonMutation.mutate(person, {
        onSuccess: () => {
          setSuccess(`${person} removed successfully!`);
          setTimeout(() => setSuccess(""), 3000);
        },
        onError: (err: Error) => {
          setError(err.message || "Failed to remove person");
        },
      });
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
      <h2 className="text-gray-700 mb-4 text-2xl border-b-2 border-gray-200 pb-2">
      👥 Manage People
      </h2>

      <form className="flex gap-2 mb-6" onSubmit={submit}>
        <input
          type="text"
          placeholder="Enter person's name"
          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-md text-base transition-colors focus:outline-none focus:border-indigo-500"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-500 text-white rounded-md text-sm font-medium cursor-pointer transition-all hover:bg-indigo-600 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={addPersonMutation.isPending}
        >
        {addPersonMutation.isPending ? "Adding..." : "Add Person"}
        </button>
      </form>

      {error && (
        <div className="bg-red-100 text-red-900 px-3 py-2 rounded-md mb-4 flex items-center gap-2">
        ❌ {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 text-green-900 px-3 py-2 rounded-md mb-4 flex items-center gap-2">
        ✅ {success}
        </div>
      )}

      <div className="mt-4">
        <h3 className="text-gray-600 my-2 text-lg">
          Current Members ({people.length})
        </h3>
        {people.length === 0 ? (
          <p className="text-center text-gray-400 py-8 italic">
            No people added yet
          </p>
        ) : (
          <ul className="list-none mt-2">
            {people.map((person, index) => (
              <li
                key={index}
                className="flex justify-between items-center p-2 mb-1 bg-gray-50 rounded transition-colors hover:bg-gray-100"
              >
                <span className="font-medium text-gray-800">{person}</span>
                <button
                  className="bg-transparent text-red-500 px-1 py-1 text-sm border border-transparent transition-colors hover:bg-red-100 hover:border-red-300 rounded disabled:opacity-50"
                  onClick={() => handleRemove(person)}
                  disabled={removePersonMutation.isPending}
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {people.length < 2 && (
        <p className="bg-red-100 text-red-900 px-3 py-3 rounded-md mt-4 flex items-center gap-2">
          ⚠️ Add at least 2 people to start tracking expenses
        </p>
      )}
    </div>
  );
}

export default PeopleManager;
