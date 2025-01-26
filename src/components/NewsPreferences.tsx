import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { NearbyEvents } from "./NearbyEvents";
import { pipeline } from "@huggingface/transformers";
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
];

const locations = [
  { id: "us", name: "USA" },
  { id: "uk", name: "UK" },
  { id: "ca", name: "Canada" },
  { id: "au", name: "Australia" },
  { id: "in", name: "India" },
];

export const NewsPreferences = () => {
  const [preferences, setPreferences] = useState<string[]>(["", "", ""]);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [sentiment, setSentiment] = useState<{ label: string; score: number } | null>(null);
  const { toast } = useToast();

  const analyzeSentiment = async (text: string) => {
    try {
      const classifier = await pipeline(
        "sentiment-analysis",
        "Xenova/distilbert-base-uncased-finetuned-sst-2-english"
      );
      const result = await classifier(text);
      setSentiment(result[0]);
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

  const handleSubmit = async () => {
    if (preferences.filter(Boolean).length !== 3 || !location) {
      toast({
        title: "Incomplete preferences",
        description: "Please select 3 categories and a location.",
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
              text: `Generate a concise news summary for the following categories: ${preferences.join(", ")} for ${location}. Focus on the most important recent developments.`
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
                <Select value={location} onValueChange={setLocation}>
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
            <NearbyEvents />
          </div>
        </div>
      </div>
    </div>
  );
};