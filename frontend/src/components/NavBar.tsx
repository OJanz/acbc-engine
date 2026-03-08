import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SideMenu from '@/components/SideMenu'

export default function NavBar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            aria-label="Menü öffnen"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/" className="text-xl font-bold text-primary tracking-tight">
            ACBC
          </Link>
        </div>
      </header>
      <SideMenu open={open} onClose={() => setOpen(false)} />
    </>
  )
}
