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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft, Plus, X, Upload, FileSpreadsheet, Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BloggerFormData {
  fullName: string;
  handle: string;
  bio: string;
  gender: string;
  topics: string[];
  postPrice: string;
  storyPrice: string;
  barterAvailable: boolean;
  martAvailable: boolean;
  workConditions: string;
  restrictedTopics: string[];
  platforms: {
    [key: string]: {
      followers: number;
      engagement_rate: number;
      post_reach: number;
      story_reach: number;
    };
  };
}

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [csvData, setCsvData] = useState<string>('');
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState<string>('');
  const [importing, setImporting] = useState(false);
  
  // Quick form data
  const [formData, setFormData] = useState<BloggerFormData>({
    fullName: '',
    handle: '',
    bio: '',
    gender: '',
    topics: [],
    postPrice: '',
    storyPrice: '',
    barterAvailable: false,
    martAvailable: false,
    workConditions: '',
    restrictedTopics: [],
    platforms: {}
  });

  const [newTopic, setNewTopic] = useState('');
  const [newRestrictedTopic, setNewRestrictedTopic] = useState('');

  const topicSuggestions = [
    'Красота', 'Мода', 'Спорт', 'Путешествия', 'Еда', 'Технологии',
    'Музыка', 'Кино', 'Игры', 'Автомобили', 'Образование', 'Бизнес',
    'Материнство', 'Фитнес', 'Дизайн', 'Фотография', 'Животные'
  ];

  const platformTypes = ['instagram', 'youtube', 'telegram', 'tiktok'];
  const platformLabels = {
    instagram: 'Instagram',
    youtube: 'YouTube',
    telegram: 'Telegram',
    tiktok: 'TikTok'
  };

  // Check if user is admin
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      checkAdminRole();
    }
  }, [user, authLoading, navigate]);

  const checkAdminRole = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        toast({
          title: "Доступ запрещён",
          description: "У вас нет прав администратора",
          variant: "destructive"
        });
        navigate('/');
        return;
      }
      
      setUserRole(profile.role);
    } catch (error) {
      console.error('Error checking admin role:', error);
      navigate('/');
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      handle: '',
      bio: '',
      gender: '',
      topics: [],
      postPrice: '',
      storyPrice: '',
      barterAvailable: false,
      martAvailable: false,
      workConditions: '',
      restrictedTopics: [],
      platforms: {}
    });
    setNewTopic('');
    setNewRestrictedTopic('');
  };

  const addTopic = () => {
    if (newTopic && !formData.topics.includes(newTopic)) {
      setFormData(prev => ({
        ...prev,
        topics: [...prev.topics, newTopic]
      }));
      setNewTopic('');
    }
  };

  const removeTopic = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter(t => t !== topic)
    }));
  };

  const addRestrictedTopic = () => {
    if (newRestrictedTopic && !formData.restrictedTopics.includes(newRestrictedTopic)) {
      setFormData(prev => ({
        ...prev,
        restrictedTopics: [...prev.restrictedTopics, newRestrictedTopic]
      }));
      setNewRestrictedTopic('');
    }
  };

  const removeRestrictedTopic = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      restrictedTopics: prev.restrictedTopics.filter(t => t !== topic)
    }));
  };

  const saveBlogger = async () => {
    if (!user || !formData.fullName || !formData.handle) {
      toast({
        title: "Ошибка",
        description: "Заполните обязательные поля: имя и handle",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create profile first
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: crypto.randomUUID(), // Generate a unique user ID for this blogger
          email: `${formData.handle}@placeholder.com`,
          full_name: formData.fullName,
          role: 'blogger'
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Create blogger
      const { data: newBlogger, error: bloggerError } = await supabase
        .from('bloggers')
        .insert({
          profile_id: newProfile.id,
          handle: formData.handle,
          bio: formData.bio,
          gender: formData.gender,
          topics: formData.topics,
          post_price: formData.postPrice ? parseFloat(formData.postPrice) : null,
          story_price: formData.storyPrice ? parseFloat(formData.storyPrice) : null,
          barter_available: formData.barterAvailable,
          mart_available: formData.martAvailable,
          work_conditions: formData.workConditions,
          restricted_topics: formData.restrictedTopics
        })
        .select()
        .single();

      if (bloggerError) throw bloggerError;

      // Add platforms
      for (const [platformType, data] of Object.entries(formData.platforms)) {
        if (data.followers > 0) {
          await supabase
            .from('platforms')
            .insert({
              blogger_id: newBlogger.id,
              platform_type: platformType as any,
              followers: data.followers,
              engagement_rate: data.engagement_rate,
              post_reach: data.post_reach,
              story_reach: data.story_reach,
              is_active: true
            });
        }
      }

      toast({
        title: "Сохранено",
        description: `Блогер ${formData.fullName} успешно добавлен`
      });

      resetForm();
    } catch (error) {
      console.error('Error saving blogger:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить блогера",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const importFromGoogleSheets = async () => {
    if (!googleSheetsUrl) {
      toast({
        title: "Ошибка",
        description: "Введите ссылку на Google Sheets",
        variant: "destructive"
      });
      return;
    }

    setImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('import-bloggers', {
        body: { googleSheetsUrl }
      });

      if (error) throw error;

      toast({
        title: "Импорт завершён",
        description: `Импортировано ${data.imported} блогеров`
      });

      setGoogleSheetsUrl('');
    } catch (error) {
      console.error('Error importing from Google Sheets:', error);
      toast({
        title: "Ошибка импорта",
        description: "Не удалось импортировать данные из Google Sheets",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  const importFromCSV = async () => {
    if (!csvData) {
      toast({
        title: "Ошибка",
        description: "Введите CSV данные",
        variant: "destructive"
      });
      return;
    }

    setImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('import-bloggers', {
        body: { csvData }
      });

      if (error) throw error;

      toast({
        title: "Импорт завершён",
        description: `Импортировано ${data.imported} блогеров`
      });

      setCsvData('');
    } catch (error) {
      console.error('Error importing from CSV:', error);
      toast({
        title: "Ошибка импорта",
        description: "Не удалось импортировать CSV данные",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Доступ запрещён</CardTitle>
            <CardDescription>У вас нет прав администратора</CardDescription>
          </CardHeader>
        </Card>
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Администрирование блогеров</h1>
          
          <Tabs defaultValue="quick-add" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quick-add">Быстрое добавление</TabsTrigger>
              <TabsTrigger value="google-sheets">Google Sheets</TabsTrigger>
              <TabsTrigger value="csv-import">CSV импорт</TabsTrigger>
            </TabsList>
            
            <TabsContent value="quick-add" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Быстрое добавление блогера</CardTitle>
                  <CardDescription>
                    Заполните основную информацию для быстрого создания профиля
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Полное имя *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Имя блогера"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="handle">Handle *</Label>
                      <Input
                        id="handle"
                        value={formData.handle}
                        onChange={(e) => setFormData(prev => ({ ...prev, handle: e.target.value }))}
                        placeholder="@nickname"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Пол</Label>
                      <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
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
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Биография</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Краткое описание блогера"
                      rows={2}
                    />
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postPrice">Цена поста (BYN)</Label>
                      <Input
                        id="postPrice"
                        type="number"
                        value={formData.postPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, postPrice: e.target.value }))}
                        placeholder="1000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="storyPrice">Цена stories (BYN)</Label>
                      <Input
                        id="storyPrice"
                        type="number"
                        value={formData.storyPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, storyPrice: e.target.value }))}
                        placeholder="500"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Checkbox
                        id="barter"
                        checked={formData.barterAvailable}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, barterAvailable: checked === true }))}
                      />
                      <Label htmlFor="barter">Бартер</Label>
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Checkbox
                        id="mart"
                        checked={formData.martAvailable}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, martAvailable: checked === true }))}
                      />
                      <Label htmlFor="mart">MART</Label>
                    </div>
                  </div>

                  {/* Platforms */}
                  <div className="space-y-4">
                    <Label>Платформы</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {platformTypes.map(platform => (
                        <Card key={platform}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">{platformLabels[platform as keyof typeof platformLabels]}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">Подписчики</Label>
                                <Input
                                  type="number"
                                  placeholder="10000"
                                  value={formData.platforms[platform]?.followers || ''}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    platforms: {
                                      ...prev.platforms,
                                      [platform]: {
                                        ...prev.platforms[platform],
                                        followers: parseInt(e.target.value) || 0,
                                        engagement_rate: prev.platforms[platform]?.engagement_rate || 0,
                                        post_reach: prev.platforms[platform]?.post_reach || 0,
                                        story_reach: prev.platforms[platform]?.story_reach || 0
                                      }
                                    }
                                  }))}
                                  className="h-8 text-xs"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Вовлечённость (%)</Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  placeholder="5.2"
                                  value={formData.platforms[platform]?.engagement_rate || ''}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    platforms: {
                                      ...prev.platforms,
                                      [platform]: {
                                        ...prev.platforms[platform],
                                        engagement_rate: parseFloat(e.target.value) || 0,
                                        followers: prev.platforms[platform]?.followers || 0,
                                        post_reach: prev.platforms[platform]?.post_reach || 0,
                                        story_reach: prev.platforms[platform]?.story_reach || 0
                                      }
                                    }
                                  }))}
                                  className="h-8 text-xs"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">Охват постов</Label>
                                <Input
                                  type="number"
                                  placeholder="8000"
                                  value={formData.platforms[platform]?.post_reach || ''}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    platforms: {
                                      ...prev.platforms,
                                      [platform]: {
                                        ...prev.platforms[platform],
                                        post_reach: parseInt(e.target.value) || 0,
                                        followers: prev.platforms[platform]?.followers || 0,
                                        engagement_rate: prev.platforms[platform]?.engagement_rate || 0,
                                        story_reach: prev.platforms[platform]?.story_reach || 0
                                      }
                                    }
                                  }))}
                                  className="h-8 text-xs"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Охват stories</Label>
                                <Input
                                  type="number"
                                  placeholder="6000"
                                  value={formData.platforms[platform]?.story_reach || ''}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    platforms: {
                                      ...prev.platforms,
                                      [platform]: {
                                        ...prev.platforms[platform],
                                        story_reach: parseInt(e.target.value) || 0,
                                        followers: prev.platforms[platform]?.followers || 0,
                                        engagement_rate: prev.platforms[platform]?.engagement_rate || 0,
                                        post_reach: prev.platforms[platform]?.post_reach || 0
                                      }
                                    }
                                  }))}
                                  className="h-8 text-xs"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Topics */}
                  <div className="space-y-4">
                    <div>
                      <Label>Темы контента</Label>
                      <div className="flex gap-2 mt-2">
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
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {topicSuggestions.map(topic => (
                          <Badge
                            key={topic}
                            variant={formData.topics.includes(topic) ? "default" : "outline"}
                            className="cursor-pointer text-xs"
                            onClick={() => {
                              if (formData.topics.includes(topic)) {
                                removeTopic(topic);
                              } else {
                                setFormData(prev => ({ ...prev, topics: [...prev.topics, topic] }));
                              }
                            }}
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.topics.filter(topic => !topicSuggestions.includes(topic)).map(topic => (
                          <Badge key={topic} variant="default" className="flex items-center gap-1 text-xs">
                            {topic}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeTopic(topic)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <Button onClick={saveBlogger} disabled={loading} className="flex-1">
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-2 h-4 w-4" />
                      Сохранить блогера
                    </Button>
                    <Button onClick={resetForm} variant="outline">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Очистить форму
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="google-sheets" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Импорт из Google Sheets</CardTitle>
                  <CardDescription>
                    Импортируйте данные блогеров из Google Sheets. Таблица должна содержать столбцы: name, handle, bio, gender, topics, post_price, story_price, instagram_followers, etc.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="googleSheetsUrl">URL Google Sheets</Label>
                    <Input
                      id="googleSheetsUrl"
                      value={googleSheetsUrl}
                      onChange={(e) => setGoogleSheetsUrl(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                    />
                  </div>
                  
                  <Button onClick={importFromGoogleSheets} disabled={importing} className="w-full">
                    {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Импортировать из Google Sheets
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="csv-import" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Импорт CSV данных</CardTitle>
                  <CardDescription>
                    Вставьте CSV данные с колонками: name, handle, bio, gender, topics, post_price, story_price, instagram_followers, и т.д.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="csvData">CSV данные</Label>
                    <Textarea
                      id="csvData"
                      value={csvData}
                      onChange={(e) => setCsvData(e.target.value)}
                      placeholder="name,handle,bio,gender,topics,post_price,story_price,instagram_followers..."
                      rows={10}
                    />
                  </div>
                  
                  <Button onClick={importFromCSV} disabled={importing} className="w-full">
                    {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Upload className="mr-2 h-4 w-4" />
                    Импортировать CSV данные
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;