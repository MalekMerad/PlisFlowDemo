import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import NotFound from './pages/NotFound';
import { Administrator } from './pages/Administrator';
import PrivateRoute from './components/Shared/PrivateRoute';
import NotAuthenticated from './pages/NotAuthenticated';
import ResetPassword from './pages/ResetPassword/ResetPasswordModal';
import Dashboard from './pages/dashbord';
import OperationDetails from './pages/Operations/OperationDetails';
import AdminPage from "./pages/CurdAdmin/AdminPage";
import OperationEvaluation from './pages/Operations/OperationEvaluation';
import SessionDetails from './pages/Sessions/SessionDetails';
import ThemeToggle from './components/Shared/tools/ThemeToggle';
import BudgetManagementPage from './pages/Budget/BudgetManagementPage';
import PartitionDetails from './pages/Operations/PartitionDetails';

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Login />,
    },
    {
      path: '/reset-password',
      element: <ResetPassword />,
    },
    {
      path: '/dashboard',
      element: <PrivateRoute />,
      children: [
        { path: '', element: <Dashboard /> },
      ],
    },
    {
      path: '/invalid',
      element: <NotAuthenticated />
    },
    {
      path: '/admin',
      element: <PrivateRoute />,
      children: [
        { path: '', element: <Administrator /> },
      ],
    },
    {
      path: '/op/:id',
      element: <OperationDetails />,
    },
    {
      path: '/partition/:partitionId/details',
      element: <PartitionDetails />,
    },
    {
      path: '/adminPage',
      element: <AdminPage />,
    },
    {
      path: '/opEval/:id',
      element: <OperationEvaluation />
    },
    {
      path: '/session/:id',
      element: <SessionDetails />
    },
    {
      path: '/budget/:id',
      element: <PrivateRoute />,
      children: [
        { path: '', element: <BudgetManagementPage /> },
      ],
    },
    { path: '*', element: <NotFound /> },
  ]);

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <RouterProvider router={router} />
    </>
  );
}

export default App;