import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, X, MapPin, Newspaper, Settings2, Globe2 } from "lucide-react";
import { NearbyEvents } from "./NearbyEvents";
import { pipeline } from "@huggingface/transformers";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  "Technology",
  "Business",
  "Politics",
  "Sports",
  "Health",
  "Entertainment",
  "Science",
  "Education",
  "Environment",
  "Culture",
  "Travel",
  "Food",
  "Fashion",
  "Automotive",
  "Real Estate"
];

const locations = [
  { id: "us", name: "USA", lat: 37.0902, lon: -95.7129 },
  { id: "uk", name: "UK", lat: 55.3781, lon: -3.4360 },
  { id: "ca", name: "Canada", lat: 56.1304, lon: -106.3468 },
  { id: "au", name: "Australia", lat: -25.2744, lon: 133.7751 },
  { id: "in", name: "India", lat: 20.5937, lon: 78.9629 },
];

interface SentimentResult {
  label: string;
  score: number;
}

const NewsPreferences = () => {
  const [preferences, setPreferences] = useState<string[]>(["", "", ""]);
  const [customPreferences, setCustomPreferences] = useState<string[]>([]);
  const [newCustomPreference, setNewCustomPreference] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [sentiment, setSentiment] = useState<SentimentResult | null>(null);
  const { toast } = useToast();

  // Get the location from localStorage that was set in the Location page
  const [selectedLocation, setSelectedLocation] = useState(() => {
    const savedLocation = localStorage.getItem('selectedLocation');
    const locationName = locations.find(loc => loc.id === savedLocation)?.name;
    return savedLocation || "";
  });
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(() => {
    const savedLocation = localStorage.getItem('selectedLocation');
    return locations.find(loc => loc.id === savedLocation) 
      ? { 
          lat: locations.find(loc => loc.id === savedLocation)!.lat, 
          lon: locations.find(loc => loc.id === savedLocation)!.lon 
        }
      : null;
  });

  const handleLocationChange = (locationId: string) => {
    setSelectedLocation(locationId);
    if (locationId === "none") {
      setCoordinates(null);
      return;
    }
    const selectedLoc = locations.find(loc => loc.id === locationId);
    if (selectedLoc) {
      setCoordinates({ lat: selectedLoc.lat, lon: selectedLoc.lon });
    }
  };

  const analyzeSentiment = async (text: string) => {
    try {
      const classifier = await pipeline(
        "sentiment-analysis",
        "Xenova/distilbert-base-uncased-finetuned-sst-2-english"
      );
      const result = await classifier(text);
      if (Array.isArray(result) && result.length > 0) {
        const firstResult = result[0] as { label: string; score: number };
        setSentiment({
          label: firstResult.label,
          score: firstResult.score
        });
      }
    } catch (error) {
      console.error("Sentiment analysis error:", error);
      toast({
        title: "Sentiment Analysis Error",
        description: "Failed to analyze sentiment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePreferenceChange = (value: string, index: number) => {
    const newPreferences = [...preferences];
    newPreferences[index] = value;
    setPreferences(newPreferences);
  };

  const addCustomPreference = () => {
    if (!newCustomPreference.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a custom preference.",
        variant: "destructive",
      });
      return;
    }
    if (customPreferences.length >= 2) {
      toast({
        title: "Maximum Reached",
        description: "You can only add up to 2 custom preferences.",
        variant: "destructive",
      });
      return;
    }
    setCustomPreferences([...customPreferences, newCustomPreference.trim()]);
    setNewCustomPreference("");
  };

  const removeCustomPreference = (index: number) => {
    setCustomPreferences(customPreferences.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const allPreferences = [...preferences.filter(Boolean), ...customPreferences];
    
    if (allPreferences.length !== 3) {
      toast({
        title: "Incomplete preferences",
        description: "Please select exactly 3 preferences (including custom ones).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSentiment(null);
    try {
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyClIsIwka4gzTqUttDwb1R2egOsJboKqKs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a concise news summary for the following categories: ${allPreferences.join(", ")} ${selectedLocation ? `for ${selectedLocation}` : ''}. Focus on the most important recent developments.`
            }]
          }]
        }),
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        const summaryText = data.candidates[0].content.parts[0].text;
        setSummary(summaryText);
        await analyzeSentiment(summaryText);
      } else {
        throw new Error("Failed to generate summary");
      }
    } catch (error) {
      console.error("API Error:", error);
      toast({
        title: "Error",
        description: "Failed to generate news summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = () => {
    if (!sentiment) return "bg-gray-100";
    switch (sentiment.label.toLowerCase()) {
      case "positive":
        return "bg-green-100 border-green-200";
      case "negative":
        return "bg-red-100 border-red-200";
      default:
        return "bg-gray-100 border-gray-200";
    }
  };

  const getSentimentEmoji = () => {
    if (!sentiment) return "";
    switch (sentiment.label.toLowerCase()) {
      case "positive":
        return "😊";
      case "negative":
        return "😔";
      default:
        return "😐";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-5xl font-bold font-['Martian_Mono'] bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            News Insight AI
          </h1>
          <p className="text-xl text-gray-600 font-['Inclusive_Sans'] max-w-2xl mx-auto">
            An Intelligent Framework for Personalized Cross-Domain News Summarization
          </p>
        </div>

        <Card className="p-8 shadow-lg bg-white/80 backdrop-blur-sm border-white/20 mb-8 transition-all hover:shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Globe2 className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-semibold">Location</h2>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            <span className="text-lg text-gray-700">
              {locations.find(loc => loc.id === selectedLocation)?.name || "No location selected"}
            </span>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-8 shadow-lg bg-white/80 backdrop-blur-sm border-white/20 transition-all hover:shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <Settings2 className="h-6 w-6 text-purple-500" />
              <h2 className="text-2xl font-semibold">Generate News</h2>
            </div>
            <div className="space-y-6">
              {[1, 2, 3].map((num, index) => (
                <div key={num} className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Select your {num}
                    {num === 1 ? "st" : num === 2 ? "nd" : "rd"} preference:
                  </label>
                  <Select
                    value={preferences[index]}
                    onValueChange={(value) => handlePreferenceChange(value, index)}
                  >
                    <SelectTrigger className="w-full bg-white border-gray-200 hover:border-purple-300 transition-colors">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                      {categories.map((category) => (
                        <SelectItem 
                          key={category} 
                          value={category.toLowerCase()}
                          className="hover:bg-purple-50 transition-colors"
                        >
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  Add Custom Preferences (Optional, max 2):
                </label>
                <div className="flex gap-2">
                  <Input
                    value={newCustomPreference}
                    onChange={(e) => setNewCustomPreference(e.target.value)}
                    placeholder="Enter custom preference"
                    className="flex-1 border-gray-200 hover:border-purple-300 transition-colors"
                  />
                  <Button
                    onClick={addCustomPreference}
                    variant="outline"
                    size="icon"
                    className="shrink-0 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {customPreferences.map((pref, index) => (
                  <div key={index} className="flex items-center gap-2 bg-purple-50 p-3 rounded-lg animate-in">
                    <span className="flex-1 text-sm text-purple-700">{pref}</span>
                    <Button
                      onClick={() => removeCustomPreference(index)}
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-purple-100 hover:text-purple-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all hover:shadow-xl"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate"
                )}
              </Button>
            </div>
          </Card>

          <Card className="p-8 shadow-lg bg-white/80 backdrop-blur-sm border-white/20 transition-all hover:shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <Newspaper className="h-6 w-6 text-green-500" />
              <h2 className="text-2xl font-semibold">News Summary</h2>
            </div>
            {sentiment && (
              <div className={`mb-6 p-4 rounded-lg border ${getSentimentColor()}`}>
                <p className="flex items-center gap-2 text-sm font-medium">
                  Sentiment: {sentiment.label} {getSentimentEmoji()}
                  <span className="text-xs text-gray-500">
                    (Confidence: {Math.round(sentiment.score * 100)}%)
                  </span>
                </p>
              </div>
            )}
            <div className="prose prose-sm max-w-none">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
                    <span className="block text-gray-600">Generating your personalized summary...</span>
                  </div>
                </div>
              ) : summary ? (
                <div className="space-y-6">
                  {summary.split("\n\n").map((paragraph, index) => (
                    <div 
                      key={index} 
                      className="p-6 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-all animate-in"
                    >
                      <p className="text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Newspaper className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 italic">
                    Select your preferences and generate a summary to see the results here.
                  </p>
                </div>
              )}
            </div>
          </Card>

          <div className="md:col-span-2">
            <NearbyEvents coordinates={coordinates} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsPreferences;
