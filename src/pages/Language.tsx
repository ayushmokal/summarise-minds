import { Card } from "@/components/ui/card"
import { Languages } from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const languages = [
  { id: "en", name: "English" },
  { id: "es", name: "Spanish" },
  { id: "fr", name: "French" },
  { id: "de", name: "German" },
  { id: "hi", name: "Hindi" },
]

const Language = () => {
  const navigate = useNavigate();

  const handleLanguageSelect = (languageId: string) => {
    // Store language in localStorage
    localStorage.setItem('selectedLanguage', languageId);
    navigate('/preferences');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 shadow-lg bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <Languages className="h-6 w-6 text-purple-500" />
            <h1 className="text-2xl font-semibold">Select Your Language</h1>
          </div>
          
          <Select onValueChange={handleLanguageSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose your language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language.id} value={language.id}>
                  {language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <p className="mt-4 text-sm text-gray-600">
            Select your preferred language for news content.
          </p>
        </Card>
      </div>
    </div>
  )
}

export default Language