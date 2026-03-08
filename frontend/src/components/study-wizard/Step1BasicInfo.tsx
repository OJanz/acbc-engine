import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const schema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Step1BasicInfoProps {
  defaultValues: { name: string; description: string }
  onSave: (data: { name: string; description: string }) => Promise<void>
  saving: boolean
  error: string
}

export default function Step1BasicInfo({ defaultValues, onSave, saving, error }: Step1BasicInfoProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  async function onSubmit(data: FormValues) {
    await onSave({ name: data.name, description: data.description ?? '' })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" {...register('name')} placeholder="z.B. Produktpräferenz-Studie 2025" className="bg-blue-50" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Beschreibung</Label>
        <Textarea
          id="description"
          {...register('description')}
          rows={4}
          placeholder="Interne Notizen oder Briefing…"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? 'Weiter…' : 'Weiter →'}
        </Button>
      </div>
    </form>
  )
}
