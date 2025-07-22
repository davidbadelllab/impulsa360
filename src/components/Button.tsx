import { Link } from 'react-router-dom';

interface ButtonProps {
  to: string;
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export function Button({ to, variant = 'primary', children }: ButtonProps) {
  const baseStyles = 'px-6 py-2 rounded-md font-medium transition-colors';
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300'
  };

  return (
    <Link
      to={to}
      className={`${baseStyles} ${variantStyles[variant]}`}
    >
      {children}
    </Link>
  );
}
