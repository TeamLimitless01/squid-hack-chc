"use client";

import { FormEvent, useState } from "react";

type CreatedUser = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
};

export default function TestUsersPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [user, setUser] = useState<CreatedUser | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setUser(null);

    try {
      const response = await fetch("/api/test-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not create the test user.");
      }

      setUser(data.user);
      setForm({ name: "", email: "", phone: "" });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not create the test user.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="test-page">
      <section className="test-shell">
        <div className="test-intro">
          <p className="eyebrow">MongoDB test bench</p>
          <h1>Create a test user</h1>
          <p>
            Add a temporary farmer account to verify the database connection.
            Leave the fields blank to generate unique test details.
          </p>
          <div className="status-line">
            <span className="status-dot" />
            POST /api/test-users
          </div>
        </div>

        <form className="test-form" onSubmit={createUser}>
          <label>
            Name
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Temporary Test User"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="Generated automatically"
            />
          </label>
          <label>
            Phone
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              placeholder="Generated automatically"
            />
          </label>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Connecting..." : "Create test user"}
          </button>

          {error && <p className="feedback error">{error}</p>}

          {user && (
            <div className="feedback success">
              <strong>User created</strong>
              <dl>
                <div><dt>Name</dt><dd>{user.name}</dd></div>
                <div><dt>Email</dt><dd>{user.email}</dd></div>
                <div><dt>Phone</dt><dd>{user.phone}</dd></div>
                <div><dt>ID</dt><dd>{user._id}</dd></div>
              </dl>
            </div>
          )}
        </form>
      </section>
    </main>
  );
}