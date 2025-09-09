import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Blogger {
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
}

interface BloggerTableProps {
  bloggers: Blogger[];
  onBloggerClick: (handle: string) => void;
}

export const BloggerTable = ({ bloggers, onBloggerClick }: BloggerTableProps) => {
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Место</TableHead>
          <TableHead>Автор</TableHead>
          <TableHead>Пол/тип блога</TableHead>
          <TableHead>Тематика</TableHead>
          <TableHead>Подписчиков</TableHead>
          <TableHead>Цена публикации</TableHead>
          <TableHead>Цена сторис</TableHead>
          <TableHead>Охваты постов</TableHead>
          <TableHead>Охваты сторис</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bloggers.map((blogger) => (
          <TableRow 
            key={blogger.handle} 
            className="hover:bg-muted/50 cursor-pointer"
            onClick={() => onBloggerClick(blogger.handle)}
          >
            <TableCell className="font-bold text-muted-foreground">
              #{blogger.rank}
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-3">
                <img 
                  src={blogger.avatar} 
                  alt={blogger.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{blogger.name}</p>
                  <p className="text-sm text-muted-foreground">@{blogger.handle}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge className={getGenderBadgeColor(blogger.gender)}>
                {blogger.gender}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {blogger.topics.slice(0, 2).map((topic, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {topic}
                  </Badge>
                ))}
                {blogger.topics.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{blogger.topics.length - 2}
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell className="font-medium">{blogger.followers}</TableCell>
            <TableCell className="font-medium">{blogger.postPrice} BYN</TableCell>
            <TableCell className="font-medium">{blogger.storyPrice} BYN</TableCell>
            <TableCell>{blogger.postReach}</TableCell>
            <TableCell>{blogger.storyReach}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};