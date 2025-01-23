import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const categories = [
  "Technology",
  "Business",
  "Politics",
  "Sports",
  "Health",
  "Entertainment",
  "Science",
  "Education",
];

const locations = [
  { id: "us", name: "United States" },
  { id: "uk", name: "United Kingdom" },
  { id: "ca", name: "Canada" },
  { id: "au", name: "Australia" },
  { id: "in", name: "India" },
];

export const NewsPreferences = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const { toast } = useToast();

  const handleCategorySelect = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else if (selectedCategories.length < 3) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      toast({
        title: "Maximum categories selected",
        description: "Please deselect a category before selecting a new one.",
      });
    }
  };

  const handleSubmit = async () => {
    if (selectedCategories.length !== 3 || !location) {
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
              text: `Generate a concise news summary for the following categories: ${selectedCategories.join(", ")} for ${location}. Focus on the most important recent developments.`
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
    <div className="container max-w-4xl mx-auto py-12 px-4 space-y-8 animate-in">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">NewsInsight AI</h1>
        <p className="text-lg text-muted-foreground">
          Get personalized news summaries powered by AI
        </p>
      </div>

      <Card className="glass-card p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Select 3 Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategories.includes(category) ? "default" : "outline"}
                className="w-full transition-all duration-200"
                onClick={() => handleCategorySelect(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Select Location</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {locations.map((loc) => (
              <Button
                key={loc.id}
                variant={location === loc.id ? "default" : "outline"}
                className="w-full transition-all duration-200"
                onClick={() => setLocation(loc.id)}
              >
                {loc.name}
              </Button>
            ))}
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Summary...
            </>
          ) : (
            "Generate Summary"
          )}
        </Button>
      </Card>

      {summary && (
        <Card className="glass-card p-6 space-y-4 animate-in">
          <h2 className="text-xl font-semibold">Your Personalized News Summary</h2>
          <div className="prose prose-sm max-w-none">
            {summary.split("\n\n").map((paragraph, index) => (
              <p key={index} className="text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};