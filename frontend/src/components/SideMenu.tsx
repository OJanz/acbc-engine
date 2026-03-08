import { Link, useNavigate } from 'react-router-dom'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { logout } from '@/lib/auth'

interface SideMenuProps {
  open: boolean
  onClose: () => void
}

export default function SideMenu({ open, onClose }: SideMenuProps) {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logout()
    } finally {
      setUser(null)
      onClose()
      navigate('/')
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="left" className="w-64">
        <SheetHeader>
          <SheetTitle className="text-primary">ACBC</SheetTitle>
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-1">
          <Button variant="ghost" className="justify-start text-base" asChild onClick={onClose}>
            <Link to="/">Home</Link>
          </Button>
          {user ? (
            <>
              <Button variant="ghost" className="justify-start text-base" asChild onClick={onClose}>
                <Link to="/studies">Meine Studien</Link>
              </Button>
              <Button
                variant="ghost"
                className="justify-start text-base"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button variant="ghost" className="justify-start text-base" asChild onClick={onClose}>
              <Link to="/login">Login</Link>
            </Button>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
