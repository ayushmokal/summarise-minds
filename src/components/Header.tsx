import { Music, Search, User } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[#1A1F2C] text-white p-4 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Music className="h-8 w-8" />
          <span className="text-xl font-bold font-martian">News Insight AI</span>
        </div>
        
        <div className="flex items-center space-x-6">
          <Search className="h-6 w-6 cursor-pointer hover:text-gray-300" />
          <User className="h-6 w-6 cursor-pointer hover:text-gray-300" />
        </div>
      </div>
    </header>
  );
};