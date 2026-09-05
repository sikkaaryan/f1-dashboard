"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Weather = {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
};

type Note = {
  id: number;
  text: string;
  done: boolean;
};

function weatherDescription(code: number) {
  if (code === 0) return "Clear";
  if ([1, 2].includes(code)) return "Partly Cloudy";
  if (code === 3) return "Cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67].includes(code)) return "Rain";
  if ([71, 73, 75, 77].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Rain Showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Unknown";
}

/* Proper visual weather icon instead of emoji */
function WeatherIcon({ code }: { code: number }) {
  if (code === 0) {
    return (
      <svg
        className="weather-svg"
        viewBox="0 0 80 80"
        aria-hidden="true"
      >
        <circle
          cx="40"
          cy="40"
          r="17"
          fill="#f6c744"
        />

        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={i}
            x1="40"
            y1="5"
            x2="40"
            y2="15"
            transform={`rotate(${i * 45} 40 40)`}
            stroke="#f6c744"
            strokeWidth="4"
            strokeLinecap="round"
          />
        ))}
      </svg>
    );
  }

  if ([1, 2].includes(code)) {
    return (
      <svg
        className="weather-svg"
        viewBox="0 0 100 80"
        aria-hidden="true"
      >
        <circle
          cx="35"
          cy="30"
          r="18"
          fill="#f6c744"
        />

        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={i}
            x1="35"
            y1="3"
            x2="35"
            y2="11"
            transform={`rotate(${i * 45} 35 30)`}
            stroke="#f6c744"
            strokeWidth="3"
            strokeLinecap="round"
          />
        ))}

        <path
          d="M25 61
             C25 51 33 44 43 44
             C47 35 56 31 66 31
             C79 31 89 41 89 53
             C96 54 100 59 100 66
             C100 73 94 77 87 77
             H35
             C29 77 25 70 25 61Z"
          fill="#e9eaec"
        />
      </svg>
    );
  }

  if (code === 3 || [45, 48].includes(code)) {
    return (
      <svg
        className="weather-svg"
        viewBox="0 0 100 80"
        aria-hidden="true"
      >
        <path
          d="M18 55
             C18 45 26 38 36 38
             C40 29 49 24 59 24
             C72 24 82 34 82 46
             C91 47 97 52 97 60
             C97 68 91 73 83 73
             H28
             C22 73 18 66 18 55Z"
          fill="#d9dcdf"
        />

        <line
          x1="12"
          y1="24"
          x2="35"
          y2="24"
          stroke="#8d9298"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <line
          x1="5"
          y1="34"
          x2="25"
          y2="34"
          stroke="#8d9298"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (
    [51, 53, 55, 56, 57].includes(code)
  ) {
    return (
      <svg
        className="weather-svg"
        viewBox="0 0 100 90"
        aria-hidden="true"
      >
        <path
          d="M15 48
             C15 38 23 31 33 31
             C37 22 46 17 56 17
             C69 17 79 27 79 39
             C88 40 94 45 94 53
             C94 61 88 66 80 66
             H25
             C19 66 15 59 15 48Z"
          fill="#d8dbde"
        />

        <line
          x1="30"
          y1="73"
          x2="25"
          y2="86"
          stroke="#76a9df"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <line
          x1="50"
          y1="73"
          x2="45"
          y2="86"
          stroke="#76a9df"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <line
          x1="70"
          y1="73"
          x2="65"
          y2="86"
          stroke="#76a9df"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (
    [61, 63, 65, 66, 67, 80, 81, 82].includes(code)
  ) {
    return (
      <svg
        className="weather-svg"
        viewBox="0 0 100 90"
        aria-hidden="true"
      >
        <path
          d="M12 48
             C12 38 20 31 30 31
             C34 22 43 17 53 17
             C66 17 76 27 76 39
             C85 40 92 45 92 53
             C92 61 86 66 78 66
             H22
             C16 66 12 59 12 48Z"
          fill="#d8dbde"
        />

        <line
          x1="27"
          y1="72"
          x2="22"
          y2="87"
          stroke="#5f9bd8"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <line
          x1="48"
          y1="72"
          x2="43"
          y2="87"
          stroke="#5f9bd8"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <line
          x1="69"
          y1="72"
          x2="64"
          y2="87"
          stroke="#5f9bd8"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if ([95, 96, 99].includes(code)) {
    return (
      <svg
        className="weather-svg"
        viewBox="0 0 100 90"
        aria-hidden="true"
      >
        <path
          d="M12 48
             C12 38 20 31 30 31
             C34 22 43 17 53 17
             C66 17 76 27 76 39
             C85 40 92 45 92 53
             C92 61 86 66 78 66
             H22
             C16 66 12 59 12 48Z"
          fill="#bfc3c7"
        />

        <path
          d="M53 38 L43 57 H53 L47 76 L65 53 H55 L64 38 Z"
          fill="#f6c744"
        />
      </svg>
    );
  }

  return (
    <svg
      className="weather-svg"
      viewBox="0 0 80 80"
      aria-hidden="true"
    >
      <circle
        cx="40"
        cy="40"
        r="25"
        fill="none"
        stroke="#d8dbde"
        strokeWidth="5"
      />

      <line
        x1="40"
        y1="10"
        x2="40"
        y2="70"
        stroke="#d8dbde"
        strokeWidth="5"
      />
    </svg>
  );
}

const EMPTY_NOTES: Note[] = [];

export default function Home() {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] =
    useState<Weather | null>(null);
  const [notes, setNotes] =
    useState<Note[]>(EMPTY_NOTES);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const migrationKey =
      "f1-dashboard-notes-v2-cleared";

    const alreadyCleared =
      localStorage.getItem(migrationKey);

    if (!alreadyCleared) {
      localStorage.removeItem(
        "f1-dashboard-notes"
      );

      localStorage.setItem(
        migrationKey,
        "true"
      );

      setNotes([]);
      return;
    }

    const savedNotes =
      localStorage.getItem(
        "f1-dashboard-notes"
      );

    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes);

        if (Array.isArray(parsed)) {
          setNotes(parsed);
        }
      } catch {
        setNotes([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "f1-dashboard-notes",
      JSON.stringify(notes)
    );
  }, [notes]);

  useEffect(() => {
    async function loadWeather() {
      try {
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.2090&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&timezone=Asia%2FKolkata"
        );

        if (!response.ok) {
          throw new Error(
            "Weather request failed"
          );
        }

        const data = await response.json();

        setWeather({
          temperature:
            data.current.temperature_2m,
          apparentTemperature:
            data.current.apparent_temperature,
          humidity:
            data.current
              .relative_humidity_2m,
          windSpeed:
            data.current.wind_speed_10m,
          weatherCode:
            data.current.weather_code
        });
      } catch {
        setWeather(null);
      }
    }

    loadWeather();

    const weatherTimer = setInterval(
      loadWeather,
      15 * 60 * 1000
    );

    return () =>
      clearInterval(weatherTimer);
  }, []);

  function addNote() {
    const text = newNote.trim();

    if (!text) return;

    setNotes((current) => [
      ...current,
      {
        id: Date.now(),
        text,
        done: false
      }
    ]);

    setNewNote("");
  }

  function toggleNote(id: number) {
    setNotes((current) =>
      current.map((note) =>
        note.id === id
          ? {
              ...note,
              done: !note.done
            }
          : note
      )
    );
  }

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secondAngle = seconds * 6;

  const minuteAngle =
    minutes * 6 + seconds * 0.1;

  const hourAngle =
    (hours % 12) * 30 +
    minutes * 0.5;

  const digitalTime =
    time.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });

  const day = time
    .toLocaleDateString("en-IN", {
      weekday: "long"
    })
    .toUpperCase();

  const date = time
    .toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
    .toUpperCase();

  return (
    <>
      <div className="rotate-message">
        <span className="rotate-icon">
          ↔
        </span>

        ROTATE YOUR PHONE
        <br />
        FOR RACE MODE
      </div>

      <main className="race-dashboard">
        <div className="carbon-overlay" />
        <div className="red-glow red-glow-left" />
        <div className="red-glow red-glow-right" />
        <div className="racing-line-bg" />

        {/* HEADER */}

        <header className="race-header">
          <div className="f1-brand">
            <div className="f1-logo-wrapper">
              <Image
                src="/f1-logo.png"
                alt="F1"
                width={180}
                height={75}
                priority
                className="f1-logo-image"
              />
            </div>

            <div className="brand-divider" />

            <div className="brand-tagline">
              <span>A HIGHER</span>
              <span>GEAR EVERYDAY</span>
            </div>
          </div>

          <div className="driven">
            <span>DRIVEN</span>
            <span>BY A DIFFERENT</span>
            <span>MINDSET</span>

            <div className="driven-mark">
              ◆◆
            </div>
          </div>
        </header>

        {/* LEFT */}

        <section className="left-panel">
          <div className="date-block">
            <div className="big-day">
              {day}
            </div>

            <div className="red-date">
              {date}
            </div>
          </div>

          <div className="quote">
            <span>BETTER</span>
            <span>DRIVERS</span>
            <span>MAKE A</span>
            <span>BETTER</span>
            <span>TOMORROW</span>
          </div>

          <div className="track-decoration">
            <div className="track-line" />
          </div>

          <div className="weather">
            {weather ? (
              <>
                <div className="weather-icon">
                  <WeatherIcon
                    code={weather.weatherCode}
                  />
                </div>

                <div className="weather-content">
                  <div className="weather-temp">
                    {Math.round(
                      weather.temperature
                    )}
                    °C
                  </div>

                  <div className="weather-condition">
                    {weatherDescription(
                      weather.weatherCode
                    )}
                  </div>

                  <div className="weather-location">
                    <span className="location-pin">
                      ●
                    </span>

                    NEW DELHI, INDIA
                  </div>

                  <div className="weather-range">
                    <span className="weather-high">
                      ↑{" "}
                      {Math.round(
                        weather.apparentTemperature
                      )}
                      °
                    </span>

                    <span className="weather-low">
                      ↓{" "}
                      {Math.max(
                        0,
                        Math.round(
                          weather.temperature -
                            5
                        )
                      )}
                      °
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="weather-loading">
                LOADING WEATHER
              </div>
            )}
          </div>
        </section>

        {/* CLOCK */}

        <section className="clock-section">
          <div className="clock-outer-ring">
            <div className="clock">
              {Array.from({
                length: 60
              }).map((_, index) => (
                <span
                  key={`tick-${index}`}
                  className={
                    index % 5 === 0
                      ? "clock-tick major"
                      : "clock-tick"
                  }
                  style={{
                    transform: `rotate(${index * 6}deg)`
                  }}
                />
              ))}

              {Array.from({
                length: 12
              }).map((_, index) => {
                const number =
                  index === 0 ? 12 : index;

                const angle = index * 30;

                const radius = 40;

                const x =
                  50 +
                  radius *
                    Math.sin(
                      (angle * Math.PI) /
                        180
                    );

                const y =
                  50 -
                  radius *
                    Math.cos(
                      (angle * Math.PI) /
                        180
                    );

                return (
                  <span
                    key={`number-${number}`}
                    className="clock-number"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`
                    }}
                  >
                    {number}
                  </span>
                );
              })}

              <div
                className="hand hour-hand"
                style={{
                  transform: `
                    translateX(-50%)
                    rotate(${hourAngle}deg)
                  `
                }}
              />

              <div
                className="hand minute-hand"
                style={{
                  transform: `
                    translateX(-50%)
                    rotate(${minuteAngle}deg)
                  `
                }}
              />

              <div
                className="hand second-hand"
                style={{
                  transform: `
                    translateX(-50%)
                    rotate(${secondAngle}deg)
                  `
                }}
              />

              <div className="clock-logo">
                <Image
                  src="/f1-logo.png"
                  alt="F1"
                  width={82}
                  height={35}
                  priority
                  className="f1-clock-logo"
                />

                <div className="clock-logo-text">
                  TIME DRIVES
                  <br />
                  PASSION
                </div>
              </div>

              <div className="digital-clock">
                {digitalTime}
              </div>

              <div className="clock-center">
                <div className="clock-center-dot" />
              </div>
            </div>
          </div>

          {/* FIXED BOTTOM CENTER LAYOUT */}

          <div className="clock-bottom">
            <div className="clock-bottom-row">
              <span className="bottom-line" />

              <span>
                LIFE IS BETTER IN
              </span>

              <span className="bottom-line" />
            </div>

            <strong>RACE MODE</strong>
          </div>
        </section>

        {/* NOTES */}

        <section className="notes-panel">
          <div className="notes-header">
            <h2>Notes</h2>

            <button
              className="add-button"
              onClick={() => {
                document
                  .querySelector<HTMLInputElement>(
                    ".note-input"
                  )
                  ?.focus();
              }}
              aria-label="Add note"
            >
              +
            </button>
          </div>

          <div className="notes-list">
            {notes.map((note) => (
              <button
                key={note.id}
                className={`note-item ${
                  note.done
                    ? "completed"
                    : ""
                }`}
                onClick={() =>
                  toggleNote(note.id)
                }
              >
                <span className="checkbox">
                  {note.done ? "✓" : ""}
                </span>

                <span className="note-text">
                  {note.text}
                </span>
              </button>
            ))}
          </div>

          <div className="note-input-row">
            <input
              className="note-input"
              value={newNote}
              onChange={(event) =>
                setNewNote(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter"
                ) {
                  addNote();
                }
              }}
              placeholder="Add a note..."
              aria-label="Add a note"
            />

            <button
              className="note-submit"
              onClick={addNote}
              aria-label="Add note"
            >
              →
            </button>
          </div>
        </section>

        {/* BOTTOM RIGHT */}

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
      </main>
    </>
  );
}
