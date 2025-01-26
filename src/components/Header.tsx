import { GlobeIcon } from "lucide-react"

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-white/20 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GlobeIcon className="h-6 w-6 text-blue-500" />
          <span className="font-martian text-xl font-bold">News Insight AI</span>
        </div>
      </div>
    </header>
  )
}

export default Header