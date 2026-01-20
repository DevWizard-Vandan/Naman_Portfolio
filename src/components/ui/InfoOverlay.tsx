import { useFlightStore } from '@/store/store';
import { skills, aboutSections } from '@/data/user_data';
import { useEffect } from 'react';

export function InfoOverlay() {
    const { activeSection, setActiveSection } = useFlightStore();

    // Handle ESC to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Escape') {
                setActiveSection(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setActiveSection]);

    if (!activeSection) return null;

    const renderContent = () => {
        switch (activeSection) {
            case 'skills':
                return <SkillsContent />;
            case 'about':
                return <AboutContent />;
            case 'contact':
                return <ContactContent />;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
                onClick={() => setActiveSection(null)}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto mx-4 rounded-2xl border border-white/10 shadow-2xl bg-[#050510]/95 scrollbar-hide">

                {/* Close Button */}
                <button
                    onClick={() => setActiveSection(null)}
                    className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 transition-all hover:rotate-90"
                >
                    <span className="text-white text-xl">×</span>
                </button>

                <div className="p-8 md:p-12">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

function SkillsContent() {
    // Group skills by category
    const categories = Array.from(new Set(skills.map(s => s.category)));

    return (
        <div className="space-y-8">
            <header className="text-center mb-12">
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2 font-cinzel">
                    Technical Arsenal
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-cyan-400 to-blue-600 mx-auto rounded-full" />
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {categories.map((category) => (
                    <div key={category} className="space-y-4">
                        <h3 className="text-xl font-bold text-white/80 uppercase tracking-widest border-b border-white/10 pb-2">
                            {category.replace('-', ' ')}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {skills.filter(s => s.category === category).map(skill => (
                                <div
                                    key={skill.id}
                                    className="group relative p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/50 transition-all duration-300"
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-cyan-100 group-hover:text-cyan-400 transition-colors">
                                            {skill.name}
                                        </span>
                                        <span className="text-xs text-white/40 font-mono">
                                            {skill.proficiency}%
                                        </span>
                                    </div>
                                    <div className="h-1 w-full bg-black/50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 transition-all duration-1000 ease-out group-hover:scale-x-110 origin-left"
                                            style={{ width: `${skill.proficiency}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AboutContent() {
    return (
        <div className="space-y-8 text-center md:text-left">
            <header className="text-center mb-12">
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-600 mb-2 font-cinzel">
                    The Pilot's Log
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-emerald-400 to-green-600 mx-auto rounded-full" />
            </header>

            <div className="grid grid-cols-1 gap-8">
                {aboutSections.map((section, idx) => (
                    <div
                        key={idx}
                        className="relative p-6 rounded-xl bg-white/5 border border-emerald-500/20 hover:border-emerald-500/50 transition-all group"
                    >
                        <div className="absolute -left-1 top-6 w-1 h-12 bg-emerald-500/50 group-hover:h-full group-hover:top-0 transition-all duration-300 rounded-r" />
                        <h3 className="text-2xl font-bold text-emerald-300 mb-3 font-cinzel">
                            {section.title}
                        </h3>
                        <p className="text-gray-300 leading-relaxed text-lg">
                            {section.content}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ContactContent() {
    return (
        <div className="text-center max-w-2xl mx-auto space-y-10">
            <header className="mb-12">
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2 font-cinzel">
                    Initialize Comms link
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-purple-400 to-pink-600 mx-auto rounded-full" />
            </header>

            <div className="grid gap-6">
                <a
                    href="mailto:naman@example.com"
                    className="group p-6 rounded-xl bg-white/5 border border-purple-500/20 hover:border-purple-500/60 hover:bg-white/10 transition-all flex items-center justify-center gap-4"
                >
                    <span className="text-2xl">📧</span>
                    <span className="text-xl text-purple-200 group-hover:text-purple-400 font-mono">
                        naman.sharma@example.com
                    </span>
                </a>

                <div className="grid grid-cols-2 gap-4">
                    <a
                        href="https://github.com/naman"
                        target="_blank"
                        rel="noreferrer"
                        className="p-6 rounded-xl bg-[#24292e] hover:bg-[#2f363d] border border-white/10 transition-all flex flex-col items-center gap-2 group"
                    >
                        <span className="text-3xl group-hover:scale-110 transition-transform">🐙</span>
                        <span className="font-bold text-white">GitHub</span>
                    </a>
                    <a
                        href="https://linkedin.com/in/naman"
                        target="_blank"
                        rel="noreferrer"
                        className="p-6 rounded-xl bg-[#0077b5] hover:bg-[#0088cc] border border-white/10 transition-all flex flex-col items-center gap-2 group"
                    >
                        <span className="text-3xl font-bold text-white group-hover:scale-110 transition-transform">in</span>
                        <span className="font-bold text-white">LinkedIn</span>
                    </a>
                </div>
            </div>

            <p className="text-gray-400 mt-8 font-mono text-sm">
                // TRANSMISSION ENCRYPTED<br />
                // READY TO CONNECT
            </p>
        </div>
    );
}
