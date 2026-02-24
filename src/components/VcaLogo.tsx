import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

interface VcaLogoProps {
  className?: string;
  autoInvertInDark?: boolean;
}

const VcaLogo = ({ className, autoInvertInDark = false }: VcaLogoProps) => {
  return (
    <Link
      to="/"
      className={cn(
        "flex items-center",
        autoInvertInDark && "dark:[&_img]:invert dark:[&_img]:brightness-110",
        className
      )}
    >
      <img
        src="/vca-logo.png"
        alt="VCA"
        className="h-full w-auto"
      />
    </Link>
  );
};

export default VcaLogo;
