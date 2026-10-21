import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import DemoBanner from './DemoBanner'
import ScrollToTop from '../common/ScrollToTop'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <Navbar />
      <ScrollToTop />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
