"use client";

import { useEffect, useState } from "react";

type Weather = {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
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
  if (code === 0) return "☀️";
  if ([1, 2].includes(code)) return "🌤️";
  if (code === 3) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "🌧️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌡️";
}

export default function Home() {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState<Weather | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedNotes = localStorage.getItem("f1-dashboard-notes");

    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("f1-dashboard-notes", notes);
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
          apparentTemperature: data.current.apparent_temperature,
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          weatherCode: data.current.weather_code
        });
      } catch {
        setWeather(null);
      }
    }

    loadWeather();

    const weatherTimer = setInterval(loadWeather, 15 * 60 * 1000);

    return () => clearInterval(weatherTimer);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secondAngle = seconds * 6;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const hourAngle = (hours % 12) * 30 + minutes * 0.5;

  const digitalTime = time.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const date = time.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  const day = time.toLocaleDateString("en-IN", {
    weekday: "long"
  });

  return (
    <>
      <div className="rotate-message">
        ROTATE YOUR PHONE<br />
        FOR THE FULL F1 DASHBOARD
      </div>

      <main className="dashboard">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark" />

            <div>
              <div className="brand-title">F1 DASHBOARD</div>
              <div className="brand-subtitle">
                PERSONAL RACE CONTROL
              </div>
            </div>
          </div>

          <div className="status">
            <span className="status-dot" />
            SYSTEM ONLINE
          </div>
        </header>

        <section className="main">
          <section className="card clock-card">
            <div className="section-label">LOCAL TIME</div>

            <div className="clock">
              {Array.from({ length: 12 }).map((_, index) => (
                <span
                  key={index}
                  className="tick"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${
                      index * 30
                    }deg)`
                  }}
                />
              ))}

              <div
                className="hand hour-hand"
                style={{
                  transform: `translateX(-50%) rotate(${hourAngle}deg)`
                }}
              />

              <div
                className="hand minute-hand"
                style={{
                  transform: `translateX(-50%) rotate(${minuteAngle}deg)`
                }}
              />

              <div
                className="hand second-hand"
                style={{
                  transform: `translateX(-50%) rotate(${secondAngle}deg)`
                }}
              />

              <div className="digital-time">{digitalTime}</div>

              <div className="clock-center" />
            </div>

            <div className="clock-footer">
              <div className="date">{date}</div>
              <div className="day">{day.toUpperCase()}</div>
            </div>
          </section>

          <section className="middle">
            <section className="card weather-card">
              <div className="section-label">LIVE WEATHER</div>

              <div className="weather-main">
                {weather ? (
                  <>
                    <div className="weather-icon">
                      {weatherIcon(weather.weatherCode)}
                    </div>

                    <div className="temperature">
                      {Math.round(weather.temperature)}°
                    </div>

                    <div className="weather-description">
                      {weatherDescription(weather.weatherCode)}
                    </div>

                    <div className="location">
                      NEW DELHI • INDIA
                    </div>

                    <div className="stats">
                      <div className="stat">
                        <div className="stat-label">FEELS LIKE</div>
                        <div className="stat-value">
                          {Math.round(weather.apparentTemperature)}°
                        </div>
                      </div>

                      <div className="stat">
                        <div className="stat-label">HUMIDITY</div>
                        <div className="stat-value">
                          {weather.humidity}%
                        </div>
                      </div>

                      <div className="stat">
                        <div className="stat-label">WIND</div>
                        <div className="stat-value">
                          {Math.round(weather.windSpeed)} KM/H
                        </div>
                      </div>

                      <div className="stat">
                        <div className="stat-label">UPDATED</div>
                        <div className="stat-value">LIVE</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="weather-icon">🌡️</div>
                    <div className="weather-description">
                      LOADING WEATHER
                    </div>
                  </>
                )}
              </div>
            </section>

            <section className="card notes-card">
              <div className="section-label">PERSONAL</div>

              <div className="notes-title">NOTES</div>

              <textarea
                className="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Write something..."
                aria-label="Personal notes"
              />

              <div className="save-indicator">
                AUTO-SAVED LOCALLY
              </div>
            </section>
          </section>

          <section className="card side-card">
            <div className="section-label">RACE CONTROL</div>

            <div className="side-heading">STATUS</div>

            <div className="racing-line" />

            <div className="info-row">
              <span className="info-key">MODE</span>
              <span className="info-value">HOME</span>
            </div>

            <div className="info-row">
              <span className="info-key">CLOCK</span>
              <span className="info-value">SYNCED</span>
            </div>

            <div className="info-row">
              <span className="info-key">WEATHER</span>
              <span className="info-value">
                {weather ? "LIVE" : "LOADING"}
              </span>
            </div>

            <div className="info-row">
              <span className="info-key">NOTES</span>
              <span className="info-value">
                {notes.trim() ? "ACTIVE" : "EMPTY"}
              </span>
            </div>

            <div className="info-row">
              <span className="info-key">SYSTEM</span>
              <span className="info-value">READY</span>
            </div>
          </section>
        </section>
      </main>
    </>
  );
}
