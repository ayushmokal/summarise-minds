import { BlogFormData } from "@/types/blog";
import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface FeaturedArticlesGridProps {
  articles: BlogFormData[];
}

export function FeaturedArticlesGrid({ articles }: FeaturedArticlesGridProps) {
  if (!articles.length) return null;

  const mainFeaturedArticles = articles.slice(0, 2);
  const regularArticles = articles.slice(2, 10);

  return (
    <div className="container mx-auto px-4 space-y-6">
      {/* Top Featured Articles Section */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
        {/* First Article - Wide (65%) */}
        {mainFeaturedArticles[0] && (
          <div className="lg:w-2/3 flex-1">
            <Link to={`/article/${mainFeaturedArticles[0].slug}`} className="group block h-full">
              <div className="relative rounded-xl overflow-hidden shadow-lg h-full">
                <div className="h-full">
                  <img
                    src={mainFeaturedArticles[0].image_url || '/placeholder.svg'}
                    alt={mainFeaturedArticles[0].title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="inline-block px-3 py-1 bg-primary/90 text-white text-sm font-semibold rounded-full">
                          Featured
                        </span>
                        <span className="text-sm text-gray-300">Technology</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white group-hover:text-primary/90 transition-colors">
                        {mainFeaturedArticles[0].title}
                      </h2>
                      {mainFeaturedArticles[0].meta_description && (
                        <p className="text-base text-gray-200 mt-3 line-clamp-2 max-w-3xl">
                          {mainFeaturedArticles[0].meta_description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Second Article - Narrow (35%) */}
        {mainFeaturedArticles[1] && (
          <div className="lg:w-1/3">
            <Link to={`/article/${mainFeaturedArticles[1].slug}`} className="group block h-full">
              <div className="relative rounded-xl overflow-hidden shadow-lg h-full">
                <AspectRatio ratio={3/4} className="h-full">
                  <img
                    src={mainFeaturedArticles[1].image_url || '/placeholder.svg'}
                    alt={mainFeaturedArticles[1].title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="inline-block px-3 py-1 bg-teal-500/90 text-white text-sm font-semibold rounded-full">
                          Trending
                        </span>
                        <span className="text-sm text-gray-300">Reviews</span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold text-white group-hover:text-primary/90 transition-colors">
                        {mainFeaturedArticles[1].title}
                      </h2>
                      {mainFeaturedArticles[1].meta_description && (
                        <p className="text-sm text-gray-200 mt-2 line-clamp-2">
                          {mainFeaturedArticles[1].meta_description}
                        </p>
                      )}
                    </div>
                  </div>
                </AspectRatio>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Regular Articles Grid */}
      {regularArticles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {regularArticles.map((article, index) => (
            <Link 
              key={article.slug}
              to={`/article/${article.slug}`}
              className="group block bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="relative overflow-hidden">
                <AspectRatio ratio={16/9}>
                  <img
                    src={article.image_url || '/placeholder.svg'}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-block px-3 py-1 bg-black/70 text-white text-sm font-semibold rounded-full">
                      {index === 0 ? "Featured" : index === 1 ? "Trending" : "Latest"}
                    </span>
                  </div>
                </AspectRatio>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h3>
                {article.meta_description && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {article.meta_description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
