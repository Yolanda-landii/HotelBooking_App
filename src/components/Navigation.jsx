import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div className="header flex flex-col min-h-screen">
      <header className="header flex justify-between items-center p-4 bg-gray-900 text-white">
        <div className="logo">
          <img src="/images/logo.png" alt="Logo" className="w-24 h-auto" />
        </div>
        <nav className="nav">
          <ul className="flex space-x-6">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/bookings" className="hover:underline">Bookings</Link></li>
            <li><Link to="/messages" className="hover:underline">Messages</Link></li>
            <li><Link to="/profile" className="hover:underline">Profile</Link></li>
            <li><Link to="/logout" className="hover:underline">Logout</Link></li>
          </ul>
        </nav>
      </header>
    </div>
  );
};

export default Navbar;
