import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft, Plus, X, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Platform {
  id?: string;
  platform_type: 'instagram' | 'youtube' | 'telegram' | 'tiktok';
  followers: number;
  engagement_rate: number;
  post_reach: number;
  story_reach: number;
  screenshot_url?: string;
  is_active: boolean;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile data
  const [fullName, setFullName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('');
  const [postPrice, setPostPrice] = useState('');
  const [storyPrice, setStoryPrice] = useState('');
  const [barterAvailable, setBarterAvailable] = useState(false);
  const [martAvailable, setMartAvailable] = useState(false);
  const [workConditions, setWorkConditions] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [restrictedTopics, setRestrictedTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [newRestrictedTopic, setNewRestrictedTopic] = useState('');
  
  // Platform data
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [newPlatform, setNewPlatform] = useState<Platform>({
    platform_type: 'instagram',
    followers: 0,
    engagement_rate: 0,
    post_reach: 0,
    story_reach: 0,
    is_active: true
  });

  const platformLabels = {
    instagram: 'Instagram',
    youtube: 'YouTube',
    telegram: 'Telegram',
    tiktok: 'TikTok'
  };

  const topicSuggestions = [
    'Красота', 'Мода', 'Спорт', 'Путешествия', 'Еда', 'Технологии',
    'Музыка', 'Кино', 'Игры', 'Автомобили', 'Образование', 'Бизнес'
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Load profile data
  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || '');
      }

      // Load blogger data
      const { data: blogger } = await supabase
        .from('bloggers')
        .select('*')
        .eq('profile_id', profile?.id)
        .maybeSingle();

      if (blogger) {
        setHandle(blogger.handle || '');
        setBio(blogger.bio || '');
        setGender(blogger.gender || '');
        setPostPrice(blogger.post_price?.toString() || '');
        setStoryPrice(blogger.story_price?.toString() || '');
        setBarterAvailable(blogger.barter_available || false);
        setMartAvailable(blogger.mart_available || false);
        setWorkConditions(blogger.work_conditions || '');
        setTopics(blogger.topics || []);
        setRestrictedTopics(blogger.restricted_topics || []);
        
        // Load platforms
        const { data: platformsData } = await supabase
          .from('platforms')
          .select('*')
          .eq('blogger_id', blogger.id);

        if (platformsData) {
          setPlatforms(platformsData);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        toast({
          title: "Ошибка",
          description: "Профиль не найден",
          variant: "destructive"
        });
        return;
      }

      // Update profile
      await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('user_id', user.id);

      // Check if blogger profile exists
      const { data: existingBlogger } = await supabase
        .from('bloggers')
        .select('*')
        .eq('profile_id', profile.id)
        .maybeSingle();

      const bloggerData = {
        handle,
        bio,
        gender,
        topics,
        post_price: postPrice ? parseFloat(postPrice) : null,
        story_price: storyPrice ? parseFloat(storyPrice) : null,
        barter_available: barterAvailable,
        mart_available: martAvailable,
        work_conditions: workConditions,
        restricted_topics: restrictedTopics
      };

      if (existingBlogger) {
        // Update existing blogger
        await supabase
          .from('bloggers')
          .update(bloggerData)
          .eq('id', existingBlogger.id);
      } else {
        // Create new blogger
        await supabase
          .from('bloggers')
          .insert({
            ...bloggerData,
            profile_id: profile.id
          });
      }

      toast({
        title: "Сохранено",
        description: "Профиль успешно обновлен"
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить профиль",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addTopic = () => {
    if (newTopic && !topics.includes(newTopic)) {
      setTopics([...topics, newTopic]);
      setNewTopic('');
    }
  };

  const removeTopic = (topic: string) => {
    setTopics(topics.filter(t => t !== topic));
  };

  const addRestrictedTopic = () => {
    if (newRestrictedTopic && !restrictedTopics.includes(newRestrictedTopic)) {
      setRestrictedTopics([...restrictedTopics, newRestrictedTopic]);
      setNewRestrictedTopic('');
    }
  };

  const removeRestrictedTopic = (topic: string) => {
    setRestrictedTopics(restrictedTopics.filter(t => t !== topic));
  };

  const addPlatform = async () => {
    if (!user) return;
    
    try {
      // Get blogger ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: blogger } = await supabase
        .from('bloggers')
        .select('*')
        .eq('profile_id', profile?.id)
        .single();

      if (!blogger) {
        toast({
          title: "Ошибка",
          description: "Сначала сохраните основную информацию профиля",
          variant: "destructive"
        });
        return;
      }

      // Add platform
      const { data, error } = await supabase
        .from('platforms')
        .insert({
          blogger_id: blogger.id,
          ...newPlatform
        })
        .select()
        .single();

      if (error) throw error;

      setPlatforms([...platforms, data]);
      setNewPlatform({
        platform_type: 'instagram',
        followers: 0,
        engagement_rate: 0,
        post_reach: 0,
        story_reach: 0,
        is_active: true
      });

      toast({
        title: "Добавлено",
        description: "Платформа успешно добавлена"
      });
    } catch (error) {
      console.error('Error adding platform:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить платформу",
        variant: "destructive"
      });
    }
  };

  const removePlatform = async (platformId: string) => {
    try {
      await supabase
        .from('platforms')
        .delete()
        .eq('id', platformId);

      setPlatforms(platforms.filter(p => p.id !== platformId));
      
      toast({
        title: "Удалено",
        description: "Платформа удалена"
      });
    } catch (error) {
      console.error('Error removing platform:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить платформу",
        variant: "destructive"
      });
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            На главную
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Мой профиль</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Основная информация</TabsTrigger>
              <TabsTrigger value="platforms">Платформы</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Личные данные</CardTitle>
                  <CardDescription>
                    Основная информация о вашем профиле
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Полное имя</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ваше имя"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="handle">Handle (никнейм)</Label>
                      <Input
                        id="handle"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        placeholder="@ваш_никнейм"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Биография</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Расскажите о себе..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Пол</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите пол" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="boy">Мужской</SelectItem>
                        <SelectItem value="girl">Женский</SelectItem>
                        <SelectItem value="couple">Пара</SelectItem>
                        <SelectItem value="public">Паблик</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ценообразование</CardTitle>
                  <CardDescription>
                    Установите цены на ваши услуги
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postPrice">Цена за пост (BYN)</Label>
                      <Input
                        id="postPrice"
                        type="number"
                        value={postPrice}
                        onChange={(e) => setPostPrice(e.target.value)}
                        placeholder="1000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="storyPrice">Цена за stories (BYN)</Label>
                      <Input
                        id="storyPrice"
                        type="number"
                        value={storyPrice}
                        onChange={(e) => setStoryPrice(e.target.value)}
                        placeholder="500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="barter"
                        checked={barterAvailable}
                        onCheckedChange={(checked) => setBarterAvailable(checked === true)}
                      />
                      <Label htmlFor="barter">Бартер</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="mart"
                        checked={martAvailable}
                        onCheckedChange={(checked) => setMartAvailable(checked === true)}
                      />
                      <Label htmlFor="mart">MART</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="workConditions">Условия работы</Label>
                    <Textarea
                      id="workConditions"
                      value={workConditions}
                      onChange={(e) => setWorkConditions(e.target.value)}
                      placeholder="Опишите ваши условия работы..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Темы контента</CardTitle>
                  <CardDescription>
                    Добавьте темы, которые вы освещаете
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      placeholder="Добавить тему"
                      onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                    />
                    <Button onClick={addTopic} variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {topicSuggestions.map(topic => (
                      <Badge
                        key={topic}
                        variant={topics.includes(topic) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          if (topics.includes(topic)) {
                            removeTopic(topic);
                          } else {
                            setTopics([...topics, topic]);
                          }
                        }}
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {topics.filter(topic => !topicSuggestions.includes(topic)).map(topic => (
                      <Badge key={topic} variant="default" className="flex items-center gap-1">
                        {topic}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTopic(topic)}
                        />
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Запрещённые темы</CardTitle>
                  <CardDescription>
                    Темы, которые вы не готовы освещать
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newRestrictedTopic}
                      onChange={(e) => setNewRestrictedTopic(e.target.value)}
                      placeholder="Добавить запрещённую тему"
                      onKeyPress={(e) => e.key === 'Enter' && addRestrictedTopic()}
                    />
                    <Button onClick={addRestrictedTopic} variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {restrictedTopics.map(topic => (
                      <Badge key={topic} variant="destructive" className="flex items-center gap-1">
                        {topic}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeRestrictedTopic(topic)}
                        />
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button onClick={saveProfile} disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Сохранить профиль
              </Button>
            </TabsContent>
            
            <TabsContent value="platforms" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Добавить платформу</CardTitle>
                  <CardDescription>
                    Добавьте информацию о ваших социальных сетях
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Платформа</Label>
                      <Select
                        value={newPlatform.platform_type}
                        onValueChange={(value) => setNewPlatform({
                          ...newPlatform,
                          platform_type: value as Platform['platform_type']
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(platformLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Подписчики</Label>
                      <Input
                        type="number"
                        value={newPlatform.followers}
                        onChange={(e) => setNewPlatform({
                          ...newPlatform,
                          followers: parseInt(e.target.value) || 0
                        })}
                        placeholder="10000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Вовлечённость (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newPlatform.engagement_rate}
                        onChange={(e) => setNewPlatform({
                          ...newPlatform,
                          engagement_rate: parseFloat(e.target.value) || 0
                        })}
                        placeholder="5.2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Охват постов</Label>
                      <Input
                        type="number"
                        value={newPlatform.post_reach}
                        onChange={(e) => setNewPlatform({
                          ...newPlatform,
                          post_reach: parseInt(e.target.value) || 0
                        })}
                        placeholder="8000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Охват stories</Label>
                      <Input
                        type="number"
                        value={newPlatform.story_reach}
                        onChange={(e) => setNewPlatform({
                          ...newPlatform,
                          story_reach: parseInt(e.target.value) || 0
                        })}
                        placeholder="6000"
                      />
                    </div>
                  </div>
                  
                  <Button onClick={addPlatform} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить платформу
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {platforms.map((platform) => (
                  <Card key={platform.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg">
                        {platformLabels[platform.platform_type]}
                      </CardTitle>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => platform.id && removePlatform(platform.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <Label className="text-muted-foreground">Подписчики</Label>
                          <p className="font-medium">{platform.followers.toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Вовлечённость</Label>
                          <p className="font-medium">{platform.engagement_rate}%</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Охват постов</Label>
                          <p className="font-medium">{platform.post_reach.toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Охват stories</Label>
                          <p className="font-medium">{platform.story_reach.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {platforms.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Платформы не добавлены
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;