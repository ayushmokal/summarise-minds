import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, MapPin } from "lucide-react";

interface Event {
  title: string;
  description: string;
  location: string;
  date: string;
}

export const NearbyEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const { toast } = useToast();

  const getLocation = () => {
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
            description: "Unable to get your location. Please enable location services.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
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
    getLocation();
    const intervalId = setInterval(getLocation, 300000); // Update location every 5 minutes
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (location) {
      fetchNearbyEvents();
    }
  }, [location]);

  return (
    <Card className="p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Nearby Events</h2>
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