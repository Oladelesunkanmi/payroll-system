import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, ShieldCheck, BarChart3, Users, Globe, Clock,
    ArrowRight, Check, Star, Menu, X, ChevronRight,
    Play, Shield, Award, Landmark, Layout, Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

/* ── Reusable centered container ── */
const Container = ({ children, className = '', narrow = false }) => (
    <div
        style={{ maxWidth: narrow ? '960px' : '1200px', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}
        className={className}
    >
        {children}
    </div>
);

/* ── Navbar ── */
const Nav = () => {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const links = [
        { label: 'Features', href: '#features' },
        { label: 'How It Works', href: '#how' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'About', href: '#about' },
    ];

    return (
        <nav
            style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}
            className={`transition-all duration-300 ${
                scrolled
                    ? 'bg-[#0A0F1E]/95 backdrop-blur-md border-b border-white/5'
                    : 'bg-transparent'
            }`}
        >
            <Container>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px', padding: '0 24px' }}>
                    {/* Logo */}
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                        <div style={{ width: 36, height: 36, background: '#2563EB', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Zap style={{ width: 20, height: 20, color: 'white', fill: 'white' }} />
                        </div>
                        <span style={{ fontSize: 20, fontWeight: 900, color: 'white', letterSpacing: '-0.03em', textTransform: 'uppercase', fontStyle: 'italic' }}>
                            PayrollPro
                        </span>
                    </Link>

                    {/* Desktop links */}
                    <div className="hidden lg:flex" style={{ display: undefined, alignItems: 'center', gap: 40 }}>
                        {links.map((l) => (
                            <a key={l.label} href={l.href} style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                onMouseEnter={e => e.target.style.color = 'white'}
                                onMouseLeave={e => e.target.style.color = '#94A3B8'}
                            >
                                {l.label}
                            </a>
                        ))}
                    </div>

                    {/* Desktop buttons */}
                    <div className="hidden lg:flex" style={{ display: undefined, alignItems: 'center', gap: 20 }}>
                        <Link to="/login" style={{ fontSize: 13, fontWeight: 600, color: '#CBD5E1', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Sign In
                        </Link>
                        <Link to="/login" style={{ fontSize: 13, fontWeight: 700, color: 'white', background: '#2563EB', padding: '10px 28px', borderRadius: 100, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile hamburger */}
                    <button onClick={() => setOpen(!open)} className="lg:hidden" style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                        {open ? <X style={{ width: 28, height: 28 }} /> : <Menu style={{ width: 28, height: 28 }} />}
                    </button>
                </div>
            </Container>

            {/* Mobile menu */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden"
                        style={{ background: '#0A0F1E', borderTop: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}
                    >
                        <Container>
                            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {links.map((l) => (
                                    <a key={l.label} href={l.href} onClick={() => setOpen(false)}
                                        style={{ fontSize: 16, fontWeight: 600, color: '#94A3B8', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        {l.label}
                                    </a>
                                ))}
                                <Link to="/login" style={{ display: 'block', textAlign: 'center', background: '#2563EB', color: 'white', padding: '14px', borderRadius: 12, fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Get Started
                                </Link>
                            </div>
                        </Container>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

/* ── Feature Card ── */
const FeatureCard = ({ icon: Icon, title, desc, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, delay }}
        style={{
            display: 'flex', flexDirection: 'column', height: '100%',
            padding: 32, borderRadius: 16,
            background: '#0F172A', border: '1px solid rgba(255,255,255,0.04)',
            transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
        onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(37,99,235,0.5)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(37,99,235,0.1)';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.boxShadow = 'none';
        }}
    >
        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <Icon style={{ width: 24, height: 24, color: '#2563EB' }} />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 12 }}>{title}</h3>
        <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7, flex: 1 }}>{desc}</p>
    </motion.div>
);

/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */
const LandingPage = () => {
    return (
        <div style={{ minHeight: '100vh', width: '100%', background: '#0A0F1E', color: '#CBD5E1', fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>
            <Nav />

            {/* ── HERO ── */}
            <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', overflow: 'hidden' }}>
                {/* Background blobs */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '55%', height: '55%', background: 'rgba(37,99,235,0.08)', borderRadius: '50%', filter: 'blur(140px)' }} />
                    <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '45%', height: '45%', background: 'rgba(30,58,138,0.12)', borderRadius: '50%', filter: 'blur(140px)' }} />
                </div>

                <Container narrow className="relative z-10">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 20px', borderRadius: 100, background: 'rgba(30,58,138,0.3)', border: '1px solid rgba(37,99,235,0.15)', color: '#2563EB', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 40 }}
                        >
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB' }} className="animate-pulse" />
                            Redefining the infrastructure of work
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 900, color: 'white', lineHeight: 1.08, letterSpacing: '-0.02em', marginBottom: 32, maxWidth: 800 }}
                        >
                            Payroll That Moves{' '}
                            <span style={{ color: '#2563EB', fontStyle: 'italic' }}>at the Speed</span>{' '}
                            of Business
                        </motion.h1>

                        {/* Subheadline */}
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#94A3B8', maxWidth: 560, marginBottom: 48, lineHeight: 1.7, fontWeight: 500 }}
                        >
                            Automate, comply, and pay your global team — in minutes, not days.
                        </motion.p>

                        {/* CTA buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 64 }}
                        >
                            <Link to="/login" style={{ background: '#2563EB', color: 'white', padding: '16px 40px', borderRadius: 100, fontSize: 16, fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em', boxShadow: '0 12px 40px rgba(37,99,235,0.25)' }}>
                                Start Free Trial
                            </Link>
                            <button style={{ background: 'transparent', color: 'white', padding: '16px 40px', borderRadius: 100, fontSize: 16, fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                Watch Demo
                            </button>
                        </motion.div>

                        {/* Trust badges */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '12px 40px' }}>
                            {[
                                { icon: Shield, text: 'ISO-9002 Certified' },
                                { icon: Landmark, text: 'FED-Level Compliant' },
                                { icon: Award, text: '2,000+ HR Teams' },
                            ].map(({ icon: Ic, text }) => (
                                <span key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#64748B' }}>
                                    <Ic style={{ width: 16, height: 16, color: '#2563EB' }} />
                                    {text}
                                </span>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>

            {/* ── TRUSTED LOGOS ── */}
            <section style={{ width: '100%', padding: '64px 0', borderTop: '1px solid rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.03)', overflow: 'hidden' }}>
                <p style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.45em', color: '#475569', marginBottom: 40 }}>
                    Trusted by industry leaders worldwide
                </p>
                <div style={{ overflow: 'hidden' }}>
                    <div className="animate-marquee" style={{ display: 'flex', alignItems: 'center', gap: 64, whiteSpace: 'nowrap', width: 'max-content' }}>
                        {[...Array(2)].flatMap((_, si) =>
                            ['Zenith', 'GTBank', 'Access', 'UBA', 'FirstBank', 'Stanbic', 'Kuda', 'Flutterwave'].map((name, i) => (
                                <div key={`${si}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 20, fontWeight: 700, color: '#334155', opacity: 0.4 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 6, background: '#1E293B' }} />
                                    {name}
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <style dangerouslySetInnerHTML={{ __html: `
                    @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
                    .animate-marquee { animation: marquee 28s linear infinite; }
                `}} />
            </section>

            {/* ── FEATURES ── */}
            <section id="features" style={{ width: '100%', padding: '112px 24px' }}>
                <Container>
                    {/* Heading */}
                    <div style={{ textAlign: 'center', marginBottom: 64, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
                        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: 20 }}>
                            Engineered for Excellence
                        </h2>
                        <p style={{ fontSize: 16, color: '#94A3B8', lineHeight: 1.7, fontWeight: 500 }}>
                            Everything you need to manage your global workforce — in one platform.
                        </p>
                    </div>

                    {/* Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                        <FeatureCard icon={Layout}      title="Quantum HR Portal"   desc="Self-service benefits, tax management, and historical payslips in one unified environment."       delay={0.05} />
                        <FeatureCard icon={Clock}       title="Autonomous Sync"     desc="Biometric and geolocation attendance tracking that feeds directly into your payroll pipeline."     delay={0.10} />
                        <FeatureCard icon={Globe}       title="Borderless Economy"  desc="Multi-currency disbursements with institutional-grade exchange rates and zero intermediary fees." delay={0.15} />
                        <FeatureCard icon={ShieldCheck} title="Smart Compliance"    desc="AI-driven regulatory engine that auto-updates for 50+ countries. Compliance handled as code."    delay={0.20} />
                        <FeatureCard icon={BarChart3}   title="Real-Time Analytics" desc="Live dashboards, payroll forecasting, and granular spend insights you can act on immediately."   delay={0.25} />
                        <FeatureCard icon={Lock}        title="Role-Based Access"   desc="Granular permission structures with immutable audit logs to protect your most sensitive data."    delay={0.30} />
                    </div>
                </Container>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section id="how" style={{ width: '100%', padding: '112px 24px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                <Container>
                    {/* Heading */}
                    <div style={{ textAlign: 'center', marginBottom: 80, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
                        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: 20 }}>
                            How It Works
                        </h2>
                        <p style={{ fontSize: 16, color: '#94A3B8', fontWeight: 500 }}>
                            Three steps to total organizational synchronization.
                        </p>
                    </div>

                    {/* Steps */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 48, position: 'relative' }}>
                        {[
                            { num: '01', title: 'Onboard Team', desc: 'Import your workforce data with deep-API integrations in seconds.' },
                            { num: '02', title: 'Configure Rules', desc: 'Set up custom tax codes, compliance rules, and payment cycles.' },
                            { num: '03', title: 'One-Click Pay', desc: 'Authorize the run — your global team gets paid instantly.' },
                        ].map((step) => (
                            <div key={step.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <div style={{ width: 96, height: 96, borderRadius: 16, background: '#0F172A', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 900, color: '#2563EB', marginBottom: 24 }}>
                                    {step.num}
                                </div>
                                <h4 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{step.title}</h4>
                                <p style={{ fontSize: 14, color: '#64748B', fontWeight: 500, lineHeight: 1.7, maxWidth: 260 }}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* ── TESTIMONIAL ── */}
            <section style={{ width: '100%', padding: '112px 24px' }}>
                <Container narrow>
                    <div style={{ borderRadius: 24, background: '#0F172A', border: '1px solid rgba(255,255,255,0.04)', padding: 'clamp(40px, 6vw, 80px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, width: 280, height: 280, background: 'rgba(37,99,235,0.04)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />

                        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
                            {/* Stars */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 32 }}>
                                {[1,2,3,4,5].map(i => <Star key={i} style={{ width: 20, height: 20, color: '#FBBF24', fill: '#FBBF24' }} />)}
                            </div>

                            <blockquote style={{ fontSize: 'clamp(1.25rem, 3vw, 2.25rem)', fontWeight: 700, color: 'white', fontStyle: 'italic', lineHeight: 1.3, letterSpacing: '-0.01em', marginBottom: 40 }}>
                                "Switching to PayrollPro was the best decision our HR department made. What used to take 3 days now takes 15 minutes."
                            </blockquote>

                            <div>
                                <p style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>Sarah Jenkins</p>
                                <p style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 4 }}>Director of People, TechNova</p>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* ── PRICING ── */}
            <section id="pricing" style={{ width: '100%', padding: '112px 24px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                <Container>
                    {/* Heading */}
                    <div style={{ textAlign: 'center', marginBottom: 64, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
                        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: 20 }}>
                            Simple Pricing
                        </h2>
                        <p style={{ fontSize: 16, color: '#94A3B8', lineHeight: 1.7, fontWeight: 500 }}>
                            Transparent plans for every stage of your company's growth.
                        </p>
                    </div>

                    {/* Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, maxWidth: 1000, marginLeft: 'auto', marginRight: 'auto' }}>
                        {/* Starter */}
                        <div style={{ display: 'flex', flexDirection: 'column', padding: 36, borderRadius: 16, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 20 }}>Starter</p>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 32 }}>
                                <span style={{ fontSize: 36, fontWeight: 900, color: 'white', letterSpacing: '-0.03em' }}>₦45k</span>
                                <span style={{ fontSize: 14, fontWeight: 600, color: '#64748B' }}>/mo</span>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, flex: 1 }}>
                                {['Up to 20 Employees', 'Automated Postings', 'Standard Reports', 'Email Support', 'Local Tax Sync'].map(f => (
                                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16, fontSize: 14, color: '#94A3B8', fontWeight: 500 }}>
                                        <Check style={{ width: 16, height: 16, color: '#2563EB', marginTop: 2, flexShrink: 0 }} /> {f}
                                    </li>
                                ))}
                            </ul>
                            <button style={{ width: '100%', padding: '14px 0', borderRadius: 12, background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 24 }}>
                                Choose Plan
                            </button>
                        </div>

                        {/* Growth — highlighted */}
                        <div style={{ display: 'flex', flexDirection: 'column', padding: 36, borderRadius: 16, background: '#0F172A', border: '2px solid #2563EB', boxShadow: '0 16px 48px rgba(37,99,235,0.12)', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)', background: '#2563EB', color: 'white', padding: '4px 20px', borderRadius: 100, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', whiteSpace: 'nowrap' }}>
                                Most Popular
                            </div>
                            <p style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 20 }}>Growth</p>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 32 }}>
                                <span style={{ fontSize: 36, fontWeight: 900, color: 'white', letterSpacing: '-0.03em' }}>₦120k</span>
                                <span style={{ fontSize: 14, fontWeight: 600, color: '#64748B' }}>/mo</span>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, flex: 1 }}>
                                {['Up to 100 Employees', 'Multi-country Payroll', 'Priority Disbursement', 'Live API Access', 'Slack + Phone Support'].map(f => (
                                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16, fontSize: 14, color: 'white', fontWeight: 500 }}>
                                        <Check style={{ width: 16, height: 16, color: '#2563EB', marginTop: 2, flexShrink: 0 }} /> {f}
                                    </li>
                                ))}
                            </ul>
                            <button style={{ width: '100%', padding: '14px 0', borderRadius: 12, background: '#2563EB', color: 'white', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em', boxShadow: '0 8px 24px rgba(37,99,235,0.2)', marginTop: 24 }}>
                                Choose Plan
                            </button>
                        </div>

                        {/* Enterprise */}
                        <div style={{ display: 'flex', flexDirection: 'column', padding: 36, borderRadius: 16, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 20 }}>Enterprise</p>
                            <div style={{ marginBottom: 32 }}>
                                <span style={{ fontSize: 36, fontWeight: 900, color: 'white', letterSpacing: '-0.03em' }}>Custom</span>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, flex: 1 }}>
                                {['Unlimited Employees', 'Dedicated Custodian', 'Hardware Key Auth', 'SLA Guarantee', 'On-premise Option'].map(f => (
                                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16, fontSize: 14, color: '#94A3B8', fontWeight: 500 }}>
                                        <Check style={{ width: 16, height: 16, color: '#2563EB', marginTop: 2, flexShrink: 0 }} /> {f}
                                    </li>
                                ))}
                            </ul>
                            <button style={{ width: '100%', padding: '14px 0', borderRadius: 12, background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 24 }}>
                                Contact Sales
                            </button>
                        </div>
                    </div>
                </Container>
            </section>

            {/* ── CTA BANNER ── */}
            <section style={{ width: '100%', padding: '112px 24px' }}>
                <Container narrow>
                    <div style={{ background: '#2563EB', borderRadius: 24, padding: 'clamp(40px, 6vw, 80px)', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)', pointerEvents: 'none' }} />
                        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
                            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 3.5rem)', fontWeight: 900, marginBottom: 24, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                                Ready to transcend legacy payroll?
                            </h2>
                            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'rgba(219,234,254,0.9)', marginBottom: 40, fontWeight: 500, lineHeight: 1.6 }}>
                                Join 2,000+ HR visionaries running their global workforce on PayrollPro.
                            </p>
                            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#2563EB', padding: '16px 40px', borderRadius: 100, fontSize: 16, fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}>
                                Start Your Free Trial
                                <ChevronRight style={{ width: 20, height: 20 }} />
                            </Link>
                        </div>
                    </div>
                </Container>
            </section>

            {/* ── FOOTER ── */}
            <footer id="about" style={{ width: '100%', padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                <Container>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '40px 48px', marginBottom: 64 }}>
                        {/* Brand */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                <div style={{ width: 32, height: 32, background: '#2563EB', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Zap style={{ width: 16, height: 16, color: 'white', fill: 'white' }} />
                                </div>
                                <span style={{ fontSize: 18, fontWeight: 900, color: 'white', letterSpacing: '-0.03em', textTransform: 'uppercase', fontStyle: 'italic' }}>PayrollPro</span>
                            </div>
                            <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, fontWeight: 500, maxWidth: 260 }}>
                                Redefining the infrastructure of work. The most advanced payroll platform for the digital-first era.
                            </p>
                        </div>

                        {/* Link columns */}
                        {[
                            { heading: 'Ecosystem', items: ['Core Engine', 'Global Pay', 'Compliance', 'Integrations'] },
                            { heading: 'Foundation', items: ['Our Vision', 'Careers', 'Insights', 'Newsroom'] },
                            { heading: 'Security', items: ['Trust Center', 'Privacy', 'Protocol'] },
                            { heading: 'Support', items: ['Documentation', 'Help Center', 'Status'] },
                        ].map((col) => (
                            <div key={col.heading}>
                                <h4 style={{ fontSize: 11, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: 20 }}>{col.heading}</h4>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {col.items.map(item => (
                                        <li key={item} style={{ marginBottom: 12 }}>
                                            <a href="#" style={{ fontSize: 14, color: '#64748B', textDecoration: 'none', fontWeight: 500 }}
                                                onMouseEnter={e => e.target.style.color = '#2563EB'}
                                                onMouseLeave={e => e.target.style.color = '#64748B'}
                                            >{item}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Bottom bar */}
                    <div style={{ paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                            © 2026 PayrollPro. All rights reserved.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                            {[
                                { icon: Shield, label: 'PCI-DSS' },
                                { icon: Landmark, label: 'SOC-2' },
                                { icon: Award, label: 'ISO 27001' },
                            ].map(({ icon: Ic, label }) => (
                                <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    <Ic style={{ width: 14, height: 14 }} /> {label}
                                </span>
                            ))}
                        </div>
                    </div>
                </Container>
            </footer>
        </div>
    );
};

export default LandingPage;
