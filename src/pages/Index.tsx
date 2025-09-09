import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Header } from "@/components/Header";
import { FilterSidebar } from "@/components/FilterSidebar";
import { BloggerTable } from "@/components/BloggerTable";
import { BloggerCard } from "@/components/BloggerCard";
import { mockBloggers } from "@/data/mockBloggers";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [filters, setFilters] = useState<any>({});

  // Filter bloggers based on current filters
  const filteredBloggers = useMemo(() => {
    return mockBloggers.filter(blogger => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesName = blogger.name.toLowerCase().includes(searchTerm);
        const matchesHandle = blogger.handle.toLowerCase().includes(searchTerm);
        if (!matchesName && !matchesHandle) return false;
      }

      // Gender filter
      if (filters.gender && blogger.gender !== filters.gender) return false;

      // Topics filter
      if (filters.topics?.length > 0) {
        const hasMatchingTopic = filters.topics.some((topic: string) => 
          blogger.topics.includes(topic)
        );
        if (!hasMatchingTopic) return false;
      }

      // Followers filter
      if (filters.minFollowers || filters.maxFollowers) {
        const followers = parseFloat(blogger.followers.replace(/[K]/g, '')) * (blogger.followers.includes('K') ? 1000 : 1);
        const min = filters.minFollowers ? parseFloat(filters.minFollowers) * 1000 : 0;
        const max = filters.maxFollowers ? parseFloat(filters.maxFollowers) * 1000 : Infinity;
        if (followers < min || followers > max) return false;
      }

      // Price filters
      if (filters.minPostPrice && blogger.postPrice < parseFloat(filters.minPostPrice)) return false;
      if (filters.maxPostPrice && blogger.postPrice > parseFloat(filters.maxPostPrice)) return false;
      if (filters.minStoryPrice && blogger.storyPrice < parseFloat(filters.minStoryPrice)) return false;
      if (filters.maxStoryPrice && blogger.storyPrice > parseFloat(filters.maxStoryPrice)) return false;

      // Barter filter
      if (filters.barter && !blogger.barter) return false;

      // MART filter
      if (filters.mart && !blogger.mart) return false;

      return true;
    });
  }, [filters]);

  const handleBloggerClick = (handle: string) => {
    navigate(`/${handle}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Рейтинг блогеров в Беларуси
          </h1>
          <p className="text-xl text-muted-foreground">
            Кто здесь папа
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80 order-2 lg:order-1">
            <FilterSidebar onFiltersChange={setFilters} />
          </div>

          {/* Bloggers List */}
          <div className="flex-1 order-1 lg:order-2">
            {isMobile ? (
              /* Mobile: Card Layout */
              <div className="grid gap-4">
                {filteredBloggers.map((blogger) => (
                  <BloggerCard
                    key={blogger.handle}
                    rank={blogger.rank}
                    avatar={blogger.avatar}
                    name={blogger.name}
                    handle={blogger.handle}
                    gender={blogger.gender}
                    topics={blogger.topics}
                    followers={blogger.followers}
                    postPrice={blogger.postPrice}
                    storyPrice={blogger.storyPrice}
                    postReach={blogger.postReach}
                    storyReach={blogger.storyReach}
                    onClick={() => handleBloggerClick(blogger.handle)}
                  />
                ))}
              </div>
            ) : (
              /* Desktop: Table Layout */
              <div className="bg-card rounded-lg border">
                <BloggerTable 
                  bloggers={filteredBloggers}
                  onBloggerClick={handleBloggerClick}
                />
              </div>
            )}

            {filteredBloggers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  По вашим фильтрам блогеры не найдены
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
