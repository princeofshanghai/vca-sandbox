import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

interface VcaLogoProps {
  className?: string;
}

const VcaLogo = ({ className }: VcaLogoProps) => {
  return (
    <Link to="/" className={cn("flex items-center", className)}>
      <img
        src="/vca-logo.png"
        alt="VCA"
        className="h-full w-auto"
      />
    </Link>
  );
};

export default VcaLogo;

