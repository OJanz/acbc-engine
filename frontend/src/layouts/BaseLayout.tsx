import { Outlet } from 'react-router-dom'
import NavBar from '@/components/NavBar'

export default function BaseLayout() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
