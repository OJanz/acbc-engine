import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Editor } from '@tinymce/tinymce-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const schema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  description: z.string().optional(),
  welcome_message: z.string().optional(),
  byo_instruction_title: z.string().optional(),
  byo_instruction_text: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Step1BasicInfoProps {
  defaultValues: {
    name: string
    description: string
    welcome_message: string
    byo_instruction_title: string
    byo_instruction_text: string
  }
  onSave: (data: {
    name: string
    description: string
    welcome_message: string
    byo_instruction_title: string
    byo_instruction_text: string
  }) => Promise<void>
  saving: boolean
  error: string
}

export default function Step1BasicInfo({ defaultValues, onSave, saving, error }: Step1BasicInfoProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  async function onSubmit(data: FormValues) {
    await onSave({
      name: data.name,
      description: data.description ?? '',
      welcome_message: data.welcome_message ?? '',
      byo_instruction_title: data.byo_instruction_title ?? '',
      byo_instruction_text: data.byo_instruction_text ?? '',
    })
  }

  const tinymceInit = {
    height: 250,
    menubar: false,
    plugins: ['link', 'lists'],
    toolbar: 'bold italic | bullist numlist | link',
    branding: false,
    promotion: false,
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

      <div className="flex flex-col gap-1.5">
        <Label>Begrüßungstext</Label>
        <Controller
          name="welcome_message"
          control={control}
          render={({ field }) => (
            <Editor
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              licenseKey="gpl"
              value={field.value ?? ''}
              onEditorChange={(content) => field.onChange(content)}
              init={{
                ...tinymceInit,
                placeholder: 'Wird den Probanden beim Aufruf der Studie angezeigt.',
              }}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="byo_instruction_title">BYO-Überschrift</Label>
        <Input
          id="byo_instruction_title"
          {...register('byo_instruction_title')}
          placeholder="z.B. Gestalten Sie Ihr Idealprodukt"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>BYO-Instruktion</Label>
        <Controller
          name="byo_instruction_text"
          control={control}
          render={({ field }) => (
            <Editor
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              licenseKey="gpl"
              value={field.value ?? ''}
              onEditorChange={(content) => field.onChange(content)}
              init={{
                ...tinymceInit,
                placeholder: 'Erklärungstext für die BYO-Phase…',
              }}
            />
          )}
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
