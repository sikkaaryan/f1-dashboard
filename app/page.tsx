"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Meeting = {
  meeting_key: number;
  meeting_name: string;
  circuit_short_name: string;
  country_name: string;
  country_code: string;
  location: string;
  date_start: string;
  date_end: string;
  is_cancelled?: boolean;
};

type Session = {
  session_key: number;
  meeting_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
  location: string;
  country_name: string;
  circuit_short_name: string;
};

type Driver = {
  driver_number: number;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
};

type DriverStanding = {
  driver_number: number;
  position_current: number;
  points_current: number;
};

type ConstructorStanding = {
  team_name?: string;
  team_colour?: string;
  position_current: number;
  points_current: number;
};

type Weather = {
  temperature: number;
  code: number;
  high: number;
  low: number;
};

type Position = {
  driver_number: number;
  position: number;
};

type Interval = {
  driver_number: number;
  gap_to_leader?: number | string | null;
  interval?: number | string | null;
};

type Tab = "home" | "standings" | "schedule" | "circuit" | "live" | "settings";
type Mode = "standby" | "interactive";
type BackgroundMode = "auto" | "motion" | "still";

const TABS: { id: Tab; label: string; short: string; icon: string }[] = [
  { id: "home", label: "Cockpit", short: "HOME", icon: "◉" },
  { id: "standings", label: "Standings", short: "STANDINGS", icon: "▤" },
  { id: "schedule", label: "Schedule", short: "SCHEDULE", icon: "▦" },
  { id: "circuit", label: "Circuit", short: "CIRCUIT", icon: "⌁" },
  { id: "live", label: "Live timing", short: "LIVE", icon: "◌" },
  { id: "settings", label: "Settings", short: "SETTINGS", icon: "⚙" }
];

const FLAGS: Record<string, string> = {
  Australia: "🇦🇺", China: "🇨🇳", Japan: "🇯🇵", Bahrain: "🇧🇭",
  "Saudi Arabia": "🇸🇦", "United States": "🇺🇸", Canada: "🇨🇦",
  Monaco: "🇲🇨", Spain: "🇪🇸", Austria: "🇦🇹", "Great Britain": "🇬🇧",
  Belgium: "🇧🇪", Hungary: "🇭🇺", Netherlands: "🇳🇱", Italy: "🇮🇹",
  Azerbaijan: "🇦🇿", Singapore: "🇸🇬", Mexico: "🇲🇽", Brazil: "🇧🇷",
  Qatar: "🇶🇦", "United Arab Emirates": "🇦🇪", "Abu Dhabi": "🇦🇪"
};

const INDIA_TZ = "Asia/Kolkata";

function dateTime(value: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-IN", { ...options, timeZone: INDIA_TZ }).format(new Date(value));
}

function sessionShort(name: string) {
  const n = name.toLowerCase();
  if (n === "practice 1") return "FP1";
  if (n === "practice 2") return "FP2";
  if (n === "practice 3") return "FP3";
  if (n === "sprint qualifying") return "SPRINT QUALI";
  if (n === "qualifying") return "QUALIFYING";
  if (n === "sprint") return "SPRINT";
  if (n === "race") return "RACE";
  return name.toUpperCase();
}

function weatherLabel(code: number) {
  if (code === 0) return "CLEAR SKY";
  if ([1, 2].includes(code)) return "PARTLY CLOUDY";
  if ([3, 45, 48].includes(code)) return "CLOUDY";
  if ([51, 53, 55, 56, 57].includes(code)) return "DRIZZLE";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "RAIN";
  if ([95, 96, 99].includes(code)) return "THUNDERSTORM";
  return "CONDITIONS";
}

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

function AnalogClock({ now, compact = false }: { now: Date; compact?: boolean }) {
  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours() % 12;
  const hourAngle = hours * 30 + minutes * 0.5;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const secondAngle = seconds * 6;
  return (
    <div className={`analog-clock ${compact ? "analog-clock-compact" : ""}`} aria-label={`Time ${dateTime(now.toISOString(), { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`}>
      <div className="clock-bezel" />
      <div className="clock-inner-ring" />
      {Array.from({ length: 60 }, (_, i) => (
        <span key={i} className={`clock-tick ${i % 5 === 0 ? "clock-tick-major" : ""}`} style={{ transform: `rotate(${i * 6}deg)` }} />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <span key={i} className="clock-number" style={{ transform: `rotate(${i * 30}deg)` }}>
          <b style={{ transform: `rotate(-${i * 30}deg)` }}>{i === 0 ? "12" : i}</b>
        </span>
      ))}
      <div className="clock-brand"><span className="brand-wing">F1</span><small>COCKPIT</small></div>
      <span className="clock-hand clock-hour" style={{ transform: `rotate(${hourAngle}deg)` }} />
      <span className="clock-hand clock-minute" style={{ transform: `rotate(${minuteAngle}deg)` }} />
      <span className="clock-hand clock-second" style={{ transform: `rotate(${secondAngle}deg)` }} />
      <span className="clock-pivot" />
      <div className="clock-digital">{dateTime(now.toISOString(), { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}</div>
    </div>
  );
}

function PanelTitle({ eyebrow, title, right }: { eyebrow: string; title: string; right?: React.ReactNode }) {
  return <div className="panel-title"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{right}</div>;
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="empty-state"><span className="empty-mark">—</span><strong>{title}</strong><p>{detail}</p></div>;
}

export default function Home() {
  const now = useClock();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [mode, setMode] = useState<Mode>("standby");
  const [revealed, setRevealed] = useState(true);
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>("auto");
  const [scene, setScene] = useState(0);
  const [animations, setAnimations] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<ConstructorStanding[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [selectedMeetingKey, setSelectedMeetingKey] = useState<number | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [wakeSupported, setWakeSupported] = useState(false);
  const [wakeActive, setWakeActive] = useState(false);
  const [wakeError, setWakeError] = useState("");
  const [standingsTab, setStandingsTab] = useState<"drivers" | "constructors">("drivers");
  const [scheduleFilter, setScheduleFilter] = useState<"upcoming" | "completed" | "all">("upcoming");
  const [landscapeWarning, setLandscapeWarning] = useState(false);

  const year = now.getFullYear();

  const loadCoreData = useCallback(async () => {
    setDataLoading(true);
    setDataError("");
    try {
      const [meetingResponse, sessionResponse, weatherResponse] = await Promise.all([
        fetch(`https://api.openf1.org/v1/meetings?year=${year}`, { cache: "no-store" }),
        fetch(`https://api.openf1.org/v1/sessions?year=${year}`, { cache: "no-store" }),
        fetch("https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.2090&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FKolkata", { cache: "no-store" })
      ]);
      if (!meetingResponse.ok || !sessionResponse.ok) throw new Error("F1 calendar is temporarily unavailable.");
      const [meetingData, sessionData] = await Promise.all([meetingResponse.json(), sessionResponse.json()]);
      const validMeetings = (meetingData as Meeting[])
        .filter((m) => !m.is_cancelled && !/testing/i.test(m.meeting_name + m.country_name))
        .sort((a, b) => Date.parse(a.date_start) - Date.parse(b.date_start));
      const validSessions = (sessionData as Session[])
        .filter((s) => !/testing/i.test(s.session_name + s.country_name))
        .sort((a, b) => Date.parse(a.date_start) - Date.parse(b.date_start));
      setMeetings(validMeetings);
      setSessions(validSessions);
      if (validMeetings.length) setSelectedMeetingKey((current) => current ?? validMeetings[0].meeting_key);
      if (weatherResponse.ok) {
        const w = await weatherResponse.json();
        setWeather({
          temperature: Math.round(w.current.temperature_2m),
          code: w.current.weather_code,
          high: Math.round(w.daily.temperature_2m_max[0]),
          low: Math.round(w.daily.temperature_2m_min[0])
        });
      }
      setLastUpdated(new Date());
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to load dashboard data.");
    } finally {
      setDataLoading(false);
    }
  }, [year]);

  useEffect(() => {
    void loadCoreData();
    const timer = window.setInterval(() => void loadCoreData(), 15 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [loadCoreData]);

  useEffect(() => {
    let cancelled = false;
    async function loadStandings() {
      const completedRaces = sessions
        .filter((s) => s.session_name.toLowerCase() === "race" && Date.parse(s.date_end) < now.getTime())
        .sort((a, b) => Date.parse(b.date_end) - Date.parse(a.date_end));
      const latest = completedRaces[0];
      if (!latest) {
        setDriverStandings([]);
        setDrivers([]);
        setConstructorStandings([]);
        return;
      }
      try {
        const [standingsResponse, driversResponse, constructorsResponse] = await Promise.all([
          fetch(`https://api.openf1.org/v1/championship_drivers?session_key=${latest.session_key}`, { cache: "no-store" }),
          fetch(`https://api.openf1.org/v1/drivers?session_key=${latest.session_key}`, { cache: "no-store" }),
          fetch(`https://api.openf1.org/v1/championship_teams?session_key=${latest.session_key}`, { cache: "no-store" })
        ]);
        if (!standingsResponse.ok || !driversResponse.ok) throw new Error("Standings unavailable");
        const [standingData, driverData, constructorData] = await Promise.all([
          standingsResponse.json(), driversResponse.json(),
          constructorsResponse.ok ? constructorsResponse.json() : Promise.resolve([])
        ]);
        if (cancelled) return;
        setDriverStandings((standingData as DriverStanding[]).sort((a, b) => a.position_current - b.position_current));
        setDrivers(driverData as Driver[]);
        setConstructorStandings((constructorData as ConstructorStanding[]).sort((a, b) => a.position_current - b.position_current));
      } catch {
        if (!cancelled) {
          setDriverStandings([]);
          setDrivers([]);
          setConstructorStandings([]);
        }
      }
    }
    if (sessions.length) void loadStandings();
    return () => { cancelled = true; };
  }, [sessions, now]);

  const currentSession = useMemo(
    () => sessions.find((s) => Date.parse(s.date_start) <= now.getTime() && Date.parse(s.date_end) >= now.getTime()) ?? null,
    [sessions, now]
  );

  const nextSession = useMemo(
    () => sessions.find((s) => Date.parse(s.date_start) > now.getTime()) ?? null,
    [sessions, now]
  );

  const nextRace = useMemo(
    () => sessions.find((s) => s.session_name.toLowerCase() === "race" && Date.parse(s.date_start) > now.getTime()) ?? null,
    [sessions, now]
  );

  const nextRaceMeeting = nextRace ? meetings.find((m) => m.meeting_key === nextRace.meeting_key) : null;
  const activeMeeting = currentSession
    ? meetings.find((m) => m.meeting_key === currentSession.meeting_key) ?? null
    : nextSession ? meetings.find((m) => m.meeting_key === nextSession.meeting_key) ?? null : null;

  const selectedMeeting = meetings.find((m) => m.meeting_key === selectedMeetingKey) ?? activeMeeting ?? nextRaceMeeting ?? meetings[0] ?? null;
  const selectedSessions = selectedMeeting
    ? sessions.filter((s) => s.meeting_key === selectedMeeting.meeting_key)
    : [];

  const visibleMeetings = meetings.filter((m) => {
    const isPast = Date.parse(m.date_end) < now.getTime();
    if (scheduleFilter === "upcoming") return !isPast;
    if (scheduleFilter === "completed") return isPast;
    return true;
  });

  const driverByNumber = useMemo(() => new Map(drivers.map((d) => [d.driver_number, d])), [drivers]);
  const orderedPositions = [...positions].sort((a, b) => a.position - b.position);

  useEffect(() => {
    if (!currentSession) {
      setPositions([]);
      setIntervals([]);
      return;
    }
    let cancelled = false;
    async function loadLive() {
      try {
        const [positionResponse, intervalResponse] = await Promise.all([
          fetch(`https://api.openf1.org/v1/position?session_key=${currentSession!.session_key}`, { cache: "no-store" }),
          fetch(`https://api.openf1.org/v1/intervals?session_key=${currentSession!.session_key}`, { cache: "no-store" })
        ]);
        const [positionData, intervalData] = await Promise.all([
          positionResponse.ok ? positionResponse.json() : Promise.resolve([]),
          intervalResponse.ok ? intervalResponse.json() : Promise.resolve([])
        ]);
        if (cancelled) return;
        const latestByDriver = new Map<number, Position>();
        for (const item of positionData as Position[]) latestByDriver.set(item.driver_number, item);
        setPositions([...latestByDriver.values()]);
        const latestIntervals = new Map<number, Interval>();
        for (const item of intervalData as Interval[]) latestIntervals.set(item.driver_number, item);
        setIntervals([...latestIntervals.values()]);
      } catch {
        if (!cancelled) { setPositions([]); setIntervals([]); }
      }
    }
    void loadLive();
    const timer = window.setInterval(() => void loadLive(), 20_000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [currentSession]);

  useEffect(() => {
    if (backgroundMode !== "auto" || !animations) return;
    const timer = window.setInterval(() => setScene((value) => (value + 1) % 3), 24_000);
    return () => window.clearInterval(timer);
  }, [backgroundMode, animations]);

  useEffect(() => {
    const updateOrientation = () => setLandscapeWarning(window.innerHeight > window.innerWidth);
    updateOrientation();
    window.addEventListener("resize", updateOrientation);
    window.addEventListener("orientationchange", updateOrientation);
    return () => {
      window.removeEventListener("resize", updateOrientation);
      window.removeEventListener("orientationchange", updateOrientation);
    };
  }, []);

  useEffect(() => {
    setWakeSupported("wakeLock" in navigator);
  }, []);

  const requestWakeLock = async () => {
    setWakeError("");
    if (!("wakeLock" in navigator)) {
      setWakeError("Screen Wake Lock is not supported in this browser. Keep the phone connected to power and adjust Auto-Lock in iOS Settings.");
      return;
    }
    try {
      const lock = await (navigator as Navigator & { wakeLock: { request: (type: "screen") => Promise<{ release: () => Promise<void>; addEventListener?: (type: "release", listener: () => void) => void }> } }).wakeLock.request("screen");
      setWakeActive(true);
      lock.addEventListener?.("release", () => setWakeActive(false));
    } catch {
      setWakeActive(false);
      setWakeError("iOS did not grant the wake lock. Check Low Power Mode and browser support.");
    }
  };

  const activateTab = (tab: Tab) => {
    setActiveTab(tab);
    setMode("interactive");
    setRevealed(true);
  };

  const revealControls = () => {
    setRevealed(true);
    setMode("interactive");
  };

  const enterStandby = () => {
    setActiveTab("home");
    setMode("standby");
    setRevealed(false);
  };

  const countdown = (target: string) => {
    const ms = Math.max(0, Date.parse(target) - now.getTime());
    const days = Math.floor(ms / 86_400_000);
    const hours = Math.floor((ms % 86_400_000) / 3_600_000);
    const mins = Math.floor((ms % 3_600_000) / 60_000);
    const secs = Math.floor((ms % 60_000) / 1000);
    return { days, hours, mins, secs };
  };

  const countdownValue = nextRace ? countdown(nextRace.date_start) : null;

  const refreshLabel = lastUpdated
    ? dateTime(lastUpdated.toISOString(), { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "WAITING FOR DATA";

  const renderHome = () => (
    <section className="home-layout">
      <div className="home-left">
        <div className="date-stamp">
          <span className="eyebrow">LOCAL TIME · INDIA</span>
          <strong>{dateTime(now.toISOString(), { weekday: "long" }).toUpperCase()}</strong>
          <span>{dateTime(now.toISOString(), { day: "2-digit", month: "long", year: "numeric" }).toUpperCase()}</span>
        </div>
        <div className="weather-card">
          <div className="weather-symbol">{weather?.code === 0 ? "☀" : weather && [51,53,55,61,63,65,80,81,82].includes(weather.code) ? "⌁" : "◌"}</div>
          <div><strong>{weather ? `${weather.temperature}°C` : "--°"}</strong><span>{weather ? weatherLabel(weather.code) : "WEATHER OFFLINE"}</span><small>DELHI · HIGH {weather?.high ?? "--"}° / LOW {weather?.low ?? "--"}°</small></div>
        </div>
      </div>

      <div className="home-clock"><AnalogClock now={now} /></div>

      <div className="home-right">
        <article className="race-card">
          <div className="card-topline"><span className="eyebrow">{currentSession ? "SESSION IN PROGRESS" : "NEXT GRAND PRIX"}</span><span className={currentSession ? "live-pill" : "status-pill"}>{currentSession ? "LIVE" : nextRace ? "UP NEXT" : "SEASON"}</span></div>
          {currentSession ? (
            <>
              <div className="race-round">CURRENT SESSION</div>
              <h2>{currentSession.session_name}</h2>
              <p>{currentSession.circuit_short_name} · {currentSession.country_name}</p>
              <div className="race-detail"><span>ENDS</span><strong>{dateTime(currentSession.date_end, { hour: "2-digit", minute: "2-digit" })} IST</strong></div>
            </>
          ) : nextRace && nextRaceMeeting ? (
            <>
              <div className="race-round">ROUND {meetings.findIndex((m) => m.meeting_key === nextRaceMeeting.meeting_key) + 1 || "—"}</div>
              <h2>{nextRaceMeeting.meeting_name.replace(" Grand Prix", "")}</h2>
              <p>{FLAGS[nextRaceMeeting.country_name] ?? "🏁"} {nextRaceMeeting.circuit_short_name} · {nextRaceMeeting.country_name}</p>
              <div className="race-detail"><span>RACE START · IST</span><strong>{dateTime(nextRace.date_start, { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</strong></div>
              {countdownValue && <div className="countdown"><div><strong>{countdownValue.days}</strong><small>DAYS</small></div><i>:</i><div><strong>{String(countdownValue.hours).padStart(2, "0")}</strong><small>HRS</small></div><i>:</i><div><strong>{String(countdownValue.mins).padStart(2, "0")}</strong><small>MIN</small></div><i>:</i><div><strong>{String(countdownValue.secs).padStart(2, "0")}</strong><small>SEC</small></div></div>}
            </>
          ) : <EmptyState title="Season schedule unavailable" detail="The next event will appear when calendar data is available." />}
        </article>
        <article className="preview-card">
          <div className="card-topline"><span className="eyebrow">DRIVER CHAMPIONSHIP</span><button className="text-action" onClick={() => activateTab("standings")}>FULL TABLE ↗</button></div>
          {driverStandings.length ? driverStandings.slice(0, 3).map((standing) => {
            const driver = driverByNumber.get(standing.driver_number);
            return <div className="mini-standing" key={standing.driver_number}><span className="mini-pos">{String(standing.position_current).padStart(2, "0")}</span><span className="team-stripe" style={{ backgroundColor: driver?.team_colour ? `#${driver.team_colour.replace("#", "")}` : "#e10600" }} /><strong>{driver?.name_acronym ?? `#${standing.driver_number}`}</strong><span>{driver?.team_name ?? "DRIVER"}</span><b>{standing.points_current} <small>PTS</small></b></div>;
          }) : <div className="muted-note">{dataLoading ? "LOADING CHAMPIONSHIP DATA…" : "CHAMPIONSHIP DATA NOT AVAILABLE"}</div>}
        </article>
      </div>
    </section>
  );

  const renderStandings = () => (
    <section className="content-screen">
      <PanelTitle eyebrow={`FIA FORMULA ONE · ${year} SEASON`} title="Championship" right={<span className="data-chip">SOURCE · OPENF1</span>} />
      <div className="segmented"><button className={standingsTab === "drivers" ? "selected" : ""} onClick={() => setStandingsTab("drivers")}>DRIVERS</button><button className={standingsTab === "constructors" ? "selected" : ""} onClick={() => setStandingsTab("constructors")}>CONSTRUCTORS</button></div>
      {standingsTab === "drivers" ? driverStandings.length ? <div className="data-table"><div className="table-head"><span>POS</span><span>DRIVER</span><span>TEAM</span><span>POINTS</span></div>{driverStandings.map((row) => {
        const driver = driverByNumber.get(row.driver_number);
        return <div className="table-row" key={row.driver_number}><span className="table-pos">{String(row.position_current).padStart(2, "0")}</span><span className="driver-cell"><i style={{ backgroundColor: driver?.team_colour ? `#${driver.team_colour.replace("#", "")}` : "#777" }} /><b>{driver?.full_name ?? `Driver #${row.driver_number}`}</b><small>{driver?.name_acronym ?? ""}</small></span><span className="team-cell">{driver?.team_name ?? "—"}</span><strong>{row.points_current}</strong></div>;
      })}</div> : <EmptyState title="Driver standings unavailable" detail="OpenF1 has not returned a completed-race championship snapshot for this season yet." /> : constructorStandings.length ? <div className="data-table"><div className="table-head"><span>POS</span><span>CONSTRUCTOR</span><span>TEAM</span><span>POINTS</span></div>{constructorStandings.map((row, index) => <div className="table-row" key={row.team_name ?? index}><span className="table-pos">{String(row.position_current).padStart(2, "0")}</span><span className="driver-cell"><i style={{ backgroundColor: row.team_colour ? `#${row.team_colour.replace("#", "")}` : "#777" }} /><b>{row.team_name ?? "Team"}</b></span><span className="team-cell">FORMULA ONE</span><strong>{row.points_current}</strong></div>)}</div> : <EmptyState title="Constructor standings unavailable" detail="The connected OpenF1 endpoint may not expose constructor standings for this session." />}
    </section>
  );

  const renderSchedule = () => (
    <section className="content-screen">
      <PanelTitle eyebrow={`RACE CALENDAR · ${year}`} title="Season schedule" right={<span className="data-chip">{meetings.length} EVENTS</span>} />
      <div className="segmented schedule-filters">{(["upcoming", "completed", "all"] as const).map((filter) => <button key={filter} className={scheduleFilter === filter ? "selected" : ""} onClick={() => setScheduleFilter(filter)}>{filter.toUpperCase()}</button>)}</div>
      <div className="schedule-list">{visibleMeetings.map((meeting) => {
        const eventSessions = sessions.filter((s) => s.meeting_key === meeting.meeting_key);
        const race = eventSessions.find((s) => s.session_name.toLowerCase() === "race");
        const past = Date.parse(meeting.date_end) < now.getTime();
        const active = eventSessions.some((s) => Date.parse(s.date_start) <= now.getTime() && Date.parse(s.date_end) >= now.getTime());
        return <button className={`event-row ${selectedMeetingKey === meeting.meeting_key ? "event-selected" : ""}`} key={meeting.meeting_key} onClick={() => { setSelectedMeetingKey(meeting.meeting_key); activateTab("circuit"); }}>
          <span className="event-date">{dateTime(meeting.date_start, { day: "2-digit", month: "short" })}</span><span className="event-flag">{FLAGS[meeting.country_name] ?? "🏁"}</span><span className="event-name"><b>{meeting.meeting_name}</b><small>{meeting.circuit_short_name} · {meeting.location}</small></span><span className={active ? "event-status live-text" : past ? "event-status" : "event-status next-text"}>{active ? "LIVE" : past ? "COMPLETED" : "UPCOMING"}</span><span className="event-time">{race ? dateTime(race.date_start, { hour: "2-digit", minute: "2-digit" }) + " IST" : "—"}</span>
        </button>;
      })}{!visibleMeetings.length && <EmptyState title="No events in this view" detail="Try another calendar filter." />}</div>
    </section>
  );

  const renderCircuit = () => (
    <section className="content-screen circuit-screen">
      <PanelTitle eyebrow="CIRCUIT INTELLIGENCE" title="Race weekend" right={<span className="data-chip">EVENT DATA</span>} />
      {selectedMeeting ? <>
        <div className="circuit-hero">
          <div className="circuit-map-art" aria-hidden="true"><svg viewBox="0 0 440 220"><path d="M48 128 C35 88 66 48 116 62 L160 78 C192 90 206 38 246 43 L306 50 C350 55 378 91 350 119 L321 146 C298 168 334 190 296 190 L222 188 C188 187 194 151 160 148 L104 143 C78 141 60 157 48 128Z" /><path className="circuit-map-inner" d="M48 128 C35 88 66 48 116 62 L160 78 C192 90 206 38 246 43 L306 50 C350 55 378 91 350 119 L321 146 C298 168 334 190 296 190 L222 188 C188 187 194 151 160 148 L104 143 C78 141 60 157 48 128Z" /></svg><span>TRACK PROFILE · DECORATIVE</span></div>
          <div className="circuit-meta"><span className="event-flag large-flag">{FLAGS[selectedMeeting.country_name] ?? "🏁"}</span><span className="eyebrow">SELECTED GRAND PRIX</span><h2>{selectedMeeting.meeting_name}</h2><p>{selectedMeeting.circuit_short_name}</p><div className="circuit-place">{selectedMeeting.location}, {selectedMeeting.country_name}</div><div className="circuit-dates">{dateTime(selectedMeeting.date_start, { weekday: "short", day: "2-digit", month: "short" })} — {dateTime(selectedMeeting.date_end, { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</div></div>
        </div>
        <div className="section-subhead"><span className="eyebrow">SESSION PROGRAMME</span><span>{selectedSessions.length} SESSIONS</span></div>
        <div className="session-grid">{selectedSessions.map((s) => {
          const live = Date.parse(s.date_start) <= now.getTime() && Date.parse(s.date_end) >= now.getTime();
          const done = Date.parse(s.date_end) < now.getTime();
          return <div className="session-card" key={s.session_key}><span className={live ? "session-state live-text" : done ? "session-state" : "session-state next-text"}>{live ? "● LIVE NOW" : done ? "COMPLETED" : "UP NEXT"}</span><b>{sessionShort(s.session_name)}</b><strong>{dateTime(s.date_start, { day: "2-digit", month: "short" })}</strong><span>{dateTime(s.date_start, { hour: "2-digit", minute: "2-digit" })} IST</span></div>;
        })}</div>
        <p className="source-note">Track outline is decorative. Circuit dimensions and lap records are intentionally omitted unless verified data is available.</p>
      </> : <EmptyState title="Circuit data unavailable" detail="The selected event will appear here when the calendar loads." />}
    </section>
  );

  const renderLive = () => (
    <section className="content-screen">
      <PanelTitle eyebrow="LIVE TIMING · OPENF1" title="Track monitor" right={<span className={currentSession ? "live-pill" : "status-pill"}>{currentSession ? "LIVE SESSION" : "NO LIVE SESSION"}</span>} />
      {currentSession ? <>
        <div className="live-session-banner"><div><span className="eyebrow">SESSION IN PROGRESS</span><h3>{currentSession.session_name}</h3><p>{currentSession.circuit_short_name} · {currentSession.country_name}</p></div><div className="live-indicator"><i /> LIVE</div></div>
        {orderedPositions.length ? <div className="data-table live-table"><div className="table-head"><span>POS</span><span>DRIVER</span><span>GAP</span><span>NO.</span></div>{orderedPositions.map((row) => {
          const driver = driverByNumber.get(row.driver_number);
          const interval = intervals.find((i) => i.driver_number === row.driver_number);
          const gap = row.position === 1 ? "LEADER" : interval?.gap_to_leader != null ? String(interval.gap_to_leader) : interval?.interval != null ? String(interval.interval) : "—";
          return <div className="table-row" key={row.driver_number}><span className="table-pos">{String(row.position).padStart(2, "0")}</span><span className="driver-cell"><i style={{ backgroundColor: driver?.team_colour ? `#${driver.team_colour.replace("#", "")}` : "#777" }} /><b>{driver?.full_name ?? "Driver"}</b><small>{driver?.name_acronym ?? ""}</small></span><span className="team-cell">{gap}</span><strong>{row.driver_number}</strong></div>;
        })}</div> : <EmptyState title="Waiting for timing feed" detail="The session is active, but position data has not arrived yet. This panel refreshes every 20 seconds." />}
      </> : <EmptyState title="Track is quiet" detail={nextSession ? `Next session: ${nextSession.session_name} · ${dateTime(nextSession.date_start, { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })} IST` : "Live timing will activate automatically when an F1 session begins."} />}
    </section>
  );

  const renderSettings = () => (
    <section className="content-screen settings-screen">
      <PanelTitle eyebrow="PERSONALISE YOUR COCKPIT" title="System settings" />
      <div className="settings-grid">
        <div className="setting-group"><span className="eyebrow">DISPLAY MODE</span><div className="setting-line"><div><b>Standby experience</b><small>Hide navigation and keep the home cockpit visible.</small></div><button className={mode === "standby" ? "toggle on" : "toggle"} onClick={() => mode === "standby" ? setMode("interactive") : enterStandby()}><i /></button></div><div className="setting-line"><div><b>Screen wake lock</b><small>{wakeSupported ? "Ask the browser to keep the screen awake while this page is open." : "Not supported in this browser."}</small></div><button className="outline-action" onClick={requestWakeLock}> {wakeActive ? "ACTIVE" : "ENABLE"} </button></div>{wakeError && <p className="setting-warning">{wakeError}</p>}</div>
        <div className="setting-group"><span className="eyebrow">AMBIENT BACKGROUND</span><div className="setting-line"><div><b>Background rotation</b><small>Switch between technical motion scenes and a static fallback.</small></div><select value={backgroundMode} onChange={(e) => setBackgroundMode(e.target.value as BackgroundMode)}><option value="auto">AUTO</option><option value="motion">MOTION</option><option value="still">STILL</option></select></div><div className="setting-line"><div><b>Motion effects</b><small>Reduce movement for battery and accessibility.</small></div><button className={animations ? "toggle on" : "toggle"} onClick={() => setAnimations((v) => !v)}><i /></button></div></div>
        <div className="setting-group"><span className="eyebrow">CLOCK</span><div className="setting-line"><div><b>Show seconds</b><small>Display the digital seconds readout.</small></div><button className={showSeconds ? "toggle on" : "toggle"} onClick={() => setShowSeconds((v) => !v)}><i /></button></div></div>
        <div className="setting-group"><span className="eyebrow">DATA & LOCATION</span><div className="setting-line"><div><b>Weather location</b><small>Delhi, India · Open-Meteo</small></div><span className="setting-value">DELHI</span></div><div className="setting-line"><div><b>Last data refresh</b><small>F1 calendar and weather</small></div><span className="setting-value">{refreshLabel}</span></div><button className="outline-action refresh-button" onClick={() => void loadCoreData()}>↻ REFRESH DATA</button></div>
      </div>
      <p className="ios-note">iOS note: Home Screen web apps cannot guarantee an always-on display. Wake Lock support depends on the iOS version and browser context. For long standby sessions, keep the iPhone powered and review Settings → Display & Brightness → Auto-Lock.</p>
    </section>
  );

  return (
    <main className={`cockpit-shell scene-${scene} ${backgroundMode === "still" || !animations ? "scene-static" : ""} ${mode === "standby" && !revealed ? "standby-hidden" : ""}`} onPointerDown={revealControls}>
      <div className="ambient-grid" />
      <div className="ambient-streak streak-one" />
      <div className="ambient-streak streak-two" />
      <div className="ambient-track"><svg viewBox="0 0 900 420" aria-hidden="true"><path d="M70 230 C70 90 230 50 330 120 S470 250 560 130 S760 40 820 180 S720 350 570 310 S350 350 260 270 S90 360 70 230Z" /></svg></div>
      <header className="cockpit-header">
        <button className="wordmark" onClick={() => activateTab("home")} aria-label="Go to cockpit home"><span className="f1-mark">F1</span><span className="wordmark-divider" /><span><b>COCKPIT</b><small>TELEMETRY SYSTEM</small></span></button>
        <div className="header-center"><span className="system-dot" /> SYSTEM ONLINE <i /> {year} WORLD CHAMPIONSHIP</div>
        <div className="header-right"><span>{dateTime(now.toISOString(), { hour: "2-digit", minute: "2-digit", second: showSeconds ? "2-digit" : undefined, hour12: false })} IST</span><button className="header-icon" onClick={() => activateTab("settings")} aria-label="Settings">⚙</button></div>
      </header>

      {landscapeWarning && <button className="rotate-hint" onClick={() => setLandscapeWarning(false)}>ROTATE IPHONE TO LANDSCAPE FOR THE FULL COCKPIT EXPERIENCE <b>×</b></button>}

      <div className="main-stage">
        {activeTab === "home" && renderHome()}
        {activeTab === "standings" && renderStandings()}
        {activeTab === "schedule" && renderSchedule()}
        {activeTab === "circuit" && renderCircuit()}
        {activeTab === "live" && renderLive()}
        {activeTab === "settings" && renderSettings()}
      </div>

      {dataError && <div className="connection-warning"><span>!</span>{dataError}<button onClick={() => void loadCoreData()}>RETRY</button></div>}

      <footer className={`cockpit-footer ${mode === "standby" && !revealed ? "footer-muted" : ""}`}>
        <nav className="tab-bar" aria-label="Dashboard navigation">{TABS.map((tab) => <button key={tab.id} className={activeTab === tab.id ? "tab-active" : ""} onClick={() => activateTab(tab.id)}><span>{tab.icon}</span><small>{tab.short}</small></button>)}</nav>
        <div className="footer-right"><span className="connection-state"><i /> {dataLoading ? "SYNCING" : "DATA SYNCED"}</span><button className="standby-button" onClick={enterStandby}>◐ STANDBY</button></div>
      </footer>

      {mode === "standby" && !revealed && <button className="wake-overlay" onClick={() => { setRevealed(true); setMode("interactive"); }} aria-label="Reveal dashboard controls"><span>TAP TO INTERACT</span></button>}
      <div className="safe-area-bottom" />
    </main>
  );
}
