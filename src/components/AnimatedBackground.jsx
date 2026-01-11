import React from 'react';

export default function StaticStarfield() {
    // Generate random stars with varying properties
    const generateStars = () => {
        const stars = [];
        const numStars = 650;

        for (let i = 0; i < numStars; i++) {
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const size = Math.random() * 3 + 1;
            const opacity = Math.random() * 0.7 + 0.3;
            const blur = Math.random() * 2;

            stars.push({
                left: `${x}%`,
                top: `${y}%`,
                width: `${size}px`,
                height: `${size}px`,
                opacity: opacity,
                filter: `blur(${blur}px)`,
                backgroundColor: 'white',
                borderRadius: '50%',
                position: 'absolute',
                boxShadow: blur < 0.5 ? '0 0 2px rgba(255, 255, 255, 0.8)' : 'none'
            });
        }

        return stars;
    };

    const stars = generateStars();

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none',
                overflow: 'hidden'
            }}
        >
            {stars.map((style, index) => (
                <div key={index} style={style} />
            ))}
        </div>
    );
}
