"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type WeatherData = {
  temperature: number;
  weatherCode: number;
  high: number;
  low: number;
};

type F1Meeting = {
  meeting_key: number;
  meeting_name: string;
  circuit_short_name: string;
  country_name: string;
  country_code: string;
  location: string;
  date_start: string;
  date_end: string;
  gmt_offset: string;
  is_cancelled: boolean;
};

type F1Session = {
  session_key: number;
  meeting_key: number;
  circuit_short_name: string;
  country_name: string;
  country_code: string;
  location: string;
  date_start: string;
  date_end: string;
  gmt_offset: string;
  session_name: string;
  session_type: string;
};

const COUNTRY_FLAGS: Record<string, string> = {
  Australia: "🇦🇺",
  China: "🇨🇳",
  Japan: "🇯🇵",
  Bahrain: "🇧🇭",
  "Saudi Arabia": "🇸🇦",
  "United States": "🇺🇸",
  Canada: "🇨🇦",
  Monaco: "🇲🇨",
  Spain: "🇪🇸",
  Austria: "🇦🇹",
  "Great Britain": "🇬🇧",
  Belgium: "🇧🇪",
  Hungary: "🇭🇺",
  Netherlands: "🇳🇱",
  Italy: "🇮🇹",
  Azerbaijan: "🇦🇿",
  Singapore: "🇸🇬",
  Mexico: "🇲🇽",
  Brazil: "🇧🇷",
  Qatar: "🇶🇦",
  "Abu Dhabi": "🇦🇪"
};

function formatIndiaTime(dateString: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(dateString));
}

function formatIndiaDate(dateString: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short"
  }).format(new Date(dateString));
}

function formatIndiaDay(dateString: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "2-digit",
    month: "short"
  }).format(new Date(dateString));
}

function sessionLabel(session: F1Session) {
  const name = session.session_name.toLowerCase();

  if (name === "practice 1") return "FP1";
  if (name === "practice 2") return "FP2";
  if (name === "practice 3") return "FP3";
  if (name === "sprint qualifying") return "SPRINT QUALI";
  if (name === "sprint") return "SPRINT";
  if (name === "qualifying") return "QUALIFYING";
  if (name === "race") return "RACE";

  return session.session_name.toUpperCase();
}

function sessionStatus(
  session: F1Session,
  currentTime: number
): "DONE" | "LIVE" | "NEXT" {
  const start = new Date(session.date_start).getTime();
  const end = new Date(session.date_end).getTime();

  if (currentTime >= start && currentTime <= end) {
    return "LIVE";
  }

  if (currentTime > end) {
    return "DONE";
  }

  return "NEXT";
}

function WeatherIcon({ code }: { code: number }) {
  if (code === 0) {
    return (
      <svg className="weather-svg" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="13" fill="#f1f2f3" />
        <g
          stroke="#f1f2f3"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <path d="M32 5v9" />
          <path d="M32 50v9" />
          <path d="M5 32h9" />
          <path d="M50 32h9" />
          <path d="M13 13l6 6" />
          <path d="M45 45l6 6" />
          <path d="M51 13l-6 6" />
          <path d="M19 45l-6 6" />
        </g>
      </svg>
    );
  }

  if (code === 1 || code === 2) {
    return (
      <svg className="weather-svg" viewBox="0 0 64 64">
        <circle cx="25" cy="23" r="12" fill="#f1f2f3" />

        <g
          stroke="#f1f2f3"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M25 5v7" />
          <path d="M8 23h7" />
          <path d="M13 11l5 5" />
        </g>

        <path
          d="M17 45h31c6 0 10-4 10-9s-4-10-10-10c-1 0-3 0-4 .5C42 21 37 18 31 18c-8 0-14 6-14 14h0c-5 0-9 3-9 7s4 6 9 6Z"
          fill="none"
          stroke="#cfd1d4"
          strokeWidth="3"
        />
      </svg>
    );
  }

  if ([3, 45, 48].includes(code)) {
    return (
      <svg className="weather-svg" viewBox="0 0 64 64">
        <path
          d="M12 27h40M8 37h48M15 47h34"
          stroke="#cfd1d4"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return (
      <svg className="weather-svg" viewBox="0 0 64 64">
        <path
          d="M16 35h32c5 0 9-4 9-9s-4-9-9-9c-1 0-2 0-3 .4C42 12 37 9 31 9c-8 0-14 6-14 14-5 0-9 4-9 9s4 9 8 9Z"
          fill="none"
          stroke="#cfd1d4"
          strokeWidth="3"
        />

        <g
          stroke="#f1f2f3"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M22 43v8" />
          <path d="M32 43v8" />
          <path d="M42 43v8" />
        </g>
      </svg>
    );
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return (
      <svg className="weather-svg" viewBox="0 0 64 64">
        <path
          d="M16 33h32c5 0 9-4 9-9s-4-9-9-9c-1 0-2 0-3 .4C42 10 37 7 31 7c-8 0-14 6-14 14-5 0-9 4-9 9s4 9 8 9Z"
          fill="none"
          stroke="#cfd1d4"
          strokeWidth="3"
        />

        <g
          stroke="#f1f2f3"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <path d="M20 42l-3 9" />
          <path d="M32 42l-3 9" />
          <path d="M44 42l-3 9" />
        </g>
      </svg>
    );
  }

  return (
    <svg className="weather-svg" viewBox="0 0 64 64">
      <path
        d="M16 33h32c5 0 9-4 9-9s-4-9-9-9c-1 0-2 0-3 .4C42 10 37 7 31 7c-8 0-14 6-14 14-5 0-9 4-9 9s4 9 8 9Z"
        fill="none"
        stroke="#cfd1d4"
        strokeWidth="3"
      />

      <path
        d="M34 39l-8 12h7l-3 10 9-14h-7l8-8Z"
        fill="#e10600"
      />
    </svg>
  );
}

function weatherText(code: number) {
  if (code === 0) return "CLEAR";
  if ([1, 2].includes(code)) return "PARTLY CLOUDY";
  if ([3, 45, 48].includes(code)) return "CLOUDY";
  if ([51, 53, 55, 56, 57].includes(code)) return "DRIZZLE";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return "RAIN";
  }
  if ([95, 96, 99].includes(code)) return "STORM";

  return "CLEAR";
}

export default function Home() {
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [meetings, setMeetings] = useState<F1Meeting[]>([]);
  const [sessions, setSessions] = useState<F1Session[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadWeather() {
      try {
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.2090&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FKolkata",
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Weather request failed");
        }

        const data = await response.json();

        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          weatherCode: data.current.weather_code,
          high: Math.round(data.daily.temperature_2m_max[0]),
          low: Math.round(data.daily.temperature_2m_min[0])
        });
      } catch {
        setWeather(null);
      }
    }

    loadWeather();

    const timer = window.setInterval(
      loadWeather,
      15 * 60 * 1000
    );

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadF1() {
      try {
        setScheduleLoading(true);

        const [meetingsResponse, sessionsResponse] =
          await Promise.all([
            fetch(
              "https://api.openf1.org/v1/meetings?year=2026",
              { cache: "no-store" }
            ),
            fetch(
              "https://api.openf1.org/v1/sessions?year=2026",
              { cache: "no-store" }
            )
          ]);

        if (
          !meetingsResponse.ok ||
          !sessionsResponse.ok
        ) {
          throw new Error("F1 API request failed");
        }

        const meetingsData =
          (await meetingsResponse.json()) as F1Meeting[];

        const sessionsData =
          (await sessionsResponse.json()) as F1Session[];

        const validMeetings = meetingsData
          .filter(
            (meeting) =>
              !meeting.is_cancelled &&
              meeting.country_name !== "Testing"
          )
          .sort(
            (a, b) =>
              new Date(a.date_start).getTime() -
              new Date(b.date_start).getTime()
          );

        const validSessions = sessionsData
          .filter(
            (session) =>
              session.country_name !== "Testing" &&
              !session.session_name
                .toLowerCase()
                .includes("testing")
          )
          .sort(
            (a, b) =>
              new Date(a.date_start).getTime() -
              new Date(b.date_start).getTime()
          );

        setMeetings(validMeetings);
        setSessions(validSessions);
      } catch {
        setMeetings([]);
        setSessions([]);
      } finally {
        setScheduleLoading(false);
      }
    }

    loadF1();

    const timer = window.setInterval(
      loadF1,
      15 * 60 * 1000
    );

    return () => window.clearInterval(timer);
  }, []);

  const clock = useMemo(() => {
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    return {
      hourAngle:
        ((hours % 12) + minutes / 60) * 30,

      minuteAngle:
        (minutes + seconds / 60) * 6,

      secondAngle:
        seconds * 6,

      digital: now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      })
    };
  }, [now]);

  const dateInfo = useMemo(() => {
    return {
      day: now
        .toLocaleDateString("en-IN", {
          weekday: "long"
        })
        .toUpperCase(),

      date: now
        .toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        })
        .toUpperCase()
    };
  }, [now]);

  const schedule = useMemo(() => {
    if (!meetings.length || !sessions.length) {
      return null;
    }

    const currentTime = now.getTime();

    const upcomingMeeting =
      meetings.find(
        (meeting) =>
          new Date(meeting.date_end).getTime() >=
          currentTime
      ) ?? null;

    if (!upcomingMeeting) {
      return null;
    }

    const meetingSessions = sessions
      .filter(
        (session) =>
          session.meeting_key ===
          upcomingMeeting.meeting_key
      )
      .sort(
        (a, b) =>
          new Date(a.date_start).getTime() -
          new Date(b.date_start).getTime()
      );

    const meetingIndex = meetings.findIndex(
      (meeting) =>
        meeting.meeting_key ===
        upcomingMeeting.meeting_key
    );

    const round =
      meetingIndex >= 0
        ? meetingIndex + 1
        : null;

    const currentSession =
      meetingSessions.find((session) => {
        const start =
          new Date(session.date_start).getTime();

        const end =
          new Date(session.date_end).getTime();

        return (
          currentTime >= start &&
          currentTime <= end
        );
      }) ?? null;

    const nextSession =
      meetingSessions.find(
        (session) =>
          new Date(session.date_start).getTime() >
          currentTime
      ) ?? null;

    const nextRace =
      sessions.find(
        (session) =>
          session.session_name.toLowerCase() ===
            "race" &&
          new Date(session.date_start).getTime() >
            currentTime
      ) ?? null;

    const nextRaceMeeting = nextRace
      ? meetings.find(
          (meeting) =>
            meeting.meeting_key ===
            nextRace.meeting_key
        )
      : null;

    return {
      meeting: upcomingMeeting,
      round,
      sessions: meetingSessions,
      currentSession,
      nextSession,
      nextRace,
      nextRaceMeeting
    };
  }, [meetings, sessions, now]);

  const analogTicks = Array.from({ length: 60 });

  return (
    <main className="dashboard">

      <header className="top-header">

        <div className="brand">

          <Image
            src="/f1-logo.png"
            alt="F1"
            width={150}
            height={63}
            priority
            className="f1-logo"
          />

          <span className="header-divider" />

          <div className="header-copy">
            <span>A HIGHER</span>
            <span>GEAR EVERYDAY</span>
          </div>

        </div>

        <div className="header-right">

          <div className="header-right-copy">
            <span>DRIVEN</span>
            <span>BY A DIFFERENT</span>
            <span>MINDSET</span>
          </div>

          <div className="header-mark">
            <span />
            <span />
            <span />
          </div>

        </div>

      </header>

      <section className="left-panel">

        <div className="day-block">
          <h1>{dateInfo.day}</h1>
          <div>{dateInfo.date}</div>
        </div>

        <div className="quote">
          <span>BETTER</span>
          <span>DRIVERS</span>
          <span>MAKE A</span>
          <span>BETTER</span>
          <span>TOMORROW</span>
        </div>

        <div className="weather">

          {weather ? (
            <>
              <div className="weather-icon">
                <WeatherIcon
                  code={weather.weatherCode}
                />
              </div>

              <div className="weather-copy">

                <div className="weather-temp">
                  {weather.temperature}°C
                </div>

                <div className="weather-condition">
                  {weatherText(
                    weather.weatherCode
                  )}
                </div>

                <div className="weather-location">
                  NEW DELHI, INDIA
                </div>

                <div className="weather-range">
                  <span>
                    ↑ {weather.high}°
                  </span>
                  <span>
                    ↓ {weather.low}°
                  </span>
                </div>

              </div>
            </>
          ) : (
            <div className="weather-condition">
              WEATHER UNAVAILABLE
            </div>
          )}

        </div>

      </section>

      <section className="clock-section">

        <div className="clock-face">

          <div className="clock-ring clock-ring-outer" />
          <div className="clock-ring clock-ring-inner" />

          {analogTicks.map((_, index) => {

            const angle = index * 6;
            const major = index % 5 === 0;

            return (
              <span
                key={index}
                className={`clock-tick ${
                  major
                    ? "clock-tick-major"
                    : ""
                }`}
                style={{
                  transform:
                    `rotate(${angle}deg)`
                }}
              />
            );

          })}

          <div className="clock-numbers">

            {[
              12, 1, 2, 3, 4, 5,
              6, 7, 8, 9, 10, 11
            ].map((number) => {

              const angle = number * 30;

              return (
                <span
                  key={number}
                  style={{
                    transform:
                      `rotate(${angle}deg)`
                  }}
                >
                  <b
                    style={{
                      transform:
                        `rotate(-${angle}deg)`
                    }}
                  >
                    {number}
                  </b>
                </span>
              );

            })}

          </div>

          <div className="clock-logo">

            <Image
              src="/f1-logo.png"
              alt=""
              width={82}
              height={34}
            />

            <span>TIME DRIVES</span>
            <span>PASSION</span>

          </div>

          <div
            className="clock-hand clock-hour"
            style={{
              transform:
                `rotate(${clock.hourAngle}deg)`
            }}
          />

          <div
            className="clock-hand clock-minute"
            style={{
              transform:
                `rotate(${clock.minuteAngle}deg)`
            }}
          />

          <div
            className="clock-hand clock-second"
            style={{
              transform:
                `rotate(${clock.secondAngle}deg)`
            }}
          />

          <div className="clock-center" />

          <div className="digital-time">
            {clock.digital}
          </div>

          <div className="clock-bottom">

            <div className="clock-bottom-row">
              <span className="bottom-line" />
              <span>LIFE IS BETTER IN</span>
              <span className="bottom-line" />
            </div>

            <strong>RACE MODE</strong>

          </div>

        </div>

      </section>

      <aside className="schedule-panel">

        <div className="schedule-header">

          <span>F1 SCHEDULE</span>

          <span className="schedule-live-dot" />

        </div>

        {scheduleLoading ? (

          <div className="schedule-loading">
            LOADING SCHEDULE...
          </div>

        ) : schedule ? (

          <>

            <div className="schedule-round">

              <span>ROUND</span>

              <strong>
                {String(
                  schedule.round ?? "--"
                ).padStart(2, "0")}
              </strong>

            </div>

            <div className="schedule-location">

              <span className="schedule-flag">
                {COUNTRY_FLAGS[
                  schedule.meeting.country_name
                ] ?? "🏁"}
              </span>

              <div>

                <strong>
                  {schedule.meeting.country_name.toUpperCase()}
                </strong>

                <span>
                  {schedule.meeting.circuit_short_name.toUpperCase()}
                </span>

              </div>

            </div>

            <div className="schedule-dates">

              {formatIndiaDate(
                schedule.meeting.date_start
              )}

              {" — "}

              {formatIndiaDate(
                schedule.meeting.date_end
              )}

            </div>

            <div className="session-list">

              {schedule.sessions
                .filter((session) => {

                  const name =
                    session.session_name.toLowerCase();

                  return (
                    name === "practice 1" ||
                    name === "practice 2" ||
                    name === "practice 3" ||
                    name === "sprint" ||
                    name === "sprint qualifying" ||
                    name === "qualifying" ||
                    name === "race"
                  );

                })
                .map((session) => {

                  const status =
                    sessionStatus(
                      session,
                      now.getTime()
                    );

                  return (
                    <div
                      key={session.session_key}
                      className={`session-row session-${status.toLowerCase()}`}
                    >

                      <div className="session-name">

                        {status === "LIVE" && (
                          <span className="session-live-dot" />
                        )}

                        {status === "DONE" && (
                          <span className="session-done">
                            ✓
                          </span>
                        )}

                        {status === "NEXT" && (
                          <span className="session-next">
                            ›
                          </span>
                        )}

                        <span>
                          {sessionLabel(session)}
                        </span>

                      </div>

                      <div className="session-time">
                        {formatIndiaTime(
                          session.date_start
                        )}
                      </div>

                    </div>
                  );

                })}

            </div>

            {schedule.nextRaceMeeting && (
              <div className="next-race">

                <span>NEXT RACE</span>

                <strong>
                  {COUNTRY_FLAGS[
                    schedule.nextRaceMeeting.country_name
                  ] ?? "🏁"}{" "}
                  {schedule.nextRaceMeeting.country_name.toUpperCase()}
                </strong>

                <small>
                  {schedule.nextRaceMeeting.circuit_short_name.toUpperCase()}
                  {" · "}
                  {formatIndiaDay(
                    schedule.nextRaceMeeting.date_start
                  )}
                </small>

              </div>
            )}

            {schedule.currentSession && (
              <div className="schedule-status">

                <span className="status-label">
                  LIVE NOW
                </span>

                <strong>
                  ●{" "}
                  {sessionLabel(
                    schedule.currentSession
                  )}
                </strong>

              </div>
            )}

            {!schedule.currentSession &&
              schedule.nextSession && (
                <div className="schedule-status">

                  <span className="status-label">
                    NEXT
                  </span>

                  <strong>
                    {sessionLabel(
                      schedule.nextSession
                    )}
                  </strong>

                </div>
              )}

          </>

        ) : (

          <div className="schedule-loading">
            SCHEDULE UNAVAILABLE
          </div>

        )}

      </aside>

      <div className="bottom-message">

        <span>SOME PEOPLE</span>
        <span>WATCH RACES.</span>

        <span className="bottom-message-strong">
          WE FEEL THEM.
        </span>

      </div>

      <div className="race-mode-label">
        <span>///</span>
        <span>STILL</span>
        <span>WE RISE</span>
      </div>

      <div className="home-indicator" />

    </main>
  );
}
