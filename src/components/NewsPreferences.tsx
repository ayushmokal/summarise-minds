import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { NearbyEvents } from "./NearbyEvents";
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
  const { toast } = useToast();

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
        setSummary(data.candidates[0].content.parts[0].text);
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
          <Card className="p-6 shadow-lg">
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
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category.toLowerCase()}>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full bg-green-500 hover:bg-green-600"
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

          <Card className="p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6">News Summary</h2>
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