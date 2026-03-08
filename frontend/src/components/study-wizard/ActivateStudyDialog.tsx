import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ActivateStudyDialogProps {
  open: boolean
  saving: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ActivateStudyDialog({
  open,
  saving,
  onConfirm,
  onCancel,
}: ActivateStudyDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(open: boolean) => { if (!open) onCancel() }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Studie aktivieren?</AlertDialogTitle>
          <AlertDialogDescription>
            Die Studie wird für Teilnehmer freigegeben. Attribute und Levels können danach
            nicht mehr geändert werden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={saving}>
            Abbrechen
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={saving}>
            {saving ? 'Aktivieren…' : 'Aktivieren'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
