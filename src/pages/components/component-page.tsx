interface ComponentPageProps {
  title: string
  description?: string
  children: React.ReactNode
}

export function ComponentPage({ title, description, children }: ComponentPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  )
}

interface DemoSectionProps {
  title: string
  children: React.ReactNode
}

export function DemoSection({ title, children }: DemoSectionProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="p-6 border rounded-lg bg-card">{children}</div>
    </div>
  )
}
