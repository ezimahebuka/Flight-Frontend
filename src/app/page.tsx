"use client";

import Image from "next/image";
import { useState } from "react";
import BookingItinerary from "../components/booking-itinerary";
import { apiFetch } from "../lib/api";

export default function HomePage() {
  const [accessCode, setAccessCode] = useState("");
  const [surname, setSurname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<any>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch<any>("/api/public/lookup", {
        method: "POST",
        body: JSON.stringify({ accessCode, surname }),
      });
      setBooking({ ...response, accessCode });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to find that booking.",
      );
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a
            href="/"
            aria-label="American Airlines home"
            className="inline-flex items-center"
          >
            <span className="flex items-center gap-3">
              <Image
                src="/american-airlines-wordmark.svg"
                alt="American Airlines"
                width={245}
                height={25}
                priority
                className="h-[17px] w-[170px] sm:h-[21px] sm:w-[205px]"
              />
              <Image
                src="/american-airlines-symbol.svg"
                alt=""
                width={56}
                height={56}
                priority
                className="h-10 w-10 object-contain sm:h-12 sm:w-12"
              />
            </span>
          </a>
          {/* <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="/admin/login">Admin login</a>
          </nav> */}
        </div>
      </header>

      <section className="relative isolate flex min-h-[calc(100svh-73px)] items-center justify-center overflow-hidden px-5 py-10 print:hidden sm:px-6">
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(rgba(8, 24, 42, 0.28), rgba(8, 24, 42, 0.28)), url('/flight-hero.jpg')",
          }}
        />
        <div className="relative z-10 w-full max-w-[560px]">
          <div className="mb-7 text-white">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-sky-100">
              Manage your trip
            </p>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Find your booking
            </h2>
            <p className="mt-3 max-w-lg text-base leading-7 text-white/90">
              Enter the access code from your booking confirmation and the
              passenger’s last name.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-950/15 sm:p-7"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-800">
                  Access code
                </span>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(event) => setAccessCode(event.target.value)}
                  placeholder="Enter access code"
                  autoComplete="off"
                  className="w-full rounded-sm border border-slate-400 bg-white px-3 py-3 text-slate-900 outline-none focus:border-sky-800 focus:ring-1 focus:ring-sky-800"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-800">
                  Passenger last name
                </span>
                <input
                  type="text"
                  value={surname}
                  onChange={(event) => setSurname(event.target.value)}
                  placeholder="As shown on the booking"
                  autoComplete="family-name"
                  className="w-full rounded-sm border border-slate-400 bg-white px-3 py-3 text-slate-900 outline-none focus:border-sky-800 focus:ring-1 focus:ring-sky-800"
                  required
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 inline-flex min-w-40 items-center justify-center rounded-sm bg-sky-800 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-900 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Searching..." : "Find booking"}
            </button>

            {error ? (
              <div
                role="alert"
                className="mt-4 border-l-4 border-rose-700 bg-white px-4 py-3 text-sm text-rose-800"
              >
                {error}
              </div>
            ) : null}
          </form>
        </div>
      </section>

      {booking ? (
        <section className="mx-auto max-w-6xl px-6 pb-16 print:max-w-none print:px-0 print:pb-0">
          <BookingItinerary booking={booking} />
        </section>
      ) : null}
    </main>
  );
}
