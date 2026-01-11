import React, { useMemo } from 'react';
import './AnimatedBackground.css';

export default function StaticStarfield() {
    // Generate random stars with varying properties - memoized to prevent regeneration
    const stars = useMemo(() => {
        const starsArray = [];
        const numStars = 650;

        for (let i = 0; i < numStars; i++) {
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const size = Math.random() * 3 + 1;
            const opacity = Math.random() * 0.7 + 0.3;
            const blur = Math.random() * 2;
            const shouldSparkle = Math.random() < 0.05; // Only 5% of stars sparkle

            starsArray.push({
                left: `${x}%`,
                top: `${y}%`,
                width: `${size}px`,
                height: `${size}px`,
                opacity: opacity,
                filter: `blur(${blur}px)`,
                backgroundColor: 'white',
                borderRadius: '50%',
                position: 'absolute',
                boxShadow: blur < 0.5 ? '0 0 2px rgba(255, 255, 255, 0.8)' : 'none',
                animation: shouldSparkle ? `sparkle ${3 + Math.random() * 4}s ease-in-out infinite` : 'none',
                animationDelay: `${Math.random() * 10}s`
            });
        }

        return starsArray;
    }, []); // Empty dependency array - only generate once

    // Generate random shooting stars - memoized
    const shootingStars = useMemo(() => {
        const shootingStarsArray = [];
        const numShootingStars = 3;

        for (let i = 0; i < numShootingStars; i++) {
            const startX = Math.random() * 100;
            const startY = Math.random() * 60; // Keep in upper portion
            const delay = Math.random() * 60 + 30; // 30-90 seconds delay

            shootingStarsArray.push({
                top: `${startY}%`,
                left: `${startX}%`,
                animationDelay: `${delay}s`
            });
        }

        return shootingStarsArray;
    }, []); // Empty dependency array - only generate once

    return (
        <div className="starfield-container">
            {/* Static stars with occasional sparkle */}
            {stars.map((style, index) => (
                <div key={index} style={style} />
            ))}

            {/* Shooting stars with random positions */}
            {shootingStars.map((style, index) => (
                <div
                    key={`shooting-${index}`}
                    className="shooting-star"
                    style={style}
                />
            ))}
        </div>
    );
}
