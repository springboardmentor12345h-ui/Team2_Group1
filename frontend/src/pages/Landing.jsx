import React, { useContext, useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MusicalNoteIcon,
  TrophyIcon,
  CommandLineIcon,
  AcademicCapIcon,
  SparklesIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  FireIcon,
  ShieldCheckIcon,
  ClockIcon,
  GlobeAltIcon,
  PuzzlePieceIcon,
  MegaphoneIcon,
  BuildingLibraryIcon,
  MapPinIcon,
} from "@heroicons/react/24/solid";
import AuthContext from "../context/AuthContext";
import "./Landing.css";

const Landing = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchTrendingEvents = async () => {
      try {
        const { data } = await axios.get(
          `/api/v1/events?endDate[gte]=${new Date().toISOString()}&sort=startDate&limit=3`,
        );
        if (data.status === "success") {
          setTrendingEvents(data.data.events);
        }
      } catch (error) {
        console.error("Failed to fetch trending events:", error);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchTrendingEvents();
  }, []);

  const categories = useMemo(
    () => [
      {
        title: "Technical",
        icon: CommandLineIcon,
        label: "HACKATHONS",
        desc: "Build the future with AI, Web3, and Open Source challenges.",
      },
      {
        title: "Cultural",
        icon: MusicalNoteIcon,
        label: "FESTIVALS",
        desc: "Showcase your talent in Music, Dance, and Theater on a national stage.",
      },
      {
        title: "Sports",
        icon: TrophyIcon,
        label: "LEAGUES",
        desc: "Competitive inter-college tournaments and rising e-sports arenas.",
      },
      {
        title: "Workshops",
        icon: AcademicCapIcon,
        label: "LEARNING",
        desc: "Led by industry pioneers to bridge the gap between campus and career.",
      },
      {
        title: "Gaming",
        icon: PuzzlePieceIcon,
        label: "ESPORTS",
        desc: "The ultimate showdown for PC and Mobile gamers across all campuses.",
      },
      {
        title: "Buzz",
        icon: SparklesIcon,
        label: "SEMINARS",
        desc: "Stay updated with the latest trends, startup pitches, and tech talks.",
      },
    ],
    [],
  );

  return (
    <div className="landing-root">
      {/* Light Theme Background */}
      <div className="universe-bg">
        <div className="neon-grid" />
        <div className="spotlight spotlight-1" />
        <div className="spotlight spotlight-2" />
        <div className="spotlight spotlight-3" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-10 py-6 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-primary-600 p-2 rounded-xl shadow-lg shadow-primary-200">
            <RocketLaunchIcon className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-2xl text-slate-900 tracking-tighter uppercase italic">
            CAMPUS <span className="text-primary-600">PULSE</span>
          </span>
        </div>
        <div className="flex items-center gap-12">
          {!user ? (
            <>
              <Link
                to="/login"
                className="text-xs font-black text-slate-400 hover:text-primary-600 tracking-[0.2em] transition-colors"
              >
                LOGIN
              </Link>
              <Link to="/register">
                <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-xs font-black tracking-[0.2em] hover:bg-primary-600 transition-all shadow-xl shadow-slate-200">
                  JOIN NOW
                </button>
              </Link>
            </>
          ) : (
            <Link to="/events">
              <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-xs font-black tracking-[0.2em] hover:bg-primary-600 transition-all">
                DASHBOARD
              </button>
            </Link>
          )}
        </div>
      </nav>

      <main className="relative z-10 font-sans">
        {/* HERO SECTION */}
        <section className="landing-section">
          <div className="max-w-[95%] text-center px-4">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 border border-primary-100 px-5 py-2 rounded-full text-[11px] font-black tracking-[0.2em] mb-10 uppercase">
              <SparklesIcon className="w-4 h-4" /> THE ULTIMATE CAMPUS PULSE
            </div>
            <h1 className="mega-title mb-14 tracking-tight">
              Elevate Your
              <br />
              <span className="text-primary-600">College Journey.</span>
            </h1>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              Discover elite hackathons, cultural festivals, and sports leagues.
              Join the ecosystem connecting{" "}
              <span className="text-primary-600 font-bold">120+ colleges</span>{" "}
              nationwide.
            </p>
            <div className="flex gap-12 sm:gap-24 justify-center flex-wrap">
              {[
                { v: "120+", l: "PARTNERS" },
                { v: "50k+", l: "USERS" },
                { v: "1k+", l: "EVENTS" },
              ].map((s, i) => (
                <div key={i} className="text-center group">
                  <div className="text-5xl font-black text-slate-900 group-hover:text-primary-600 transition-colors">
                    {s.v}
                  </div>
                  <div className="text-xs text-slate-400 font-bold tracking-[0.2em] uppercase mt-2">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section className="landing-section bg-slate-50/50">
          <div className="max-w-[95%] w-full px-4">
            <div className="mb-20 text-center">
              <h2 className="text-5xl font-black text-slate-900 italic mb-4">
                ENDLESS OPPORTUNITIES
              </h2>
              <div className="w-24 h-1.5 bg-primary-600 mx-auto rounded-full mb-6" />
              <p className="text-slate-500 text-lg max-w-xl mx-auto font-medium">
                Wherever your passion lies, we bridge the gap between campus and
                career.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((cat, i) => (
                <div key={i} className="glass-card group border-white/50">
                  <div className="flex justify-between items-start mb-8">
                    <div className="p-4 bg-primary-50 rounded-2xl group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                      <cat.icon className="w-8 h-8 text-primary-600 group-hover:text-white" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 tracking-widest">
                      {cat.label}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    {cat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TRENDING FEED (REAL DATA) */}
        <section className="landing-section">
          <div className="max-w-[95%] w-full px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-5xl font-black text-slate-900 flex items-center gap-4">
                  <FireIcon className="w-10 h-10 text-orange-500" /> TRENDING
                  NOW
                </h2>
                <p className="text-slate-400 font-bold tracking-widest mt-2 uppercase text-xs">
                  Upcoming elite events from top colleges
                </p>
              </div>
              <Link
                to="/events"
                className="text-primary-600 font-black text-sm hover:underline"
              >
                EXPLORE ALL EVENTS &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {loadingEvents ? (
                [...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="glass-card h-32 animate-pulse bg-slate-100"
                  />
                ))
              ) : trendingEvents.length > 0 ? (
                trendingEvents.map((ev) => (
                  <div
                    key={ev._id}
                    className="glass-card flex flex-col sm:flex-row items-center justify-between p-8 gap-8 border-slate-100 bg-white/40 cursor-pointer"
                    onClick={() => navigate("/events")}
                  >
                    <div className="flex gap-8 items-center w-full">
                      <div className="w-20 h-20 bg-primary-50 rounded-2xl flex flex-col items-center justify-center border border-primary-100 shrink-0">
                        <span className="text-sm font-black text-primary-600 leading-none">
                          {new Date(ev.startDate).toLocaleDateString("en-US", {
                            day: "2-digit",
                          })}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase">
                          {new Date(ev.startDate).toLocaleDateString("en-US", {
                            month: "short",
                          })}
                        </span>
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-2xl font-black text-slate-900 truncate tracking-tighter">
                          {ev.title}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 font-bold mt-2">
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="w-4 h-4 text-primary-400" />{" "}
                            {ev.collegeId?.college || "Global"}
                          </span>
                          <span className="bg-primary-50 text-primary-600 px-2 py-0.5 rounded uppercase text-[10px]">
                            {ev.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 w-full sm:w-auto justify-end">
                      <button className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl text-[11px] font-black hover:bg-primary-600 transition-all shadow-lg shadow-slate-200">
                        VIEW DETAILS
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold">
                    No trending events at the moment. Check back later!
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ECOSYSTEM (TRUST & ROADMAP) */}
        <section className="landing-section bg-slate-50/50">
          <div className="max-w-[95%] w-full grid grid-cols-1 lg:grid-cols-2 gap-24 items-start px-4">
            <div className="space-y-12">
              <h2 className="text-6xl font-black text-slate-900 italic leading-tight">
                BUILT FOR
                <br />
                THE BOLD.
              </h2>
              <div className="space-y-12">
                {[
                  {
                    i: ShieldCheckIcon,
                    t: "Verified Hosts Only",
                    d: "Security is our priority. Every college administrator is manually vetted before gaining host privileges.",
                  },
                  {
                    i: GlobeAltIcon,
                    t: "Unified Student ID",
                    d: "One profile to rule them all. Register for national hackathons or local fests with a single tap.",
                  },
                  {
                    i: ClockIcon,
                    t: "Real-time Pulse",
                    d: "Instant push notifications for schedule shifts, room changes, or results directly on your phone.",
                  },
                ].map((p, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className="p-5 bg-white rounded-2xl h-fit border border-primary-100 shadow-sm group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                      <p.i className="w-8 h-8 text-primary-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900 mb-2">
                        {p.t}
                      </h4>
                      <p className="text-slate-500 leading-relaxed font-medium">
                        {p.d}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-8">
              <h3 className="text-xl font-black text-primary-600 mb-8 px-4 border-l-4 border-primary-600 tracking-widest uppercase">
                The Roadmap
              </h3>
              {[
                {
                  n: "01",
                  t: "IDENTITY",
                  d: "Build your skills-based student portfolio and showcase your wins.",
                },
                {
                  n: "02",
                  t: "DISCOVERY",
                  d: "Find elite events tailored to your department or hobbies using advanced filters.",
                },
                {
                  n: "03",
                  t: "ASCENSION",
                  d: "Compete on the national stage and collect verified digital certificates.",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="glass-card bg-white flex gap-10 items-center p-8 border-primary-100"
                >
                  <div className="text-5xl font-black text-primary-600/20 italic shrink-0">
                    {s.n}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-lg mb-1">
                      {s.t}
                    </h4>
                    <p className="text-sm text-slate-400 font-bold leading-relaxed">
                      {s.d}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PORTAL SECTION */}
        <section className="landing-section">
          <div className="max-w-[95%] w-full grid grid-cols-1 md:grid-cols-2 gap-10 px-4">
            <div className="glass-card bg-white border-primary-100 p-12 text-center group hover:bg-primary-50 transition-all duration-500 flex flex-col h-full">
              <UserGroupIcon className="w-20 h-20 text-primary-600 mx-auto mb-8 transition-transform group-hover:scale-110" />
              <h2 className="text-4xl font-black text-slate-900 mb-6 group-hover:text-primary-700">
                FOR STUDENTS
              </h2>
              <p className="text-slate-500 text-lg mb-10 font-medium">
                Build your legacy. Discover events and grow your network.
              </p>
              <Link to="/events" className="w-full mt-auto">
                <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs tracking-[0.2em] hover:bg-primary-600 transition-all shadow-xl">
                  EXPLORE HUB
                </button>
              </Link>
            </div>
            <div className="glass-card bg-white border-primary-100 p-12 text-center group hover:bg-primary-50 transition-all duration-500 flex flex-col h-full">
              <BuildingLibraryIcon className="w-20 h-20 text-primary-600 mx-auto mb-8 transition-transform group-hover:scale-110" />
              <h2 className="text-4xl font-black text-slate-900 mb-6 group-hover:text-primary-700">
                FOR COLLEGES
              </h2>
              <p className="text-slate-500 text-lg mb-10 font-medium">
                Broadcast your vision to 50k+ students with one tap.
              </p>
              <Link to="/register" className="w-full mt-auto">
                <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs tracking-[0.2em] hover:bg-primary-600 transition-all shadow-xl">
                  HOST EVENT
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* COLLEGE REGISTRATION INFO */}
        <section className="landing-section bg-slate-50/50 overflow-hidden relative border-y border-slate-100">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-400 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-400 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="max-w-4xl w-full px-6 relative z-10 text-center">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-3 bg-primary-100 text-primary-600 border border-primary-200 px-6 py-2.5 rounded-full text-[11px] font-black tracking-[0.2em] uppercase">
                <BuildingLibraryIcon className="w-4 h-4" /> PARTNER WITH THE HUB
              </div>

              <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter italic leading-none">
                EXPAND YOUR
                <br />
                <span className="text-primary-600">CAMPUS REACH.</span>
              </h2>

              <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                Empower your students by bringing the nation's premier event hub
                to your institution. Join 120+ leading colleges in building the
                future of campus engagement.
              </p>

              <div className="glass-card p-10 md:p-14 mt-12 relative group bg-white/60">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary-600 p-4 rounded-2xl shadow-xl shadow-primary-200">
                  <MegaphoneIcon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 mt-4 tracking-tight">
                  Register Your College
                </h3>

                <p className="text-slate-500 mb-10 text-lg font-medium leading-relaxed">
                  To become a verified college administrator and unlock hosting
                  privileges for your campus, please get in touch with our
                  partnerships team.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                  <a
                    href="mailto:admin@example.com"
                    className="w-full sm:w-auto flex items-center justify-center gap-4 bg-slate-900 text-white hover:bg-primary-600 px-10 py-5 rounded-2xl font-black text-sm tracking-[0.1em] transition-all duration-300 shadow-xl"
                  >
                    SEND EMAIL
                  </a>

                  <div className="flex flex-col items-center sm:items-start text-left">
                    <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">
                      Direct Inquiry
                    </span>
                    <span className="text-xl font-bold text-slate-900 tracking-tight border-b-2 border-primary-600/20">
                      admin@example.com
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <p className="text-slate-400 text-[10px] font-black tracking-[0.3em] uppercase">
                  * Official college email required for verification
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="landing-section">
          <div className="text-center px-4 max-w-[95%] mx-auto">
            <RocketLaunchIcon className="w-24 h-24 text-primary-500 mx-auto mb-12" />
            <h2 className="text-7xl font-black text-slate-900 tracking-tighter italic mb-6">
              ALL SYSTEMS GO.
            </h2>
            <p className="text-slate-400 text-xl font-bold tracking-widest uppercase mb-12">
              Your <span className="text-primary-600">college journey</span>{" "}
              starts here.
            </p>
            <Link to="/register">
              <button className="glow-btn">ENTER THE HUB</button>
            </Link>
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="relative z-10 px-10 py-16 bg-white border-t border-slate-100">
        <div className="max-w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <RocketLaunchIcon className="w-8 h-8 text-primary-600" />
            <span className="font-black text-2xl text-slate-900 tracking-tighter uppercase italic">
              CAMPUS <span className="text-primary-600">PULSE</span>
            </span>
          </div>
          <div className="flex gap-12 text-[11px] font-black text-slate-400 tracking-[0.2em]">
            <a href="#" className="hover:text-primary-600 transition-colors">
              PRIVACY POLICY
            </a>
            <a href="#" className="hover:text-primary-600 transition-colors">
              CAMPUS SAFETY
            </a>
            <a href="#" className="hover:text-primary-600 transition-colors">
              DIRECT SUPPORT
            </a>
          </div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            &copy; 2026 CAMPUS PULSE. EMPOWERING THE NEXT GEN.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
