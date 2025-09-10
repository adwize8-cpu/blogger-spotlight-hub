import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BloggerData {
  name: string;
  handle: string;
  bio?: string;
  gender?: string;
  topics?: string[];
  post_price?: number;
  story_price?: number;
  barter_available?: boolean;
  mart_available?: boolean;
  work_conditions?: string;
  restricted_topics?: string[];
  instagram_followers?: number;
  instagram_engagement?: number;
  instagram_post_reach?: number;
  instagram_story_reach?: number;
  youtube_followers?: number;
  youtube_engagement?: number;
  youtube_post_reach?: number;
  youtube_story_reach?: number;
  telegram_followers?: number;
  telegram_engagement?: number;
  telegram_post_reach?: number;
  telegram_story_reach?: number;
  tiktok_followers?: number;
  tiktok_engagement?: number;
  tiktok_post_reach?: number;
  tiktok_story_reach?: number;
}

serve(async (req) => {
  console.log('Import bloggers function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the user is authenticated and is an admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { googleSheetsUrl, csvData } = await req.json();
    console.log('Request data:', { googleSheetsUrl: !!googleSheetsUrl, csvData: !!csvData });

    let bloggers: BloggerData[] = [];

    if (googleSheetsUrl) {
      // Extract spreadsheet ID from URL
      const sheetIdMatch = googleSheetsUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!sheetIdMatch) {
        throw new Error('Invalid Google Sheets URL');
      }

      const sheetId = sheetIdMatch[1];
      const csvExportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      
      console.log('Fetching Google Sheets data from:', csvExportUrl);

      const response = await fetch(csvExportUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch Google Sheets data: ${response.statusText}`);
      }

      const csvText = await response.text();
      bloggers = parseCSV(csvText);
    } else if (csvData) {
      console.log('Parsing CSV data');
      bloggers = parseCSV(csvData);
    } else {
      throw new Error('Either googleSheetsUrl or csvData must be provided');
    }

    console.log(`Parsed ${bloggers.length} bloggers`);

    let imported = 0;
    const errors = [];

    for (const blogger of bloggers) {
      try {
        // Check if blogger already exists
        const { data: existingBlogger } = await supabase
          .from('bloggers')
          .select('id')
          .eq('handle', blogger.handle.startsWith('@') ? blogger.handle : `@${blogger.handle}`)
          .single();

        if (existingBlogger) {
          console.log(`Blogger ${blogger.name} already exists, skipping`);
          continue;
        }

        // Create a placeholder user ID for this blogger (for import purposes only)
        const placeholderUserId = crypto.randomUUID();
        const anonymousEmail = `anonymous-${placeholderUserId.slice(0, 8)}@blogger.local`;

        // Create profile without real email exposure
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: placeholderUserId,
            email: anonymousEmail, // Use anonymous email for imported bloggers
            full_name: blogger.name,
            role: 'blogger'
          })
          .select()
          .single();

        if (profileError) throw profileError;

        // Prepare topics array
        let topics: string[] = [];
        if (blogger.topics) {
          if (Array.isArray(blogger.topics)) {
            topics = blogger.topics;
          } else if (typeof blogger.topics === 'string') {
            topics = blogger.topics.split(',').map(t => t.trim()).filter(t => t);
          }
        }

        // Prepare restricted topics array
        let restrictedTopics: string[] = [];
        if (blogger.restricted_topics) {
          if (Array.isArray(blogger.restricted_topics)) {
            restrictedTopics = blogger.restricted_topics;
          } else if (typeof blogger.restricted_topics === 'string') {
            restrictedTopics = blogger.restricted_topics.split(',').map(t => t.trim()).filter(t => t);
          }
        }

        // Create blogger
        const { data: newBlogger, error: bloggerError } = await supabase
          .from('bloggers')
          .insert({
            profile_id: profile.id,
            handle: blogger.handle.startsWith('@') ? blogger.handle : `@${blogger.handle}`,
            bio: blogger.bio || '',
            gender: blogger.gender || '',
            topics: topics,
            post_price: blogger.post_price || null,
            story_price: blogger.story_price || null,
            barter_available: blogger.barter_available || false,
            mart_available: blogger.mart_available || false,
            work_conditions: blogger.work_conditions || '',
            restricted_topics: restrictedTopics
          })
          .select()
          .single();

        if (bloggerError) throw bloggerError;

        // Add platforms
        const platforms = [
          {
            type: 'instagram',
            followers: blogger.instagram_followers,
            engagement: blogger.instagram_engagement,
            post_reach: blogger.instagram_post_reach,
            story_reach: blogger.instagram_story_reach
          },
          {
            type: 'youtube',
            followers: blogger.youtube_followers,
            engagement: blogger.youtube_engagement,
            post_reach: blogger.youtube_post_reach,
            story_reach: blogger.youtube_story_reach
          },
          {
            type: 'telegram',
            followers: blogger.telegram_followers,
            engagement: blogger.telegram_engagement,
            post_reach: blogger.telegram_post_reach,
            story_reach: blogger.telegram_story_reach
          },
          {
            type: 'tiktok',
            followers: blogger.tiktok_followers,
            engagement: blogger.tiktok_engagement,
            post_reach: blogger.tiktok_post_reach,
            story_reach: blogger.tiktok_story_reach
          }
        ];

        for (const platform of platforms) {
          if (platform.followers && platform.followers > 0) {
            await supabase
              .from('platforms')
              .insert({
                blogger_id: newBlogger.id,
                platform_type: platform.type,
                followers: platform.followers,
                engagement_rate: platform.engagement || 0,
                post_reach: platform.post_reach || 0,
                story_reach: platform.story_reach || 0,
                is_active: true
              });
          }
        }

        imported++;
        console.log(`Successfully imported blogger: ${blogger.name}`);
      } catch (error) {
        console.error(`Failed to import blogger ${blogger.name}:`, error);
        errors.push({ blogger: blogger.name, error: error.message });
      }
    }

    console.log(`Import completed. Imported: ${imported}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({ 
        imported, 
        total: bloggers.length, 
        errors: errors.slice(0, 10) // Return only first 10 errors to avoid large response
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in import-bloggers function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function parseCSV(csvText: string): BloggerData[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const bloggers: BloggerData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < headers.length) continue;

    const blogger: any = {};
    
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      const value = values[j]?.trim();
      
      if (!value) continue;

      switch (header) {
        case 'name':
        case 'full_name':
          blogger.name = value;
          break;
        case 'handle':
        case 'username':
          blogger.handle = value;
          break;
        case 'bio':
        case 'description':
          blogger.bio = value;
          break;
        case 'gender':
        case 'sex':
          blogger.gender = value;
          break;
        case 'topics':
        case 'categories':
          blogger.topics = value.split(';').map((t: string) => t.trim()).filter((t: string) => t);
          break;
        case 'post_price':
        case 'price_post':
          blogger.post_price = parseFloat(value) || 0;
          break;
        case 'story_price':
        case 'price_story':
          blogger.story_price = parseFloat(value) || 0;
          break;
        case 'barter':
        case 'barter_available':
          blogger.barter_available = ['true', '1', 'да', 'yes'].includes(value.toLowerCase());
          break;
        case 'mart':
        case 'mart_available':
          blogger.mart_available = ['true', '1', 'да', 'yes'].includes(value.toLowerCase());
          break;
        case 'work_conditions':
        case 'conditions':
          blogger.work_conditions = value;
          break;
        case 'restricted_topics':
        case 'forbidden_topics':
          blogger.restricted_topics = value.split(';').map((t: string) => t.trim()).filter((t: string) => t);
          break;
        case 'instagram_followers':
        case 'ig_followers':
          blogger.instagram_followers = parseInt(value) || 0;
          break;
        case 'instagram_engagement':
        case 'ig_engagement':
          blogger.instagram_engagement = parseFloat(value) || 0;
          break;
        case 'instagram_post_reach':
        case 'ig_post_reach':
          blogger.instagram_post_reach = parseInt(value) || 0;
          break;
        case 'instagram_story_reach':
        case 'ig_story_reach':
          blogger.instagram_story_reach = parseInt(value) || 0;
          break;
        case 'youtube_followers':
        case 'yt_followers':
          blogger.youtube_followers = parseInt(value) || 0;
          break;
        case 'youtube_engagement':
        case 'yt_engagement':
          blogger.youtube_engagement = parseFloat(value) || 0;
          break;
        case 'youtube_post_reach':
        case 'yt_post_reach':
          blogger.youtube_post_reach = parseInt(value) || 0;
          break;
        case 'youtube_story_reach':
        case 'yt_story_reach':
          blogger.youtube_story_reach = parseInt(value) || 0;
          break;
        case 'telegram_followers':
        case 'tg_followers':
          blogger.telegram_followers = parseInt(value) || 0;
          break;
        case 'telegram_engagement':
        case 'tg_engagement':
          blogger.telegram_engagement = parseFloat(value) || 0;
          break;
        case 'telegram_post_reach':
        case 'tg_post_reach':
          blogger.telegram_post_reach = parseInt(value) || 0;
          break;
        case 'telegram_story_reach':
        case 'tg_story_reach':
          blogger.telegram_story_reach = parseInt(value) || 0;
          break;
        case 'tiktok_followers':
        case 'tt_followers':
          blogger.tiktok_followers = parseInt(value) || 0;
          break;
        case 'tiktok_engagement':
        case 'tt_engagement':
          blogger.tiktok_engagement = parseFloat(value) || 0;
          break;
        case 'tiktok_post_reach':
        case 'tt_post_reach':
          blogger.tiktok_post_reach = parseInt(value) || 0;
          break;
        case 'tiktok_story_reach':
        case 'tt_story_reach':
          blogger.tiktok_story_reach = parseInt(value) || 0;
          break;
      }
    }

    if (blogger.name && blogger.handle) {
      bloggers.push(blogger as BloggerData);
    }
  }

  return bloggers;
}

function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result.map(field => field.replace(/^"|"$/g, ''));
}