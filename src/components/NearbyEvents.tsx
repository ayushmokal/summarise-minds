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

// Predefined locations for manual selection
const predefinedLocations = [
  { name: "New York", lat: 40.7128, lon: -74.0060 },
  { name: "London", lat: 51.5074, lon: -0.1278 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { name: "Sydney", lat: -33.8688, lon: 151.2093 },
  { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
];

export const NearbyEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const { toast } = useToast();

  const getLocation = () => {
    if (!useCurrentLocation) return;
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please enable location services or select a location manually.",
            variant: "destructive",
          });
          setUseCurrentLocation(false);
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services. Please select a location manually.",
        variant: "destructive",
      });
      setUseCurrentLocation(false);
    }
  };

  const handleLocationSelect = (locationName: string) => {
    setSelectedLocation(locationName);
    setUseCurrentLocation(false);
    const selected = predefinedLocations.find(loc => loc.name === locationName);
    if (selected) {
      setLocation({ lat: selected.lat, lon: selected.lon });
    }
  };

  const toggleLocationMode = () => {
    setUseCurrentLocation(!useCurrentLocation);
    if (!useCurrentLocation) {
      setSelectedLocation("");
      getLocation();
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
                text: `Generate 3 upcoming events near latitude ${location.lat} and longitude ${location.lon}. Format the response as a JSON array with objects containing title, description, location, and date fields. Make the events realistic and relevant to the location.`
              }]
            }]
          }),
        }
      );

      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        const eventsData = JSON.parse(data.candidates[0].content.parts[0].text);
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
    if (useCurrentLocation) {
      getLocation();
      const intervalId = setInterval(getLocation, 300000); // Update location every 5 minutes
      return () => clearInterval(intervalId);
    }
  }, [useCurrentLocation]);

  useEffect(() => {
    if (location) {
      fetchNearbyEvents();
    }
  }, [location]);

  return (
    <Card className="p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Nearby Events</h2>
        <div className="flex items-center gap-4">
          <Button
            onClick={toggleLocationMode}
            variant="outline"
            className="text-sm"
          >
            {useCurrentLocation ? "Use Manual Location" : "Use Current Location"}
          </Button>
          <Button
            onClick={fetchNearbyEvents}
            disabled={loading || !location}
            className="bg-blue-500 hover:bg-blue-600"
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
      </div>

      {!useCurrentLocation && (
        <div className="mb-4">
          <Select value={selectedLocation} onValueChange={handleLocationSelect}>
            <SelectTrigger className="w-[200px]">
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
      )}

      {location && (
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>
            Location: {location.lat.toFixed(2)}°, {location.lon.toFixed(2)}°
          </span>
        </div>
      )}

      <div className="space-y-4">
        {events.map((event, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg hover:shadow-md transition-shadow animate-fadeIn"
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
          <p className="text-gray-500 italic text-center">
            No nearby events found. Try refreshing or check back later.
          </p>
        )}
      </div>
    </Card>
  );
};