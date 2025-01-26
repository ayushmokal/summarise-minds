import { Separator } from "@/components/ui/separator"

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 glass-card">
      <Separator className="bg-white/20" />
      <div className="container mx-auto px-4 py-3">
        <p className="text-sm text-center text-muted-foreground font-inclusive">
          © 2024 News Insight AI. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer