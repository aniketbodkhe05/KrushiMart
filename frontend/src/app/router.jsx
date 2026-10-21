import { createBrowserRouter } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import ProtectedRoute from '../components/common/ProtectedRoute'
import HomePage from '../features/home/pages/HomePage'
import MarketplacePage from '../features/marketplace/pages/MarketplacePage'
import ProductDetailsPage from '../features/products/pages/ProductDetailsPage'
import ProductFormPage from '../features/products/pages/ProductFormPage'
import RequestFormPage from '../features/requests/pages/RequestFormPage'
import MyRequestsPage from '../features/requests/pages/MyRequestsPage'
import ProfilePage from '../features/farmer-profile/pages/ProfilePage'
import DemandGapPage from '../features/demandgap/pages/DemandGapPage'
import NotificationsPage from '../features/notifications/pages/NotificationsPage'
import ContactSellerPage from '../features/contact/pages/ContactSellerPage'
import LoginPage from '../features/auth/pages/LoginPage'
import RegisterPage from '../features/auth/pages/RegisterPage'
import NotFoundPage from '../features/not-found/pages/NotFoundPage'

const farmerRoles = ['FARMER', 'BOTH']

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'marketplace', element: <MarketplacePage /> },
      { path: 'products/:id', element: <ProductDetailsPage /> },
      {
        path: 'products/new',
        element: (
          <ProtectedRoute roles={farmerRoles}>
            <ProductFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'products/:id/edit',
        element: (
          <ProtectedRoute roles={farmerRoles}>
            <ProductFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'requests/new',
        element: (
          <ProtectedRoute>
            <RequestFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'requests',
        element: (
          <ProtectedRoute>
            <MyRequestsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'demandgap',
        element: (
          <ProtectedRoute roles={farmerRoles}>
            <DemandGapPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'notifications',
        element: (
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'contact/:productId',
        element: (
          <ProtectedRoute>
            <ContactSellerPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
