'use client';

import { useEffect } from 'react';
import { useFlightStore } from '@/store/store';
import { getProjectById } from '@/data/projects';

export function ProjectModal() {
    const { currentProjectId, setCurrentProject, unlockedProjects } = useFlightStore();
    const project = currentProjectId ? getProjectById(currentProjectId) : null;

    // Handle ESC key to close modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Escape' && currentProjectId) {
                setCurrentProject(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentProjectId, setCurrentProject]);

    if (!project) return null;

    const isUnlocked = unlockedProjects.includes(project.id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setCurrentProject(null)}
            />

            {/* Modal Content */}
            <div
                className="relative max-w-2xl w-full mx-4 p-8 rounded-2xl"
                style={{
                    background: 'rgba(10, 10, 20, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${project.color}40`,
                    boxShadow: `0 0 60px ${project.color}20, inset 0 0 60px ${project.color}05`
                }}
            >
                {/* Close Button */}
                <button
                    onClick={() => setCurrentProject(null)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{
                        background: `${project.color}20`,
                        border: `1px solid ${project.color}40`
                    }}
                >
                    <span className="text-white text-xl">×</span>
                </button>

                {/* Title Section */}
                <div className="mb-6">
                    <h2
                        className="text-3xl font-bold tracking-wide mb-2"
                        style={{
                            color: project.color,
                            fontFamily: 'Cinzel, serif',
                            textShadow: `0 0 20px ${project.color}80`
                        }}
                    >
                        {project.title}
                    </h2>
                    <p className="text-cyan-400/70 tracking-widest text-sm uppercase">
                        {project.subtitle}
                    </p>
                </div>

                {/* Description */}
                <p className="text-gray-300 leading-relaxed mb-6">
                    {project.description}
                </p>

                {/* Tech Stack */}
                <div className="mb-6">
                    <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3">
                        Technology Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {project.techStack.map((tech) => (
                            <span
                                key={tech}
                                className="px-3 py-1 rounded-full text-sm"
                                style={{
                                    background: `${project.color}15`,
                                    border: `1px solid ${project.color}30`,
                                    color: project.color
                                }}
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Links */}
                <div className="flex gap-4">
                    {project.links.github && (
                        <a
                            href={project.links.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 rounded-lg flex items-center gap-2 transition-all hover:scale-105"
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            <span className="text-white">GitHub</span>
                        </a>
                    )}
                    {project.links.live && (
                        <a
                            href={project.links.live}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 rounded-lg flex items-center gap-2 transition-all hover:scale-105"
                            style={{
                                background: `${project.color}20`,
                                border: `1px solid ${project.color}40`,
                                color: project.color
                            }}
                        >
                            <span>Live Demo</span>
                        </a>
                    )}
                    {project.links.demo && (
                        <a
                            href={project.links.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 rounded-lg flex items-center gap-2 transition-all hover:scale-105"
                            style={{
                                background: 'rgba(255,100,0,0.1)',
                                border: '1px solid rgba(255,100,0,0.3)',
                                color: '#ff6600'
                            }}
                        >
                            <span>Watch Demo</span>
                        </a>
                    )}
                </div>

                {/* Unlocked Badge */}
                {isUnlocked && (
                    <div
                        className="absolute -top-3 -right-3 px-4 py-1 rounded-full text-xs uppercase tracking-wider"
                        style={{
                            background: '#00ff8820',
                            border: '1px solid #00ff8850',
                            color: '#00ff88'
                        }}
                    >
                        ✓ Discovered
                    </div>
                )}

                {/* Hint to close */}
                <div className="mt-6 text-center text-xs text-gray-500">
                    Press <kbd className="px-2 py-0.5 bg-gray-800 rounded mx-1">ESC</kbd> or click outside to close
                </div>
            </div>
        </div>
    );
}
