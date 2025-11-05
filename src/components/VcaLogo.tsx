import { Link } from 'react-router-dom';

const VcaLogo = () => {
  return (
    <Link to="/components" className="flex items-center">
      <img 
        src="/vca-logo.png" 
        alt="VCA" 
        className="h-8"
      />
    </Link>
  );
};

export default VcaLogo;

