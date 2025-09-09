import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Users, Eye, Heart } from "lucide-react";

interface BloggerCardProps {
  rank: number;
  avatar: string;
  name: string;
  handle: string;
  gender: string;
  topics: string[];
  followers: string;
  postPrice: number;
  storyPrice: number;
  postReach: string;
  storyReach: string;
  onClick: () => void;
}

export const BloggerCard = ({
  rank,
  avatar,
  name,
  handle,
  gender,
  topics,
  followers,
  postPrice,
  storyPrice,
  postReach,
  storyReach,
  onClick
}: BloggerCardProps) => {
  const getGenderBadgeColor = (gender: string) => {
    switch (gender) {
      case "Парень": return "bg-blue-100 text-blue-800";
      case "Девушка": return "bg-pink-100 text-pink-800";
      case "Пара": return "bg-purple-100 text-purple-800";
      case "Паблик": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer p-4"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="text-lg font-bold text-muted-foreground w-8">
            #{rank}
          </div>
          <img 
            src={avatar} 
            alt={name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-card-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">@{handle}</p>
          </div>
        </div>
        
        <Badge className={getGenderBadgeColor(gender)}>
          {gender}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{followers}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{postReach}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground">Пост</p>
          <p className="font-semibold">{postPrice} BYN</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Сторис</p>
          <p className="font-semibold">{storyPrice} BYN</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {topics.slice(0, 3).map((topic, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {topic}
          </Badge>
        ))}
        {topics.length > 3 && (
          <Badge variant="secondary" className="text-xs">
            +{topics.length - 3}
          </Badge>
        )}
      </div>
    </Card>
  );
};