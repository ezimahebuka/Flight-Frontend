"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function AdminDashboard() {
  const [tokenReady, setTokenReady] = useState(false);
  const [activeSection, setActiveSection] = useState("Overview");
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [passengers, setPassengers] = useState<any[]>([]);
  const [generatedCodes, setGeneratedCodes] = useState<Record<string, string>>(
    {},
  );
  const [actionError, setActionError] = useState("");
  const [search, setSearch] = useState("");
  const [bookingForm, setBookingForm] = useState({
    bookingReference: "",
    tripType: "one-way",
    bookingStatus: "confirmed",
    firstName: "Alex",
    lastName: "Rivera",
    email: "alex@example.com",
    phone: "+1 555 010 2020",
    passengerType: "adult",
    airline: "Northstar Air",
    flightNumber: "NS-205",
    aircraftType: "",
    airlineConfirmation: "",
    brandName: "",
    stops: "Nonstop",
    departureAirport: "JFK",
    departureCity: "New York",
    departureDate: "2027-08-15",
    departureTime: "08:20",
    arrivalAirport: "LHR",
    arrivalCity: "London",
    arrivalDate: "2027-08-15",
    arrivalTime: "20:45",
    duration: "12h 25m",
    cabinClass: "Economy",
    seatNumber: "12A",
    baggageAllowance: "1 checked bag",
    terminal: "A",
    gate: "12",
    currency: "USD",
    ticketPrice: 540,
    taxes: 90,
    additionalCharges: 25,
    totalAmount: 655,
    paymentStatus: "paid",
  });

  async function fetchData() {
    const token = localStorage.getItem("flight-admin-token");
    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    try {
      const [statsData, bookingsData, passengersData] = await Promise.all([
        apiFetch<any>("/api/admin/dashboard/stats"),
        apiFetch<any[]>("/api/admin/bookings"),
        apiFetch<any[]>("/api/admin/passengers"),
      ]);
      setStats(statsData);
      setBookings(bookingsData);
      setPassengers(passengersData);
    } catch (error) {
      console.error(error);
      window.location.href = "/admin/login";
    } finally {
      setTokenReady(true);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const term = search.toLowerCase();
      if (!term) return true;
      return (
        booking.bookingReference?.toLowerCase().includes(term) ||
        booking.flightSegments?.some((segment: any) =>
          segment.flightNumber?.toLowerCase().includes(term),
        ) ||
        `${booking.passengers?.[0]?.firstName || ""} ${booking.passengers?.[0]?.lastName || ""}`
          .toLowerCase()
          .includes(term)
      );
    });
  }, [bookings, search]);

  const filteredPassengers = useMemo(() => {
    const term = search.toLowerCase();
    return passengers.filter((passenger) => {
      const bookingReference = passenger.bookingId?.bookingReference || "";
      return (
        !term ||
        `${passenger.firstName} ${passenger.lastName}`
          .toLowerCase()
          .includes(term) ||
        passenger.email?.toLowerCase().includes(term) ||
        bookingReference.toLowerCase().includes(term)
      );
    });
  }, [passengers, search]);

  async function handleGenerateCode(booking: any) {
    setActionError("");
    try {
      const result = await apiFetch<any>(
        `/api/admin/bookings/${booking._id}/${booking.accessCodePreview ? "regenerate-code" : "generate-code"}`,
        { method: "POST" },
      );
      setGeneratedCodes((codes) => ({
        ...codes,
        [booking._id]: result.accessCode,
      }));
      setBookings((items) =>
        items.map((item) =>
          item._id === booking._id
            ? { ...item, accessCodePreview: result.maskedAccessCode }
            : item,
        ),
      );
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to generate access code.",
      );
    }
  }

  async function handleCreateBooking(event: React.FormEvent) {
    event.preventDefault();

    const payload = {
      bookingReference: bookingForm.bookingReference || undefined,
      tripType: bookingForm.tripType,
      bookingStatus: bookingForm.bookingStatus,
      passengers: [
        {
          firstName: bookingForm.firstName,
          lastName: bookingForm.lastName,
          email: bookingForm.email,
          phone: bookingForm.phone,
          passengerType: bookingForm.passengerType,
        },
      ],
      flightSegments: [
        {
          airline: bookingForm.airline,
          flightNumber: bookingForm.flightNumber,
          aircraftType: bookingForm.aircraftType || undefined,
          airlineConfirmation: bookingForm.airlineConfirmation || undefined,
          brandName: bookingForm.brandName || undefined,
          stops: bookingForm.stops || undefined,
          departureAirport: bookingForm.departureAirport,
          departureCity: bookingForm.departureCity,
          departureDate: bookingForm.departureDate,
          departureTime: bookingForm.departureTime,
          arrivalAirport: bookingForm.arrivalAirport,
          arrivalCity: bookingForm.arrivalCity,
          arrivalDate: bookingForm.arrivalDate,
          arrivalTime: bookingForm.arrivalTime,
          duration: bookingForm.duration,
          cabinClass: bookingForm.cabinClass,
          seatAssignments: [
            {
              passengerName: `${bookingForm.firstName} ${bookingForm.lastName}`,
              seatNumber: bookingForm.seatNumber,
            },
          ],
          baggageAllowance: bookingForm.baggageAllowance,
          terminal: bookingForm.terminal,
          gate: bookingForm.gate,
        },
      ],
      paymentDetails: {
        currency: bookingForm.currency,
        ticketPrice: bookingForm.ticketPrice,
        taxes: bookingForm.taxes,
        additionalCharges: bookingForm.additionalCharges,
        totalAmount: bookingForm.totalAmount,
        paymentStatus: bookingForm.paymentStatus,
      },
    };

    const result = await apiFetch<any>("/api/admin/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    alert(
      `Booking created with reference ${result.bookingReference}. Access code: ${result.accessCode}`,
    );
    fetchData();
  }

  if (!tokenReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-700">
        Loading dashboard...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <aside className="fixed inset-y-0 left-0 hidden w-72 bg-slate-900 p-6 text-white md:block">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-700 text-lg font-bold">
            F
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sky-300">
              Portal
            </p>
            <h1 className="text-xl font-bold">Northstar Air</h1>
          </div>
        </div>

        <nav className="mt-10 space-y-2 text-sm" aria-label="Admin sections">
          {["Overview", "Passengers", "Bookings", "Access codes"].map(
            (section) => (
              <button
                key={section}
                type="button"
                onClick={() => {
                  setActiveSection(section);
                  setSearch("");
                  setActionError("");
                }}
                aria-current={activeSection === section ? "page" : undefined}
                className={`block w-full rounded-xl px-4 py-3 text-left transition-colors ${
                  activeSection === section
                    ? "bg-slate-800 font-semibold text-sky-300"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {section}
              </button>
            ),
          )}
        </nav>
      </aside>

      <div className="md:ml-72">
        <header className="border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-sky-700">
                Operations dashboard
              </p>
              <h2 className="text-2xl font-bold text-slate-900">
                {activeSection === "Overview"
                  ? "Flight administration"
                  : activeSection}
              </h2>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("flight-admin-token");
                window.location.href = "/admin/login";
              }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Log out
            </button>
          </div>
        </header>

        <div className="space-y-8 px-6 py-8">
          {actionError && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {actionError}
            </p>
          )}
          {activeSection === "Passengers" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h3 className="text-lg font-bold">
                  Passenger records{" "}
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    {filteredPassengers.length}
                  </span>
                </h3>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search passenger or booking"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-sky-500 md:max-w-xs"
                />
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Passenger</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Phone</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Booking</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPassengers.length ? (
                      filteredPassengers.map((passenger) => (
                        <tr
                          key={passenger._id}
                          className="border-t border-slate-200"
                        >
                          <td className="px-4 py-3 font-semibold">
                            {passenger.firstName} {passenger.lastName}
                          </td>
                          <td className="px-4 py-3">{passenger.email}</td>
                          <td className="px-4 py-3">{passenger.phone}</td>
                          <td className="px-4 py-3 capitalize">
                            {passenger.passengerType}
                          </td>
                          <td className="px-4 py-3">
                            {passenger.bookingId?.bookingReference || "—"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-10 text-center text-slate-500"
                        >
                          No passengers found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          {activeSection === "Bookings" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h3 className="text-lg font-bold">
                  Booking records{" "}
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    {filteredBookings.length}
                  </span>
                </h3>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search booking, flight or passenger"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-sky-500 md:max-w-xs"
                />
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Reference</th>
                      <th className="px-4 py-3 font-medium">Passenger</th>
                      <th className="px-4 py-3 font-medium">Route</th>
                      <th className="px-4 py-3 font-medium">Departure</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length ? (
                      filteredBookings.map((booking) => {
                        const flight = booking.flightSegments?.[0];
                        const passenger = booking.passengers?.[0];
                        return (
                          <tr
                            key={booking._id}
                            className="border-t border-slate-200"
                          >
                            <td className="px-4 py-3 font-semibold">
                              {booking.bookingReference}
                            </td>
                            <td className="px-4 py-3">
                              {passenger
                                ? `${passenger.firstName} ${passenger.lastName}`
                                : "—"}
                            </td>
                            <td className="px-4 py-3">
                              {flight
                                ? `${flight.departureAirport} to ${flight.arrivalAirport}`
                                : "—"}
                            </td>
                            <td className="px-4 py-3">
                              {flight?.departureDate
                                ? new Date(
                                    flight.departureDate,
                                  ).toLocaleDateString()
                                : "—"}
                            </td>
                            <td className="px-4 py-3 capitalize">
                              {booking.bookingStatus}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-10 text-center text-slate-500"
                        >
                          No bookings found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          {activeSection === "Access codes" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-5 text-lg font-bold">
                Booking access codes{" "}
                <span className="ml-2 text-sm font-normal text-slate-500">
                  {bookings.length}
                </span>
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Reference</th>
                      <th className="px-4 py-3 font-medium">Passenger</th>
                      <th className="px-4 py-3 font-medium">Code</th>
                      <th className="px-4 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length ? (
                      bookings.map((booking) => {
                        const passenger = booking.passengers?.[0];
                        return (
                          <tr
                            key={booking._id}
                            className="border-t border-slate-200"
                          >
                            <td className="px-4 py-3 font-semibold">
                              {booking.bookingReference}
                            </td>
                            <td className="px-4 py-3">
                              {passenger
                                ? `${passenger.firstName} ${passenger.lastName}`
                                : "—"}
                            </td>
                            <td className="px-4 py-3 font-mono">
                              {generatedCodes[booking._id] ||
                                booking.accessCodePreview ||
                                "Not generated"}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => handleGenerateCode(booking)}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                {booking.accessCodePreview
                                  ? "Regenerate"
                                  : "Generate"}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-10 text-center text-slate-500"
                        >
                          No bookings available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Generated codes are shown only until this page is refreshed.
                Share them with the relevant passenger through a secure channel.
              </p>
            </section>
          )}
          {activeSection === "Overview" && (
            <>
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Total passengers", stats?.totalPassengers ?? 0],
                  ["Total bookings", stats?.totalBookings ?? 0],
                  ["Active bookings", stats?.activeBookings ?? 0],
                  ["Cancelled bookings", stats?.cancelledBookings ?? 0],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      {label}
                    </p>
                    <p className="mt-4 text-3xl font-bold text-slate-900">
                      {value}
                    </p>
                  </div>
                ))}
              </section>

              <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h3 className="text-xl font-bold text-slate-900">
                    Recent bookings
                  </h3>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by booking, flight or passenger"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 md:max-w-xs"
                  />
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-medium">Reference</th>
                        <th className="px-4 py-3 font-medium">Passenger</th>
                        <th className="px-4 py-3 font-medium">Flight</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.length ? (
                        filteredBookings.map((booking) => (
                          <tr
                            key={booking._id}
                            className="border-t border-slate-200"
                          >
                            <td className="px-4 py-3 font-semibold text-slate-900">
                              {booking.bookingReference}
                            </td>
                            <td className="px-4 py-3">
                              {booking.passengers?.[0]
                                ? `${booking.passengers[0].firstName} ${booking.passengers[0].lastName}`
                                : "—"}
                            </td>
                            <td className="px-4 py-3">
                              {booking.flightSegments?.[0]?.flightNumber || "—"}
                            </td>
                            <td className="px-4 py-3">
                              <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                                {booking.bookingStatus}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-10 text-center text-slate-500"
                          >
                            No bookings match your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900">
                  Create new booking
                </h3>
                <form
                  onSubmit={handleCreateBooking}
                  className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
                >
                  <input
                    value={bookingForm.bookingReference}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        bookingReference: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Booking reference"
                  />
                  <select
                    value={bookingForm.tripType}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        tripType: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <option value="one-way">One-way</option>
                    <option value="return">Return</option>
                    <option value="multi-city">Multi-city</option>
                  </select>
                  <select
                    value={bookingForm.bookingStatus}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        bookingStatus: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>

                  <input
                    value={bookingForm.firstName}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        firstName: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="First name"
                  />
                  <input
                    value={bookingForm.lastName}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        lastName: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Last name"
                  />
                  <input
                    value={bookingForm.email}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        email: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Email"
                  />
                  <input
                    value={bookingForm.phone}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        phone: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Phone"
                  />
                  <input
                    value={bookingForm.passengerType}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        passengerType: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Passenger type"
                  />
                  <input
                    value={bookingForm.airline}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        airline: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Airline"
                  />
                  <input
                    value={bookingForm.flightNumber}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        flightNumber: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Flight number"
                  />
                  <input
                    value={bookingForm.airlineConfirmation}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        airlineConfirmation: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Airline confirmation"
                  />
                  <input
                    value={bookingForm.aircraftType}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        aircraftType: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Aircraft type"
                  />
                  <input
                    value={bookingForm.brandName}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        brandName: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Cabin brand"
                  />
                  <input
                    value={bookingForm.stops}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        stops: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Stops (for example: Nonstop)"
                  />
                  <input
                    value={bookingForm.cabinClass}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        cabinClass: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Cabin class"
                  />
                  <input
                    value={bookingForm.departureCity}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        departureCity: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Departure city"
                  />
                  <input
                    value={bookingForm.departureAirport}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        departureAirport: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Departure airport"
                  />
                  <input
                    value={bookingForm.departureDate}
                    type="date"
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        departureDate: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  />
                  <input
                    value={bookingForm.departureTime}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        departureTime: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Departure time"
                  />
                  <input
                    value={bookingForm.arrivalCity}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        arrivalCity: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Arrival city"
                  />
                  <input
                    value={bookingForm.arrivalAirport}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        arrivalAirport: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Arrival airport"
                  />
                  <input
                    value={bookingForm.arrivalDate}
                    type="date"
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        arrivalDate: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  />
                  <input
                    value={bookingForm.arrivalTime}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        arrivalTime: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Arrival time"
                  />
                  <input
                    value={bookingForm.duration}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        duration: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Duration"
                  />
                  <input
                    value={bookingForm.seatNumber}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        seatNumber: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Seat"
                  />
                  <input
                    value={bookingForm.baggageAllowance}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        baggageAllowance: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Baggage allowance"
                  />
                  <input
                    value={bookingForm.terminal}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        terminal: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Terminal"
                  />
                  <input
                    value={bookingForm.gate}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        gate: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Gate"
                  />
                  <input
                    value={bookingForm.currency}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        currency: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Currency"
                  />
                  <input
                    value={bookingForm.ticketPrice}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        ticketPrice: Number(event.target.value),
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Ticket price"
                  />
                  <input
                    value={bookingForm.taxes}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        taxes: Number(event.target.value),
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Taxes"
                  />
                  <input
                    value={bookingForm.additionalCharges}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        additionalCharges: Number(event.target.value),
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Additional charges"
                  />
                  <input
                    value={bookingForm.totalAmount}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        totalAmount: Number(event.target.value),
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Total amount"
                  />
                  <input
                    value={bookingForm.paymentStatus}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        paymentStatus: event.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Payment status"
                  />

                  <div className="md:col-span-2 xl:col-span-3 text-right">
                    <button
                      type="submit"
                      className="rounded-xl bg-sky-700 px-5 py-3 font-semibold text-white hover:bg-sky-800"
                    >
                      Create booking
                    </button>
                  </div>
                </form>
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
