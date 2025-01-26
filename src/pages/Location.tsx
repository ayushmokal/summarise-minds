import { Card } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const locations = [
  { id: "us", name: "USA", lat: 37.0902, lon: -95.7129 },
  { id: "uk", name: "UK", lat: 55.3781, lon: -3.4360 },
  { id: "ca", name: "Canada", lat: 56.1304, lon: -106.3468 },
  { id: "au", name: "Australia", lat: -25.2744, lon: 133.7751 },
  { id: "in", name: "India", lat: 20.5937, lon: 78.9629 },
]

const Location = () => {
  const navigate = useNavigate();

  const handleLocationSelect = (locationId: string) => {
    localStorage.setItem('selectedLocation', locationId);
    navigate('/language');
  };

  return (
    <div className="min-h-screen bg-transparent p-8 flex items-center justify-center">
      <Card className="w-full max-w-md p-8 bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="h-6 w-6 text-blue-500" />
          <h1 className="text-2xl font-semibold">Select Your Location</h1>
        </div>
        
        <Select onValueChange={handleLocationSelect}>
          <SelectTrigger className="w-full bg-white border-gray-200 hover:border-blue-300 transition-colors">
            <SelectValue placeholder="Choose your location" />
          </SelectTrigger>
          <SelectContent className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
            {locations.map((location) => (
              <SelectItem 
                key={location.id} 
                value={location.id}
                className="hover:bg-blue-50 transition-colors"
              >
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <p className="mt-4 text-sm text-gray-600">
          Your location helps us provide relevant news and updates.
        </p>
      </Card>
    </div>
  )
}

export default Location