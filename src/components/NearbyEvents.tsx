import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, MapPin, Calendar, Clock, Users, Ticket, Info } from "lucide-react";
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
  time?: string;
  venue?: string;
  capacity?: string;
  ticketPrice?: string;
  organizer?: string;
  category?: string;
  additionalInfo?: string;
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
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const handleLocationSelect = (locationName: string) => {
    setSelectedLocation(locationName);
    const selected = predefinedLocations.find(loc => loc.name === locationName);
    if (selected) {
      setLocation({ lat: selected.lat, lon: selected.lon });
    }
  };

  const extractJSONFromResponse = (text: string): Event[] => {
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON array found in response");
      
      const jsonStr = jsonMatch[0];
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      throw new Error("Failed to parse events data");
    }
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchNearbyEvents = async (retry = 0) => {
    if (!location) return;

    setLoading(true);
    try {
      const currentYear = new Date().getFullYear();
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
                text: `Generate 3 upcoming events near ${selectedLocation} for ${currentYear} and beyond. Return ONLY a JSON array with objects containing title, description, location, date (must be in ${currentYear} or later), time, venue, capacity, ticketPrice, organizer, category, and additionalInfo fields. Make the events realistic, detailed, and relevant to the location. Events must be upcoming and not in the past. The response should be ONLY the JSON array, nothing else.`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        
        if (retry < MAX_RETRIES) {
          await delay(1000 * (retry + 1));
          setRetryCount(retry + 1);
          return fetchNearbyEvents(retry + 1);
        }
        
        throw new Error(`API Error: ${errorData.error?.message || 'Unknown error occurred'}`);
      }

      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        const eventsData = extractJSONFromResponse(data.candidates[0].content.parts[0].text);
        setEvents(eventsData);
        setRetryCount(0);
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: retryCount >= MAX_RETRIES 
          ? "Failed to fetch events after multiple attempts. Please try again later."
          : "Temporarily unable to fetch events. Retrying...",
        variant: "destructive",
      });
    } finally {
      if (retryCount >= MAX_RETRIES) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (location) {
      fetchNearbyEvents();
    }
  }, [location]);

  return (
    <Card className="p-6 shadow-lg bg-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Events Near You</h2>
        <Button
          onClick={() => fetchNearbyEvents()}
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

      <div className="mb-6">
        <Select value={selectedLocation} onValueChange={handleLocationSelect}>
          <SelectTrigger className="w-[200px] bg-white border border-gray-200">
            <SelectValue placeholder="Select a location" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg">
            {predefinedLocations.map((loc) => (
              <SelectItem 
                key={loc.name} 
                value={loc.name}
                className="hover:bg-gray-100"
              >
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

      <div className="space-y-6">
        {events.map((event, index) => (
          <div
            key={index}
            className="p-6 border rounded-lg hover:shadow-md transition-shadow bg-white"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-xl text-blue-600">{event.title}</h3>
              {event.category && (
                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                  {event.category}
                </span>
              )}
            </div>
            
            <p className="text-gray-600 mb-4">{event.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{event.venue || event.location}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{event.date}</span>
              </div>
              
              {event.time && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{event.time}</span>
                </div>
              )}
              
              {event.capacity && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>Capacity: {event.capacity}</span>
                </div>
              )}
            </div>
            
            <div className="border-t pt-4">
              {event.ticketPrice && (
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Ticket className="h-4 w-4" />
                  <span>Ticket Price: {event.ticketPrice}</span>
                </div>
              )}
              
              {event.organizer && (
                <div className="text-sm text-gray-500">
                  Organized by: {event.organizer}
                </div>
              )}
              
              {event.additionalInfo && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Info className="h-4 w-4" />
                    <span className="text-sm">{event.additionalInfo}</span>
                  </div>
                </div>
              )}
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