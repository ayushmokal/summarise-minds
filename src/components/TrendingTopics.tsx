import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface TrendingTopic {
  topic: string;
  category: string;
  location: string;
  timestamp: string;
}

export const TrendingTopics = ({ selectedCategories, location }: { 
  selectedCategories: string[], 
  location: string 
}) => {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Simulated trending topics based on user preferences
    const mockTrendingTopics: TrendingTopic[] = [
      {
        topic: "Major Tech Breakthrough",
        category: "technology",
        location: "us",
        timestamp: new Date().toISOString()
      },
      {
        topic: "Economic Policy Update",
        category: "business",
        location: "uk",
        timestamp: new Date().toISOString()
      },
      {
        topic: "Environmental Summit",
        category: "environment",
        location: "ca",
        timestamp: new Date().toISOString()
      }
    ].filter(topic => 
      (selectedCategories.includes(topic.category.toLowerCase()) || selectedCategories.length === 0) &&
      (location === "" || topic.location === location)
    );

    setTrendingTopics(mockTrendingTopics);
  }, [selectedCategories, location]);

  const toggleNotifications = () => {
    if (!notificationsEnabled) {
      if (!("Notification" in window)) {
        toast({
          title: "Notifications Not Supported",
          description: "Your browser doesn't support notifications",
          variant: "destructive",
        });
        return;
      }

      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          setNotificationsEnabled(true);
          toast({
            title: "Notifications Enabled",
            description: "You'll receive alerts for trending topics",
          });
        } else {
          toast({
            title: "Notifications Disabled",
            description: "Please enable notifications in your browser settings",
            variant: "destructive",
          });
        }
      });
    } else {
      setNotificationsEnabled(false);
      toast({
        title: "Notifications Disabled",
        description: "You won't receive alerts anymore",
      });
    }
  };

  return (
    <Card className="p-6 shadow-lg bg-white mt-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <h2 className="text-2xl font-semibold">Trending Topics</h2>
        </div>
        <Button
          variant={notificationsEnabled ? "default" : "outline"}
          onClick={toggleNotifications}
          className="flex items-center gap-2"
        >
          <Bell className="h-4 w-4" />
          {notificationsEnabled ? "Notifications On" : "Enable Alerts"}
        </Button>
      </div>
      
      {trendingTopics.length > 0 ? (
        <div className="space-y-4">
          {trendingTopics.map((topic, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="capitalize">
                  {topic.category}
                </Badge>
                <span className="font-medium">{topic.topic}</span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(topic.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">
          No trending topics in your selected categories and location
        </p>
      )}
    </Card>
  );
};