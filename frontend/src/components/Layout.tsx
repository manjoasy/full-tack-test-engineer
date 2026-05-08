import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <Link to="/" className="logo">
          TalentFlow
        </Link>
        <div className="nav-links">
          {user && (
            <>
              <Link to="/" className="nav-link">
                <LayoutDashboard size={20} />
                Tableau de bord
              </Link>
              <div className="user-profile">
                <UserIcon size={20} />
                <span>{user.username}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-outline">
                <LogOut size={18} />
                Déconnexion
              </button>
            </>
          )}
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
