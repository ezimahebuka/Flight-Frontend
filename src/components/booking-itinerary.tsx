type Passenger = {
  firstName: string;
  lastName: string;
  passengerType?: string;
  email?: string;
  phone?: string;
};

type FlightSegment = {
  airline: string;
  flightNumber: string;
  aircraftType?: string;
  airlineConfirmation?: string;
  departureAirport: string;
  departureCity: string;
  departureDate: string | Date;
  departureTime: string;
  arrivalAirport: string;
  arrivalCity: string;
  arrivalDate: string | Date;
  arrivalTime: string;
  duration?: string;
  cabinClass?: string;
  brandName?: string;
  stops?: string;
  seatAssignments?: Array<{ passengerName: string; seatNumber: string }>;
  baggageAllowance?: string;
  terminal?: string;
  gate?: string;
};

type ItineraryBooking = {
  bookingReference: string;
  bookingStatus?: string;
  bookingDate?: string | Date;
  createdAt?: string | Date;
  tripType?: string;
  passengers?: Passenger[];
  flightSegments?: FlightSegment[];
  paymentDetails?: {
    currency?: string;
    ticketPrice?: number;
    taxes?: number;
    additionalCharges?: number;
    totalAmount?: number;
  };
  supportContacts?: string[];
  importantNotices?: string[];
  baggageInformation?: string[];
};

type BookingItineraryProps = {
  booking: ItineraryBooking | null;
};

function formatTravelDate(value: string | Date | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatFare(amount: number | undefined, currency: string | undefined) {
  if (amount === undefined || amount === null) return "—";
  if (!currency) return String(amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export default function BookingItinerary({ booking }: BookingItineraryProps) {
  if (!booking) return null;

  return (
    <article className="mx-auto max-w-225 border border-slate-300 bg-white px-6 py-7 text-slate-800 shadow-sm md:px-12 md:py-10 print:max-w-none print:border-0 print:p-0 print:shadow-none">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-slate-300 pb-4">
        <div>
          <p className="text-lg font-bold tracking-normal text-sky-800">
            Northstar Air
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Flight booking acknowledgement
          </p>
        </div>
        <div className="flex items-start gap-4">
          {booking.supportContacts?.length ? (
            <div className="text-right text-xs leading-5 text-slate-600">
              {booking.supportContacts.map((contact: string) => (
                <p key={contact}>{contact}</p>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 print:hidden"
          >
            Print
          </button>
        </div>
      </header>

      <section className="mb-6 border border-sky-800/40 px-5 py-4 text-center">
        <h2 className="text-lg font-bold text-sky-900">
          Booking Acknowledgement
        </h2>
        <p className="mt-2 text-sm text-slate-700">
          Booking reference: <strong>{booking.bookingReference}</strong>
        </p>
        <p className="mt-1 text-xs capitalize text-slate-600">
          {booking.bookingStatus ? `${booking.bookingStatus} booking` : ""}
          {booking.bookingDate || booking.createdAt
            ? ` · Booked ${formatTravelDate(booking.bookingDate || booking.createdAt)}`
            : ""}
        </p>
      </section>

      {booking.passengers?.length ? (
        <section className="mb-7 border-b border-slate-300 pb-5">
          <h3 className="mb-3 text-sm font-bold text-sky-900">
            Passenger Information
          </h3>
          <div className="divide-y divide-slate-200">
            {booking.passengers.map((passenger) => (
              <div
                key={`${passenger.firstName}-${passenger.lastName}`}
                className="grid gap-x-8 gap-y-2 py-3 text-sm sm:grid-cols-2"
              >
                <p>
                  <span className="text-slate-500">Passenger:</span>{" "}
                  <strong>
                    {passenger.firstName} {passenger.lastName}
                  </strong>
                </p>
                <p>
                  <span className="text-slate-500">Type:</span>{" "}
                  {passenger.passengerType}
                </p>
                {passenger.email ? (
                  <p>
                    <span className="text-slate-500">Email:</span>{" "}
                    {passenger.email}
                  </p>
                ) : null}
                {passenger.phone ? (
                  <p>
                    <span className="text-slate-500">Phone:</span>{" "}
                    {passenger.phone}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {booking.flightSegments?.length ? (
        <section className="mb-7">
          <h3 className="mb-2 text-sm font-bold text-sky-900">
            Flight Itinerary
          </h3>
          <div>
            {booking.flightSegments.map((segment, index) => (
              <div
                key={`${segment.flightNumber}-${index}`}
                className="border-b border-slate-300 py-4 last:border-b-0"
              >
                <h4 className="mb-3 text-base font-bold text-sky-900">
                  {index === 0
                    ? "Depart"
                    : index === 1 && booking.tripType === "return"
                      ? "Return"
                      : `Flight ${index + 1}`}{" "}
                  {formatTravelDate(segment.departureDate)}
                </h4>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <p className="font-medium text-slate-800">
                    {segment.airline} · Flight {segment.flightNumber}
                    {segment.aircraftType
                      ? ` | Aircraft: ${segment.aircraftType}`
                      : ""}
                  </p>
                  {segment.airlineConfirmation ? (
                    <p className="text-xs">
                      Airline Confirmation:{" "}
                      <strong>{segment.airlineConfirmation}</strong>
                    </p>
                  ) : null}
                </div>
                <div className="grid items-start gap-4 sm:grid-cols-[1fr_auto_1fr]">
                  <div>
                    <p className="text-xl font-bold text-slate-900">
                      {segment.departureAirport}
                    </p>
                    <p className="font-semibold">{segment.departureTime}</p>
                    <p className="text-sm">
                      {formatTravelDate(segment.departureDate)}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {segment.departureCity}
                    </p>
                    {segment.terminal ? (
                      <p className="text-xs text-slate-600">
                        Terminal {segment.terminal}
                        {segment.gate ? ` · Gate ${segment.gate}` : ""}
                      </p>
                    ) : null}
                  </div>
                  <div className="min-w-24 pt-2 text-center text-xs text-slate-600">
                    <p>{segment.duration}</p>
                    <div className="my-2 border-t border-slate-300" />
                    {segment.stops ? <p>{segment.stops}</p> : null}
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xl font-bold text-slate-900">
                      {segment.arrivalAirport}
                    </p>
                    <p className="font-semibold">{segment.arrivalTime}</p>
                    <p className="text-sm">
                      {formatTravelDate(segment.arrivalDate)}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {segment.arrivalCity}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-600">
                  {segment.cabinClass ? (
                    <p>
                      <strong>Cabin:</strong> {segment.cabinClass}
                    </p>
                  ) : null}
                  {segment.brandName ? (
                    <p>
                      <strong>Brand Name:</strong> {segment.brandName}
                    </p>
                  ) : null}
                  {segment.seatAssignments?.length ? (
                    <p>
                      <strong>Seat:</strong>{" "}
                      {segment.seatAssignments
                        .map(
                          (seat) => `${seat.passengerName}: ${seat.seatNumber}`,
                        )
                        .join(", ")}
                    </p>
                  ) : null}
                  {segment.baggageAllowance ? (
                    <p>
                      <strong>Baggage:</strong> {segment.baggageAllowance}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {booking.paymentDetails?.totalAmount !== undefined ? (
        <section className="mb-7 border-t border-slate-300 pt-4">
          <h3 className="mb-3 text-sm font-bold text-sky-900">Price Details</h3>
          <div className="max-w-md space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Ticket price</span>
              <span>
                {formatFare(
                  booking.paymentDetails.ticketPrice,
                  booking.paymentDetails.currency,
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Taxes</span>
              <span>
                {formatFare(
                  booking.paymentDetails.taxes,
                  booking.paymentDetails.currency,
                )}
              </span>
            </div>
            {booking.paymentDetails.additionalCharges !== undefined ? (
              <div className="flex justify-between">
                <span>Additional charges</span>
                <span>
                  {formatFare(
                    booking.paymentDetails.additionalCharges,
                    booking.paymentDetails.currency,
                  )}
                </span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-slate-300 pt-2 font-bold">
              <span>Total</span>
              <span>
                {formatFare(
                  booking.paymentDetails.totalAmount,
                  booking.paymentDetails.currency,
                )}
              </span>
            </div>
          </div>
        </section>
      ) : null}

      {booking.importantNotices?.length ||
      booking.baggageInformation?.length ? (
        <section className="border-t border-slate-300 pt-4">
          {booking.importantNotices?.length ? (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-sky-900">
                Important Information
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {booking.importantNotices.map((notice: string) => (
                  <li key={notice}>{notice}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {booking.baggageInformation?.length ? (
            <div>
              <h3 className="text-sm font-bold text-sky-900">
                Baggage Information
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {booking.baggageInformation.map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      <footer className="mt-7 border-t border-slate-300 pt-3 text-xs text-slate-500 print:mt-4">
        Keep this acknowledgement with your travel documents.
      </footer>
    </article>
  );
}
