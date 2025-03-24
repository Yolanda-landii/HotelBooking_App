import LogoutButton from '../components/logout';


const Navbar = () => (
    <header className="header flex justify-between items-center p-4 bg-gray-900 text-white">
    <div className="logo">
      <img src="/images/logo.png" alt="Logo" className="w-24 h-auto" />
    </div>
    <nav className="nav">
      <ul className="flex space-x-6">
        <li><a href="/" className="hover:underline">Home</a></li>
        <li><a href="/bookings" className="hover:underline">Bookings</a></li>
        <li><a href="/profile" className="hover:underline">Profile</a></li>
        <LogoutButton/>
      </ul>
    </nav>
  </header>
);
export default Navbar