import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
    // Store location in localStorage
    localStorage.setItem('selectedLocation', locationId);
    navigate('/language');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 shadow-lg bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-semibold">Select Your Location</h1>
          </div>
          
          <Select onValueChange={handleLocationSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose your location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
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
    </div>
  )
}

export default Location