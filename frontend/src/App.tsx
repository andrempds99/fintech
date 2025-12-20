import { useState } from "react";
import { useAuth } from "./contexts/auth.context";
import { LoginPage } from "./pages/login";
import { ForgotPasswordPage } from "./pages/forgot-password";
import { DashboardPage } from "./pages/dashboard";
import { AccountsPage } from "./pages/accounts";
import { TransactionsPage } from "./pages/transactions";
import { TransfersPage } from "./pages/transfers";
import { AnalyticsPage } from "./pages/analytics";
import { AdminPage } from "./pages/admin";
import { GoalsPage } from "./pages/goals";
import { AlertsPage } from "./pages/alerts";
import { DashboardLayout } from "./components/dashboard-layout";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./contexts/theme.context";
import { toast } from "sonner";

type AuthPage = 'login' | 'forgot-password';
type AppPage = 'dashboard' | 'accounts' | 'transactions' | 'transfers' | 'goals' | 'alerts' | 'analytics' | 'admin';

export default function App() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [authPage, setAuthPage] = useState<AuthPage>('login');
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard');

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      setAuthPage('login');
    } catch (error) {
      // Log error silently - user already sees toast notification
      toast.error("Error during logout");
    }
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page as AppPage);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Authentication pages
  if (!isAuthenticated) {
    if (authPage === 'forgot-password') {
      return (
        <>
          <ForgotPasswordPage onBack={() => setAuthPage('login')} />
          <Toaster />
        </>
      );
    }
    
    return (
      <>
        <LoginPage 
          onForgotPassword={() => setAuthPage('forgot-password')}
        />
        <Toaster />
      </>
    );
  }

  // Dashboard pages
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onPageChange={handlePageChange} />;
      case 'accounts':
        return <AccountsPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'transfers':
        return <TransfersPage />;
      case 'goals':
        return <GoalsPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <DashboardPage onPageChange={handlePageChange} />;
    }
  };

  return (
    <ThemeProvider>
      <DashboardLayout
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onLogout={handleLogout}
      >
        {renderPage()}
      </DashboardLayout>
      <Toaster />
    </ThemeProvider>
  );
}