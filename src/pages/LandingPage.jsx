import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import { Code, Users, Cpu, Lock, Zap, Globe } from 'lucide-react';

export default function LandingPage() {
    const features = [
        {
            icon: <Code size={32} />,
            title: 'Real-time Collaboration',
            description: 'Code together in real-time with your team. See changes instantly as they happen.'
        },
        {
            icon: <Users size={32} />,
            title: 'Multiple Users',
            description: 'Invite unlimited collaborators to your coding sessions. Perfect for pair programming.'
        },
        {
            icon: <Cpu size={32} />,
            title: 'AI Autocomplete',
            description: 'Powered by AI to suggest code completions and help you write better code faster.'
        },
        {
            icon: <Lock size={32} />,
            title: 'Private Rooms',
            description: 'Create password-protected rooms for sensitive projects and private collaboration.'
        },
        {
            icon: <Zap size={32} />,
            title: 'Instant Execution',
            description: 'Run your code directly in the browser. Support for Python, JavaScript, and more.'
        },
        {
            icon: <Globe size={32} />,
            title: 'Access Anywhere',
            description: 'No installation required. Code from any device with just a web browser.'
        }
    ];

    return (
        <div className="landing-page">
            <AnimatedBackground />

            {/* Hero Section */}
            <section className="hero-section">
                <div className="glass-card hero-card">
                    <h1 className="hero-title">
                        <span className="gradient-text"> Pair Programmer </span>
                    </h1>
                    <p className="hero-subtitle">
                        The ultimate collaborative coding platform. Write, share, and execute code together in real-time.
                    </p>
                    <div className="hero-cta">
                        <Link to="/login" className="primary-btn cta-btn">
                            Login to Continue
                        </Link>
                        <Link to="/register" className="secondary-btn cta-btn">
                            Create Account
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <h2 className="section-title">Why Choose Pair Programmer?</h2>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="glass-card feature-card">
                            <div className="feature-icon">{feature.icon}</div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Call to Action */}
            {/* <section className="cta-section">
                <div className="glass-card cta-card">
                    <h2 className="cta-title">Ready to Start Coding Together?</h2>
                    <p className="cta-description">
                        Join thousands of developers who collaborate seamlessly with Pair Programmer.
                    </p>
                    <Link to="/register" className="primary-btn cta-btn large">
                        Get Started Free
                    </Link>
                </div>
            </section>
            */}
            
            <footer className="landing-footer">
                <p></p>
            </footer> 
        </div>
    );
}
