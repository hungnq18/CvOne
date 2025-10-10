"use client";

import gsap from "gsap";
import { useEffect, useState } from "react";

export default function useAnimatedButtons() {
  useEffect(() => {
    const buttons = document.querySelectorAll('.animated-button');
    const intervals: NodeJS.Timeout[] = [];

    buttons.forEach((button) => {
      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.inset = '0';
      div.style.pointerEvents = 'none';
      div.style.borderRadius = '10px';
      div.style.overflow = 'hidden';

      const span = button.querySelector('span');
      let colorWhite = true;

      button.appendChild(div);

      const noise = document.createElement('div');
      noise.style.position = 'absolute';
      noise.style.inset = '0';
      noise.style.backgroundImage = "url('https://assets.codepen.io/165585/noise_1.png')";
      noise.style.backgroundSize = 'cover';
      noise.style.opacity = '.15';
      noise.style.mixBlendMode = 'overlay';
      noise.style.zIndex = '2';
      div.appendChild(noise);

      const createSvg = (fillColor: string) => {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.setAttribute("viewBox", "0 0 147 60");
        svg.setAttribute("fill", "none");
        svg.setAttribute("preserveAspectRatio", "none");
        svg.style.position = 'absolute';
        svg.style.mixBlendMode = 'overlay';
        svg.style.filter = 'blur(3px)';

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M146.5 2.00038C120 -1 104 6.00038 73.75 30.0004C43.5 54.0004 19.5 60.5004 1 58.0004");
        path.setAttribute("stroke", fillColor);
        path.setAttribute("stroke-width", "2");

        svg.appendChild(path);
        return svg;
      };

      const animateSVG = () => {
        const svg = createSvg(colorWhite ? 'white' : 'black');
        colorWhite = !colorWhite;
        div.appendChild(svg);

        gsap.to(svg, {
          opacity: gsap.utils.random(0.5, 0.65),
        });

        gsap.set(svg, {
          left: gsap.utils.random(25, 100) + '%',
          top: gsap.utils.random(25, 100) + '%',
        });

        gsap.to(svg, {
          x: '-200%',
          y: '-200%',
          duration: gsap.utils.random(14, 20),
          onComplete: () => svg.remove(),
        });
      };

      const intervalId = setInterval(animateSVG, 1000);
      intervals.push(intervalId);

      gsap.to(button, {
        '--alternative-gradient-opacity': 0.25,
        yoyo: true,
        repeat: -1,
        duration: 5,
        repeatDelay: 10,
      });

      const onClick = () => {
        if (span) {
          gsap.to(span, {
            '--button-glow-1-scale': '1.2',
            '--button-glow-1-blur': '12px',
            duration: 0.6,
            clearProps: true,
          });
          gsap.to(span, {
            keyframes: [
              { '--button-glow-1-opacity': '0.8', duration: 0.15 },
              { '--button-glow-1-opacity': '0', duration: 0.15, delay: 0.3 },
            ],
          });
          gsap.to(span, {
            '--button-glow-2-scale': '1.2',
            '--button-glow-2-blur': '10px',
            duration: 0.6,
            delay: 0.1,
            clearProps: true,
          });
          gsap.to(span, {
            keyframes: [
              { '--button-glow-2-opacity': '0.8', duration: 0.15, delay: 0.1 },
              { '--button-glow-2-opacity': '0', duration: 0.15, delay: 0.3 },
            ],
          });
        }
      };

      button.addEventListener('click', onClick);

      // Cleanup function
      const cleanup = () => {
        button.removeEventListener('click', onClick);
        clearInterval(intervalId);
      };

      // Store cleanup function for later use
      (button as any).__cleanup = cleanup;
    });

    return () => {
      intervals.forEach(clearInterval);
      buttons.forEach((button) => {
        if ((button as any).__cleanup) {
          (button as any).__cleanup();
        }
      });
    };
  }, []);
}

// Additional utility functions for user dashboard
export const useDashboardAnimations = () => {
  useEffect(() => {
    // Fade in animation for dashboard cards
    gsap.fromTo('.dashboard-card', 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }
    );

    // Animate progress bars
    gsap.fromTo('.progress-bar', 
      { width: '0%' },
      { width: '100%', duration: 1.5, ease: 'power2.out' }
    );

    // Animate stats counters
    const counters = document.querySelectorAll('.stat-counter');
    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute('data-target') || '0');
      gsap.to(counter, {
        innerHTML: target,
        duration: 2,
        ease: 'power2.out',
        snap: { innerHTML: 1 },
        onUpdate: function() {
          counter.innerHTML = Math.ceil(Number(this.targets()[0].innerHTML)).toString();
        }
      });
    });
  }, []);
};

// Dashboard state management
export const useDashboardState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalCVs: 0,
    totalApplications: 0,
    successRate: 0,
    recentActivity: []
  });

  const updateStats = (newStats: Partial<typeof stats>) => {
    setStats(prev => ({ ...prev, ...newStats }));
  };

  const switchTab = (tab: string) => {
    setActiveTab(tab);
    // Add tab switch animation
    gsap.to('.tab-content', {
      opacity: 0,
      y: 10,
      duration: 0.3,
      onComplete: () => {
        gsap.to('.tab-content', {
          opacity: 1,
          y: 0,
          duration: 0.3
        });
      }
    });
  };

  return {
    isLoading,
    setIsLoading,
    activeTab,
    switchTab,
    stats,
    updateStats
  };
};

