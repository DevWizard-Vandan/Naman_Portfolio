// Project data for the 3 portal destinations
export interface Project {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    techStack: string[];
    links: {
        github?: string;
        live?: string;
        demo?: string;
    };
    color: string; // Accent color for the portal
}

export const projects: Project[] = [
    {
        id: 'drone-nav',
        title: 'Autonomous Drone Navigation',
        subtitle: 'Computer Vision & Path Planning',
        description: 'A real-time drone navigation system using computer vision and SLAM algorithms. Features obstacle avoidance, waypoint navigation, and autonomous landing capabilities.',
        techStack: ['Python', 'OpenCV', 'ROS2', 'TensorFlow', 'PX4'],
        links: {
            github: 'https://github.com/naman/drone-nav',
            demo: 'https://youtube.com/watch?v=demo'
        },
        color: '#00ffff' // Cyan
    },
    {
        id: 'brain-tumor',
        title: 'Brain Tumor Detection',
        subtitle: 'Deep Learning for Medical Imaging',
        description: 'An AI-powered diagnostic tool that analyzes MRI scans to detect and classify brain tumors with 97.3% accuracy. Built for radiologists to accelerate diagnosis.',
        techStack: ['PyTorch', 'MONAI', 'FastAPI', 'React', 'Docker'],
        links: {
            github: 'https://github.com/naman/brain-tumor-ai',
            live: 'https://brain-tumor-ai.vercel.app'
        },
        color: '#ff00ff' // Magenta
    },
    {
        id: 'cyber-vedic',
        title: 'Cyber-Vedic OS',
        subtitle: 'Ancient Wisdom × Modern Technology',
        description: 'A concept operating system interface that merges traditional Vedic design principles with cutting-edge cyberpunk aesthetics. Features procedural mandalas and sacred geometry UI.',
        techStack: ['Three.js', 'WebGL', 'React', 'Zustand', 'GLSL'],
        links: {
            github: 'https://github.com/naman/cyber-vedic',
            live: 'https://cyber-vedic.vercel.app'
        },
        color: '#ffd700' // Gold
    }
];

export function getProjectById(id: string): Project | undefined {
    return projects.find(p => p.id === id);
}
