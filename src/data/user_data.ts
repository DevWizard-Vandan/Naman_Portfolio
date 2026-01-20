// Naman's Portfolio Data - Structured for 3D Diegetic Display
// This data is rendered as physical objects in the game world

// ============================================================
// ABOUT ME - Rendered as Holographic Stone Tablets in Zone 1
// ============================================================
export interface AboutSection {
    id: string;
    title: string;
    content: string;
    glowColor: string;
}

export const aboutSections: AboutSection[] = [
    {
        id: 'intro',
        title: 'THE ARCHITECT',
        content: 'Full-Stack Developer & AI Engineer crafting experiences at the intersection of code and creativity.',
        glowColor: '#ffd700'
    },
    {
        id: 'mission',
        title: 'THE MISSION',
        content: 'Building intelligent systems that bridge ancient wisdom with cutting-edge technology.',
        glowColor: '#00ffff'
    },
    {
        id: 'journey',
        title: 'THE JOURNEY',
        content: 'From neural networks to interactive 3D worlds, every project is a step toward the future.',
        glowColor: '#ff00ff'
    }
];

// ============================================================
// SKILLS - Rendered as Data Crystals in Zone 2
// ============================================================
export type SkillCategory = 'languages' | 'ai' | 'frameworks' | 'tools';

export interface Skill {
    id: string;
    name: string;
    category: SkillCategory;
    proficiency: number; // 1-100, affects crystal size
}

// Crystal color mapping by category
export const crystalColors: Record<SkillCategory, string> = {
    languages: '#4f9eff',  // Blue
    ai: '#ff4444',         // Red
    frameworks: '#00ffff', // Cyan
    tools: '#ffd700'       // Gold
};

export const skills: Skill[] = [
    // Languages (Blue Crystals)
    { id: 'python', name: 'Python', category: 'languages', proficiency: 95 },
    { id: 'javascript', name: 'JavaScript', category: 'languages', proficiency: 90 },
    { id: 'typescript', name: 'TypeScript', category: 'languages', proficiency: 88 },
    { id: 'cpp', name: 'C++', category: 'languages', proficiency: 75 },
    { id: 'rust', name: 'Rust', category: 'languages', proficiency: 60 },

    // AI/ML (Red Crystals)
    { id: 'pytorch', name: 'PyTorch', category: 'ai', proficiency: 92 },
    { id: 'tensorflow', name: 'TensorFlow', category: 'ai', proficiency: 85 },
    { id: 'yolo', name: 'YOLO', category: 'ai', proficiency: 88 },
    { id: 'opencv', name: 'OpenCV', category: 'ai', proficiency: 90 },
    { id: 'langchain', name: 'LangChain', category: 'ai', proficiency: 80 },

    // Frameworks (Cyan Crystals)
    { id: 'react', name: 'React', category: 'frameworks', proficiency: 92 },
    { id: 'nextjs', name: 'Next.js', category: 'frameworks', proficiency: 88 },
    { id: 'threejs', name: 'Three.js', category: 'frameworks', proficiency: 85 },
    { id: 'fastapi', name: 'FastAPI', category: 'frameworks', proficiency: 90 },
    { id: 'ros2', name: 'ROS2', category: 'frameworks', proficiency: 75 },

    // Tools (Gold Crystals)
    { id: 'docker', name: 'Docker', category: 'tools', proficiency: 88 },
    { id: 'git', name: 'Git', category: 'tools', proficiency: 95 },
    { id: 'linux', name: 'Linux', category: 'tools', proficiency: 90 },
    { id: 'aws', name: 'AWS', category: 'tools', proficiency: 78 },
    { id: 'blender', name: 'Blender', category: 'tools', proficiency: 70 }
];

// ============================================================
// CONTACT / SOCIAL - Future expansion
// ============================================================
export interface SocialLink {
    id: string;
    platform: string;
    url: string;
    icon: string;
}

export const socialLinks: SocialLink[] = [
    { id: 'github', platform: 'GitHub', url: 'https://github.com/naman', icon: 'github' },
    { id: 'linkedin', platform: 'LinkedIn', url: 'https://linkedin.com/in/naman', icon: 'linkedin' },
    { id: 'twitter', platform: 'Twitter', url: 'https://twitter.com/naman', icon: 'twitter' }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================
export function getSkillsByCategory(category: SkillCategory): Skill[] {
    return skills.filter(s => s.category === category);
}

export function getCrystalColor(category: SkillCategory): string {
    return crystalColors[category];
}

export function getSkillById(id: string): Skill | undefined {
    return skills.find(s => s.id === id);
}
