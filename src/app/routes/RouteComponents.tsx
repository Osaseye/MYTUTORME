// Placeholder components for critical routes
// --- Layouts ---
import { Outlet } from 'react-router-dom';

export const PublicLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
          <header className="p-4 border-b">Public Header</header>
          <main className="flex-1 p-4">
              <Outlet />
          </main>
          <footer className="p-4 border-t">Footer</footer>
        </div>
      );
};

export const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r p-4 hidden md:block">Sidebar</aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};


// --- Pages ---
export const LandingPage = () => <h1 className="text-2xl font-bold">Welcome to MyTutorMe</h1>;
export const LoginPage = () => <h1 className="text-2xl font-bold">Login</h1>;
export const RegisterPage = () => <h1 className="text-2xl font-bold">Register</h1>;
export const UnauthorizedPage = () => <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>;

// --- Feature Dashboard Placeholders ---
export const StudentDashboard = () => <h1 className="text-2xl font-bold">Student Dashboard</h1>;
export const TeacherDashboard = () => <h1 className="text-2xl font-bold">Teacher Dashboard</h1>;
export const AdminDashboard = () => <h1 className="text-2xl font-bold">Admin Dashboard</h1>;

// --- Imports needed for this file ---
// removed duplicate Outlet import
