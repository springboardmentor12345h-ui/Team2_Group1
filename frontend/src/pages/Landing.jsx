import React, { useContext, useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
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
import Lenis from "lenis";
import "./Landing.css";

const ParticleBackground = () => {
  const particles = useMemo(
    () =>
      [...Array(20)].map((_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
      })),
    [],
  );

  return (
    <div className="particles-container">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-purple-500/10"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

const Landing = () => {
  const { user } = useContext(AuthContext);
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const fetchTrendingEvents = async () => {
      try {
        const { data } = await axios.get(
          "/api/v1/events?sort=-startDate&limit=3",
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

  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  };

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
        icon: MegaphoneIcon,
        label: "NEWS",
        desc: "Instant announcements and flash event notifications in one place.",
      },
    ],
    [],
  );

  return (
    <div className="landing-root">
      <ParticleBackground />

      {/* Light Theme Background */}
      <div className="universe-bg">
        <div className="stars-overlay" />
        <div className="neon-grid" />
        <div className="spotlight" style={{ left: "5%", top: "10%" }} />
        <div
          className="spotlight"
          style={{
            right: "5%",
            bottom: "5%",
            background:
              "radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Modern Light Navbar */}
      <nav className="fixed top-0 left-0 w-full z-[100] px-8 py-6 flex justify-between items-center backdrop-blur-md border-b border-purple-100 bg-white/70">
        <Link to="/" className="flex items-center gap-2 group">
          <RocketLaunchIcon className="w-9 h-9 text-purple-600 group-hover:rotate-12 transition-transform" />
          <span className="font-black text-2xl tracking-tighter text-slate-900">
            CAMPUS EVENT HUB
          </span>
        </Link>
        <div className="flex gap-4 items-center">
          {user ? (
            <Link to="/dashboard">
              <button className="bg-purple-600 text-white px-6 py-2.5 rounded-xl text-xs font-black hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-200 transition-all uppercase tracking-widest">
                DASHBOARD
              </button>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-bold text-slate-600 hover:text-purple-600 transition-colors px-4"
              >
                LOG IN
              </Link>
              <Link to="/register">
                <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-black hover:bg-black transition-all tracking-widest">
                  JOIN HUB
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="relative z-10 font-sans">
        {/* HERO SECTION */}
        <section className="landing-section">
          <motion.div {...fadeIn} className="max-w-4xl text-center px-4">
            <motion.div
              className="inline-flex items-center gap-2 bg-purple-50 text-purple-600 border border-purple-100 px-5 py-2 rounded-full text-[11px] font-black tracking-[0.2em] mb-10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <SparklesIcon className="w-4 h-4" /> THE ULTIMATE CAMPUS UNIVERSE
            </motion.div>
            <h1 className="mega-title mb-14 tracking-tight">
              Elevate Your
              <br />
              <span>College Journey.</span>
            </h1>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              Discover elite hackathons, cultural festivals, and sports leagues.
              Join the ecosystem connecting{" "}
              <span className="text-purple-600 font-bold">120+ colleges</span>{" "}
              nationwide.
            </p>
            <div className="flex gap-12 sm:gap-24 justify-center flex-wrap">
              {[
                { v: "120+", l: "PARTNERS" },
                { v: "50k+", l: "USERS" },
                { v: "1k+", l: "EVENTS" },
              ].map((s, i) => (
                <div key={i} className="text-center group">
                  <div className="text-5xl font-black text-slate-900 group-hover:text-purple-600 transition-colors">
                    {s.v}
                  </div>
                  <div className="text-xs text-slate-400 font-bold tracking-[0.2em] uppercase mt-2">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* SERVICES SECTION */}
        <section className="landing-section bg-slate-50/50">
          <div className="max-w-7xl w-full px-4">
            <motion.div {...fadeIn} className="mb-20 text-center">
              <h2 className="text-5xl font-black text-slate-900 italic mb-4">
                ENDLESS OPPORTUNITIES
              </h2>
              <div className="w-24 h-1.5 bg-purple-600 mx-auto rounded-full mb-6" />
              <p className="text-slate-500 text-lg max-w-xl mx-auto font-medium">
                Wherever your passion lies, we bridge the gap between campus and
                career.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((cat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card group border-white/50"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="p-4 bg-purple-50 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                      <cat.icon className="w-8 h-8 text-purple-600 group-hover:text-white" />
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
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* TRENDING FEED (REAL DATA) */}
        <section className="landing-section">
          <div className="max-w-5xl w-full px-4">
            <motion.div
              {...fadeIn}
              className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
            >
              <div>
                <h2 className="text-5xl font-black text-slate-900 flex items-center gap-4">
                  <FireIcon className="w-10 h-10 text-orange-500" /> TRENDING
                  NOW
                </h2>
                <p className="text-slate-400 font-bold tracking-widest mt-2 uppercase text-xs">
                  Recently added elite events from top colleges
                </p>
              </div>
              <Link
                to="/events"
                className="text-purple-600 font-black text-sm hover:underline"
              >
                EXPLORE ALL EVENTS →
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 gap-6">
              {loadingEvents ? (
                [...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="glass-card h-32 animate-pulse bg-slate-100"
                  />
                ))
              ) : trendingEvents.length > 0 ? (
                trendingEvents.map((ev, i) => (
                  <motion.div
                    key={ev._id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card flex flex-col sm:flex-row items-center justify-between p-8 gap-8 border-slate-100 bg-white/40"
                  >
                    <div className="flex gap-8 items-center w-full">
                      <div className="w-20 h-20 bg-purple-50 rounded-2xl flex flex-col items-center justify-center border border-purple-100 shrink-0">
                        <span className="text-sm font-black text-purple-600 leading-none">
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
                            <MapPinIcon className="w-4 h-4 text-purple-400" />{" "}
                            {ev.collegeId?.college || "Global"}
                          </span>
                          <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded uppercase text-[10px]">
                            {ev.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 w-full sm:w-auto justify-end">
                      <Link to={`/events`}>
                        <button className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl text-[11px] font-black hover:bg-purple-600 transition-all shadow-lg shadow-slate-200">
                          VIEW DETAILS
                        </button>
                      </Link>
                    </div>
                  </motion.div>
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
          <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-24 items-start px-4">
            <motion.div {...fadeIn} className="space-y-12">
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
                    <div className="p-5 bg-white rounded-2xl h-fit border border-purple-100 shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                      <p.i className="w-8 h-8 text-purple-600 group-hover:text-white" />
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
            </motion.div>
            <motion.div {...fadeIn} className="space-y-8">
              <h3 className="text-xl font-black text-purple-600 mb-8 px-4 border-l-4 border-purple-600 tracking-widest uppercase">
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
                  className="glass-card bg-white flex gap-10 items-center p-8 border-purple-100"
                >
                  <div className="text-5xl font-black text-purple-600/20 italic shrink-0">
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
            </motion.div>
          </div>
        </section>

        {/* PORTAL SECTION */}
        <section className="landing-section">
          <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 px-4">
            <motion.div
              {...fadeIn}
              whileHover={{ scale: 1.02 }}
              className="glass-card bg-white border-purple-100 p-12 text-center group hover:bg-purple-50 transition-all duration-500 flex flex-col h-full"
            >
              <UserGroupIcon className="w-20 h-20 text-purple-600 mx-auto mb-8 transition-transform group-hover:scale-110" />
              <h2 className="text-4xl font-black text-slate-900 mb-6 group-hover:text-purple-700">
                FOR STUDENTS
              </h2>
              <p className="text-slate-500 text-lg mb-10 font-medium">
                Build your legacy. Discover events and grow your network.
              </p>
              <Link to="/events" className="w-full mt-auto">
                <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs tracking-[0.2em] hover:bg-purple-600 transition-all shadow-xl">
                  EXPLORE HUB
                </button>
              </Link>
            </motion.div>
            <motion.div
              {...fadeIn}
              whileHover={{ scale: 1.02 }}
              className="glass-card bg-white border-purple-100 p-12 text-center group hover:bg-purple-50 transition-all duration-500 flex flex-col h-full"
            >
              <BuildingLibraryIcon className="w-20 h-20 text-purple-600 mx-auto mb-8 transition-transform group-hover:scale-110" />
              <h2 className="text-4xl font-black text-slate-900 mb-6 group-hover:text-purple-700">
                FOR COLLEGES
              </h2>
              <p className="text-slate-500 text-lg mb-10 font-medium">
                Broadcast your vision to 50k+ students with one tap.
              </p>
              <Link to="/register" className="w-full mt-auto">
                <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs tracking-[0.2em] hover:bg-purple-600 transition-all shadow-xl">
                  HOST EVENT
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="landing-section">
          <motion.div {...fadeIn} className="text-center px-4">
            <RocketLaunchIcon className="w-24 h-24 text-purple-500 mx-auto mb-12 animate-pulse" />
            <h2 className="text-7xl font-black text-slate-900 tracking-tighter italic mb-6">
              ALL SYSTEMS GO.
            </h2>
            <p className="text-slate-400 text-xl font-bold tracking-widest uppercase mb-12">
              Your college journey starts here.
            </p>
            <Link to="/register">
              <button className="glow-btn">ENTER THE HUB</button>
            </Link>
          </motion.div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="relative z-10 px-10 py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <RocketLaunchIcon className="w-8 h-8 text-purple-600" />
            <span className="font-black text-2xl text-slate-900 tracking-tighter">
              CAMPUS EVENT HUB
            </span>
          </div>
          <div className="flex gap-12 text-[11px] font-black text-slate-400 tracking-[0.2em]">
            <a href="#" className="hover:text-purple-600 transition-colors">
              PRIVACY POLICY
            </a>
            <a href="#" className="hover:text-purple-600 transition-colors">
              CAMPUS SAFETY
            </a>
            <a href="#" className="hover:text-purple-600 transition-colors">
              DIRECT SUPPORT
            </a>
          </div>
          <div className="text-[11px] font-bold text-slate-400">
            © 2026 CAMPUS EVENT HUB. EMPOWERING THE NEXT GEN.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
