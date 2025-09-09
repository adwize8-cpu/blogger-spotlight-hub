import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Instagram, Youtube, MessageCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { mockBloggers } from "@/data/mockBloggers";

export default function BloggerProfile() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("instagram");

  const blogger = mockBloggers.find(b => b.handle === handle);

  if (!blogger) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Блогер не найден</h1>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к рейтингу
          </Button>
        </div>
      </div>
    );
  }

  const availablePlatforms = Object.keys(blogger.platforms || {});

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к рейтингу
          </Button>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <div className="flex items-start gap-6 mb-6">
                <img 
                  src={blogger.avatar} 
                  alt={blogger.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h1 className="text-3xl font-bold">{blogger.name}</h1>
                    <Badge className="text-lg px-3 py-1">
                      #{blogger.rank}
                    </Badge>
                  </div>
                  <p className="text-lg text-muted-foreground mb-4">@{blogger.handle}</p>
                  <p className="text-foreground mb-4">{blogger.bio}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {blogger.topics.map((topic, index) => (
                      <Badge key={index} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Platform Tabs */}
              {availablePlatforms.length > 0 && (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    {availablePlatforms.includes('instagram') && (
                      <TabsTrigger value="instagram">Instagram</TabsTrigger>
                    )}
                    {availablePlatforms.includes('tiktok') && (
                      <TabsTrigger value="tiktok">TikTok</TabsTrigger>
                    )}
                    {availablePlatforms.includes('youtube') && (
                      <TabsTrigger value="youtube">YouTube</TabsTrigger>
                    )}
                    {availablePlatforms.includes('telegram') && (
                      <TabsTrigger value="telegram">Telegram</TabsTrigger>
                    )}
                  </TabsList>

                  {/* Instagram Tab */}
                  {blogger.platforms?.instagram && (
                    <TabsContent value="instagram" className="mt-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Instagram className="w-5 h-5" />
                            Instagram Analytics
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                              <p className="text-sm text-muted-foreground">Подписчиков</p>
                              <p className="text-2xl font-bold">{blogger.platforms.instagram.followers}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">ER (вовлечение)</p>
                              <p className="text-2xl font-bold">{blogger.platforms.instagram.er}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Охваты постов</p>
                              <p className="text-2xl font-bold">{blogger.platforms.instagram.postReach}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Охваты сторис</p>
                              <p className="text-2xl font-bold">{blogger.platforms.instagram.storyReach}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )}

                  {/* YouTube Tab */}
                  {blogger.platforms?.youtube && (
                    <TabsContent value="youtube" className="mt-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Youtube className="w-5 h-5" />
                            YouTube Analytics
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                              <p className="text-sm text-muted-foreground">Подписчиков</p>
                              <p className="text-2xl font-bold">{blogger.platforms.youtube.subscribers}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">ER</p>
                              <p className="text-2xl font-bold">{blogger.platforms.youtube.er}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Просмотры</p>
                              <p className="text-2xl font-bold">{blogger.platforms.youtube.views}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Цена интеграции</p>
                              <p className="text-2xl font-bold">{blogger.platforms.youtube.price} BYN</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )}

                  {/* Telegram Tab */}
                  {blogger.platforms?.telegram && (
                    <TabsContent value="telegram" className="mt-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5" />
                            Telegram Analytics
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                              <p className="text-sm text-muted-foreground">Подписчиков</p>
                              <p className="text-2xl font-bold">{blogger.platforms.telegram.subscribers}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">ER</p>
                              <p className="text-2xl font-bold">{blogger.platforms.telegram.er}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Цена публикации 24ч</p>
                              <p className="text-2xl font-bold">{blogger.platforms.telegram.price24h} BYN</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Цена публикации 48ч</p>
                              <p className="text-2xl font-bold">{blogger.platforms.telegram.price48h} BYN</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )}
                </Tabs>
              )}
            </div>

            {/* Sidebar */}
            <div className="w-full md:w-80 space-y-6">
              {/* Price Cards */}
              <Card>
                <CardHeader>
                  <CardTitle>Прайс-лист</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {blogger.platforms?.instagram && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm">Instagram пост</span>
                      <span className="font-semibold">{blogger.platforms.instagram.postPrice} BYN</span>
                    </div>
                  )}
                  {blogger.platforms?.instagram && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm">Instagram сторис</span>
                      <span className="font-semibold">{blogger.platforms.instagram.storyPrice} BYN</span>
                    </div>
                  )}
                  {blogger.platforms?.youtube && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm">YouTube интеграция</span>
                      <span className="font-semibold">{blogger.platforms.youtube.price} BYN</span>
                    </div>
                  )}
                  {blogger.platforms?.telegram && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm">Telegram пост</span>
                      <span className="font-semibold">{blogger.platforms.telegram.price24h} BYN</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Work Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle>Условия сотрудничества</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Формат работы</p>
                    <p className="font-medium">{blogger.workFormat}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm">МАРТ:</span>
                    <Badge variant={blogger.mart ? "default" : "secondary"}>
                      {blogger.mart ? "Да" : "Нет"}
                    </Badge>
                  </div>

                  {blogger.barter && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50">
                        Возможен бартер
                      </Badge>
                    </div>
                  )}

                  {blogger.conditions && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Условия</p>
                      <p className="text-sm">{blogger.conditions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Restricted Topics */}
              {blogger.restrictedTopics && blogger.restrictedTopics.length > 0 && (
                <Card className="border-warning">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-warning">
                      <AlertTriangle className="w-4 h-4" />
                      Запрещенные тематики
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {blogger.restrictedTopics.map((topic, index) => (
                        <Badge key={index} variant="destructive" className="mr-2">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contact */}
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Готовы к сотрудничеству? Свяжитесь для обсуждения рекламного размещения.
                  </p>
                  <Button className="w-full mb-4">
                    Связаться с блогером
                  </Button>
                  
                  <div className="flex justify-center gap-3">
                    {blogger.socialLinks?.instagram && (
                      <Button variant="outline" size="icon">
                        <Instagram className="w-4 h-4" />
                      </Button>
                    )}
                    {blogger.socialLinks?.youtube && (
                      <Button variant="outline" size="icon">
                        <Youtube className="w-4 h-4" />
                      </Button>
                    )}
                    {blogger.socialLinks?.telegram && (
                      <Button variant="outline" size="icon">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}