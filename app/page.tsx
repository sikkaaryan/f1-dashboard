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
  if ([1, 2, 3].includes(code)) return "Partly Cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67].includes(code)) return "Rain";
  if ([71, 73, 75, 77].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Rain Showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Unknown";
}

function weatherIcon(code: number) {
  if (code === 0) return "☀";
  if ([1, 2].includes(code)) return "◐";
  if (code === 3) return "☁";
  if ([45, 48].includes(code)) return "≋";
  if ([51, 53, 55, 56, 57].includes(code)) return "◌";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "☂";
  if ([95, 96, 99].includes(code)) return "ϟ";
  return "°";
}

const EMPTY_NOTES: Note[] = [];

export default function Home() {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState<Weather | null>(null);
  const [notes, setNotes] = useState<Note[]>(EMPTY_NOTES);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const migrationKey = "f1-dashboard-notes-v2-cleared";
    const alreadyCleared = localStorage.getItem(migrationKey);

    if (!alreadyCleared) {
      localStorage.removeItem("f1-dashboard-notes");
      localStorage.setItem(migrationKey, "true");
      setNotes([]);
      return;
    }

    const savedNotes = localStorage.getItem("f1-dashboard-notes");

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
          throw new Error("Weather request failed");
        }

        const data = await response.json();

        setWeather({
          temperature: data.current.temperature_2m,
          apparentTemperature:
            data.current.apparent_temperature,
          humidity:
            data.current.relative_humidity_2m,
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

    return () => clearInterval(weatherTimer);
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
    (hours % 12) * 30 + minutes * 0.5;

  const digitalTime = time.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    }
  );

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
        <span className="rotate-icon">↔</span>
        ROTATE YOUR PHONE
        <br />
        FOR RACE MODE
      </div>

      <main className="race-dashboard">
        <div className="carbon-overlay" />
        <div className="red-glow red-glow-left" />
        <div className="red-glow red-glow-right" />
        <div className="racing-line-bg" />

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
                  {weatherIcon(
                    weather.weatherCode
                  )}
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
                          weather.temperature - 5
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
                      (angle * Math.PI) / 180
                    );

                const y =
                  50 -
                  radius *
                    Math.cos(
                      (angle * Math.PI) / 180
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

          <div className="clock-bottom">
            <span className="bottom-line" />

            <span>
              LIFE IS BETTER IN
            </span>

            <strong>
              RACE MODE
            </strong>

            <span className="bottom-line" />
          </div>
        </section>

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
                if (event.key === "Enter") {
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

        <div className="bottom-message">
          <span>SOME PEOPLE</span>
          <span>WATCH RACES.</span>
          <span>WE FEEL THEM.</span>
        </div>

        <div className="race-mode-label">
          <span>///</span>
          STILL
          <br />
          WE RISE
        </div>
      </main>
    </>
  );
}
