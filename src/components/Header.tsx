import { GlobeIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 glass-card z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GlobeIcon className="h-6 w-6 text-blue-500" />
            <span className="font-martian text-xl font-bold">News Insight AI</span>
          </div>
        </div>
      </div>
      <Separator className="bg-white/20" />
    </header>
  )
}

export default Header