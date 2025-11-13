import { useNavigate } from 'react-router-dom';
import ParticleBackground from '@/components/ParticleBackground';
import { Button } from '@/components/ui/button';

const HomeView = () => {
  const navigate = useNavigate();

  return (
    <div className="relative h-full w-full bg-white overflow-hidden">
      {/* Particle background effect */}
      <ParticleBackground />
      
      {/* Content centered on the page */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <div className="flex flex-col gap-4">
          {/* View Components Button */}
          <Button
            size="lg"
            onClick={() => navigate('/foundations/typography')}
            className="bg-black text-white hover:bg-gray-800 text-base"
          >
            View components
          </Button>
          
          {/* View Playground Button */}
          <Button
            size="lg"
            onClick={() => navigate('/flows')}
            className="bg-black text-white hover:bg-gray-800 text-base"
          >
            View playground
          </Button>
          
          {/* View Figma Kit Button */}
          <Button
            size="lg"
            onClick={() => window.open('https://www.figma.com/design/mIZ0RhTTUQYe6JE1H5n2Lu/VCA-Sandbox-v0?node-id=47-223&t=94pjORtOl7i7GnXw-1', '_blank', 'noopener,noreferrer')}
            className="bg-black text-white hover:bg-gray-800 text-base flex items-center gap-2"
          >
            <img 
              src="/figma-logo.svg" 
              alt="Figma" 
              className="h-4 w-4"
            />
            View Figma kit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomeView;

