import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Event {
  title: string;
  description: string;
  location: string;
  date: string;
}

const predefinedLocations = [
  { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
  { name: "Delhi", lat: 28.6139, lon: 77.2090 },
  { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
  { name: "New York", lat: 40.7128, lon: -74.0060 },
  { name: "London", lat: 51.5074, lon: -0.1278 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { name: "Sydney", lat: -33.8688, lon: 151.2093 },
  { name: "Dubai", lat: 25.2048, lon: 55.2708 },
  { name: "Singapore", lat: 1.3521, lon: 103.8198 },
  { name: "Paris", lat: 48.8566, lon: 2.3522 }
];

export const NearbyEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const { toast } = useToast();

  const handleLocationSelect = (locationName: string) => {
    setSelectedLocation(locationName);
    const selected = predefinedLocations.find(loc => loc.name === locationName);
    if (selected) {
      setLocation({ lat: selected.lat, lon: selected.lon });
    }
  };

  const extractJSONFromResponse = (text: string): Event[] => {
    try {
      // Remove any markdown formatting and extract just the JSON array
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON array found in response");
      
      const jsonStr = jsonMatch[0];
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      throw new Error("Failed to parse events data");
    }
  };

  const fetchNearbyEvents = async () => {
    if (!location) return;

    setLoading(true);
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyClIsIwka4gzTqUttDwb1R2egOsJboKqKs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Generate 3 upcoming events near ${selectedLocation}. Return ONLY a JSON array with objects containing title, description, location, and date fields. Make the events realistic and relevant to the location. The response should be ONLY the JSON array, nothing else.`
              }]
            }]
          }),
        }
      );

      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        const eventsData = extractJSONFromResponse(data.candidates[0].content.parts[0].text);
        setEvents(eventsData);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: "Failed to fetch nearby events. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location) {
      fetchNearbyEvents();
    }
  }, [location]);

  return (
    <Card className="p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Events Near You</h2>
        <Button
          onClick={fetchNearbyEvents}
          disabled={loading || !location}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Refresh Events"
          )}
        </Button>
      </div>

      <div className="mb-4">
        <Select value={selectedLocation} onValueChange={handleLocationSelect}>
          <SelectTrigger className="w-[200px] bg-white">
            <SelectValue placeholder="Select a location" />
          </SelectTrigger>
          <SelectContent>
            {predefinedLocations.map((loc) => (
              <SelectItem key={loc.name} value={loc.name}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {location && (
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>Selected Location: {selectedLocation}</span>
        </div>
      )}

      <div className="space-y-4">
        {events.map((event, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg hover:shadow-md transition-shadow animate-fadeIn bg-white"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
            <p className="text-gray-600 mb-2">{event.description}</p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{event.location}</span>
              <span>{event.date}</span>
            </div>
          </div>
        ))}

        {!events.length && !loading && (
          <p className="text-center text-gray-500 italic py-8">
            No events found. Please select a location and try again.
          </p>
        )}
      </div>
    </Card>
  );
};