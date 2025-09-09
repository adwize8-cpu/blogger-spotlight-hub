import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, X } from "lucide-react";

interface FilterSidebarProps {
  onFiltersChange: (filters: any) => void;
}

export const FilterSidebar = ({ onFiltersChange }: FilterSidebarProps) => {
  const [filters, setFilters] = useState({
    search: "",
    gender: "",
    minFollowers: "",
    maxFollowers: "",
    minPostPrice: "",
    maxPostPrice: "",
    minStoryPrice: "",
    maxStoryPrice: "",
    barter: false,
    mart: false,
    topics: [] as string[],
    restrictedTopics: [] as string[]
  });

  const topicsList = [
    "Мода и стиль", "Красота", "Путешествия", "Еда", "Спорт", 
    "Технологии", "Lifestyle", "Материнство", "Автомобили", "Недвижимость"
  ];

  const restrictedTopicsList = [
    "Алкоголь", "Табак", "Азартные игры", "Медицинские услуги", "Финансовые услуги"
  ];

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      search: "",
      gender: "",
      minFollowers: "",
      maxFollowers: "",
      minPostPrice: "",
      maxPostPrice: "",
      minStoryPrice: "",
      maxStoryPrice: "",
      barter: false,
      mart: false,
      topics: [],
      restrictedTopics: []
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  return (
    <Card className="sticky top-24 h-fit">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Фильтры
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Сбросить
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label>Поиск блогеров</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Имя или @handle"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label>Пол блогера</Label>
          <Select value={filters.gender} onValueChange={(value) => handleFilterChange("gender", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите пол" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Парень">Парень</SelectItem>
              <SelectItem value="Девушка">Девушка</SelectItem>
              <SelectItem value="Пара">Пара</SelectItem>
              <SelectItem value="Паблик">Паблик</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Followers */}
        <div className="space-y-2">
          <Label>Подписчиков</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="От"
              value={filters.minFollowers}
              onChange={(e) => handleFilterChange("minFollowers", e.target.value)}
            />
            <Input
              placeholder="До"
              value={filters.maxFollowers}
              onChange={(e) => handleFilterChange("maxFollowers", e.target.value)}
            />
          </div>
        </div>

        {/* Post Price */}
        <div className="space-y-2">
          <Label>Цена поста - BYN</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="От"
              value={filters.minPostPrice}
              onChange={(e) => handleFilterChange("minPostPrice", e.target.value)}
            />
            <Input
              placeholder="До"
              value={filters.maxPostPrice}
              onChange={(e) => handleFilterChange("maxPostPrice", e.target.value)}
            />
          </div>
        </div>

        {/* Story Price */}
        <div className="space-y-2">
          <Label>Цена сторис - BYN</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="От"
              value={filters.minStoryPrice}
              onChange={(e) => handleFilterChange("minStoryPrice", e.target.value)}
            />
            <Input
              placeholder="До"
              value={filters.maxStoryPrice}
              onChange={(e) => handleFilterChange("maxStoryPrice", e.target.value)}
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="barter"
              checked={filters.barter}
              onCheckedChange={(checked) => handleFilterChange("barter", checked)}
            />
            <Label htmlFor="barter">Возможен бартер</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="mart"
              checked={filters.mart}
              onCheckedChange={(checked) => handleFilterChange("mart", checked)}
            />
            <Label htmlFor="mart">Есть в реестре МАРТ</Label>
          </div>
        </div>

        {/* Topics */}
        <div className="space-y-2">
          <Label>Тематика блога</Label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {topicsList.map((topic) => (
              <div key={topic} className="flex items-center space-x-2">
                <Checkbox
                  id={topic}
                  checked={filters.topics.includes(topic)}
                  onCheckedChange={(checked) => {
                    const newTopics = checked 
                      ? [...filters.topics, topic]
                      : filters.topics.filter(t => t !== topic);
                    handleFilterChange("topics", newTopics);
                  }}
                />
                <Label htmlFor={topic} className="text-sm">{topic}</Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};