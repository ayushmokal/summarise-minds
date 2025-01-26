import { Home, Heart, List } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-[#1A1F2C] text-white p-4 z-50">
      <div className="container mx-auto flex justify-center items-center space-x-12">
        <Link to="/" className="flex flex-col items-center hover:text-gray-300">
          <Home className="h-6 w-6" />
          <span className="text-sm mt-1">Home</span>
        </Link>
        <Link to="/favorites" className="flex flex-col items-center hover:text-gray-300">
          <Heart className="h-6 w-6" />
          <span className="text-sm mt-1">Favorites</span>
        </Link>
        <Link to="/categories" className="flex flex-col items-center hover:text-gray-300">
          <List className="h-6 w-6" />
          <span className="text-sm mt-1">Categories</span>
        </Link>
      </div>
    </footer>
  );
};