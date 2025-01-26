import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, X } from "lucide-react";
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
import { TrendingTopics } from "./TrendingTopics";

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

export const NewsPreferences = () => {
  const [preferences, setPreferences] = useState<string[]>(["", "", ""]);
  const [customPreferences, setCustomPreferences] = useState<string[]>([]);
  const [newCustomPreference, setNewCustomPreference] = useState("");
  const [location, setLocation] = useState("");
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [sentiment, setSentiment] = useState<SentimentResult | null>(null);
  const { toast } = useToast();

  const handleLocationChange = (locationId: string) => {
    setLocation(locationId);
    const selectedLoc = locations.find(loc => loc.id === locationId);
    if (selectedLoc) {
      setSelectedCoordinates({ lat: selectedLoc.lat, lon: selectedLoc.lon });
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
    
    if (allPreferences.length < 3 || !location) {
      toast({
        title: "Incomplete preferences",
        description: "Please select at least 3 preferences (including custom ones) and a location.",
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
              text: `Generate a concise news summary for the following categories: ${allPreferences.join(", ")} for ${location}. Focus on the most important recent developments.`
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-['Martian_Mono'] mb-4">News Insight AI</h1>
          <p className="text-lg text-gray-600 font-['Inclusive_Sans']">
            An Intelligent Framework for Personalized Cross-Domain News Summarization
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6 shadow-lg bg-white">
            <h2 className="text-2xl font-semibold mb-6">Generate News</h2>
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
                    <SelectTrigger className="w-full bg-white border-gray-200">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      {categories.map((category) => (
                        <SelectItem 
                          key={category} 
                          value={category.toLowerCase()}
                          className="hover:bg-gray-100"
                        >
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Select a Location:
                </label>
                <Select value={location} onValueChange={handleLocationChange}>
                  <SelectTrigger className="w-full bg-white border-gray-200">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {locations.map((loc) => (
                      <SelectItem 
                        key={loc.id} 
                        value={loc.id}
                        className="hover:bg-gray-100"
                      >
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">
                  Add Custom Preferences (Optional, max 2):
                </label>
                <div className="flex gap-2">
                  <Input
                    value={newCustomPreference}
                    onChange={(e) => setNewCustomPreference(e.target.value)}
                    placeholder="Enter custom preference"
                    className="flex-1"
                  />
                  <Button
                    onClick={addCustomPreference}
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {customPreferences.map((pref, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                    <span className="flex-1 text-sm">{pref}</span>
                    <Button
                      onClick={() => removeCustomPreference(index)}
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                className="w-full bg-green-500 hover:bg-green-600 text-white"
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

          <Card className="p-6 shadow-lg bg-white">
            <h2 className="text-2xl font-semibold mb-6">News Summary</h2>
            {sentiment && (
              <div className={`mb-4 p-3 rounded-lg border ${getSentimentColor()}`}>
                <p className="flex items-center gap-2 text-sm font-medium">
                  Sentiment: {sentiment.label} {getSentimentEmoji()}
                  <span className="text-xs text-gray-500">
                    (Confidence: {Math.round(sentiment.score * 100)}%)
                  </span>
                </p>
              </div>
            )}
            <div className="prose prose-sm max-w-none">
              {summary ? (
                summary.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="text-gray-600 mb-4">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="text-gray-500 italic">
                  Select your preferences and generate a summary to see the results here.
                </p>
              )}
            </div>
          </Card>

          <div className="md:col-span-2">
            <NearbyEvents coordinates={selectedCoordinates} />
          </div>
        </div>

        <TrendingTopics 
          selectedCategories={[...preferences.filter(Boolean), ...customPreferences]} 
          location={location}
        />
      </div>
    </div>
  );
};
