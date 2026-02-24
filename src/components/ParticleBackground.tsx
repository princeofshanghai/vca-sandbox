import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type Container, type ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { useApp } from "@/contexts/AppContext";

const ParticleBackground = () => {
  const [init, setInit] = useState(false);
  const { state } = useApp();

  // Initialize the particles engine only once
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // Load only the features you need to keep it lightweight
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (_container?: Container): Promise<void> => {
    // Particles have finished loading
  };

  // Configuration for the sand/dust particle effect
  const options: ISourceOptions = useMemo(
    () => {
      const styles =
        typeof window !== "undefined"
          ? window.getComputedStyle(document.documentElement)
          : null;

      const baseMutedToken = state.theme === "dark" ? "--shell-muted-strong" : "--shell-muted";
      const muted = styles?.getPropertyValue(baseMutedToken).trim();
      const mutedStrong = styles?.getPropertyValue("--shell-muted-strong").trim();
      const particleColors = [muted, mutedStrong]
        .filter(Boolean)
        .map((channels) => `rgb(${channels})`);

      return {
        background: {
          color: {
            value: "transparent", // Transparent so your UI shows through
          },
        },
        fpsLimit: 60,
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "repulse", // Particles move away from cursor like sand
            },
            resize: {
              enable: true,
              delay: 0.5,
            },
          },
          modes: {
            repulse: {
              distance: 120, // How far particles react to cursor
              duration: 0.4,
              speed: 1,
              maxSpeed: 50,
            },
          },
        },
        particles: {
          color: {
            value: particleColors.length > 0 ? particleColors : ["currentColor"],
          }, // Theme-aware neutral palette
          links: {
            enable: false, // No connecting lines - just particles
          },
          move: {
            enable: true,
            speed: 0.8, // Slow, gentle movement
            direction: "none",
            random: true,
            straight: false,
            outModes: {
              default: "bounce", // Bounce off edges to keep them clustered
            },
          },
          number: {
            density: {
              enable: true,
              width: 800,
              height: 800,
            },
            value: 2000, // Dense sand cluster with many particles
          },
          opacity: {
            value: { min: 0.3, max: 0.8 }, // Keep opacity varied for depth
            animation: {
              enable: true,
              speed: 0.3,
              sync: false,
            },
          },
          shape: {
            type: "circle", // Simple dots
          },
          size: {
            value: { min: 0.5, max: 2 }, // Small like sand grains
          },
          // Cluster particles more toward the center
          position: {
            x: 100,
            y: 100,
          },
        },
        detectRetina: true,
      };
    },
    [state.theme]
  );

  if (!init) {
    return null;
  }

  return (
    <Particles
      id="tsparticles"
      particlesLoaded={particlesLoaded}
      options={options}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}
    />
  );
};

export default ParticleBackground;
