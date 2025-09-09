export interface Blogger {
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
  bio?: string;
  er?: string;
  workFormat?: string;
  mart?: boolean;
  barter?: boolean;
  restrictedTopics?: string[];
  socialLinks?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    telegram?: string;
  };
  platforms?: {
    instagram?: {
      followers: string;
      er: string;
      postReach: string;
      storyReach: string;
      postPrice: number;
      storyPrice: number;
    };
    tiktok?: {
      followers: string;
      er: string;
      reach: string;
      price: number;
    };
    youtube?: {
      subscribers: string;
      er: string;
      views: string;
      price: number;
    };
    telegram?: {
      subscribers: string;
      er: string;
      price24h: number;
      price48h: number;
    };
  };
  conditions?: string;
}

export const mockBloggers: Blogger[] = [
  {
    rank: 1,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b1d4?w=400&h=400&fit=crop&crop=face",
    name: "Анна Петрова",
    handle: "anna_petya",
    gender: "Девушка",
    topics: ["Мода и стиль", "Красота", "Lifestyle"],
    followers: "125.3K",
    postPrice: 2500,
    storyPrice: 800,
    postReach: "45.2K",
    storyReach: "32.1K",
    bio: "Fashion блогер из Минска. Рассказываю о модных трендах и красоте.",
    er: "4.8%",
    workFormat: "ИП",
    mart: true,
    barter: true,
    socialLinks: {
      instagram: "https://instagram.com/anna_petya",
      tiktok: "https://tiktok.com/@anna_petya"
    },
    platforms: {
      instagram: {
        followers: "125.3K",
        er: "4.8%",
        postReach: "45.2K",
        storyReach: "32.1K",
        postPrice: 2500,
        storyPrice: 800
      },
      tiktok: {
        followers: "89.2K",
        er: "6.2%",
        reach: "28.5K",
        price: 1200
      }
    },
    conditions: "Работаю по договору, предоплата 50%. Готова к долгосрочному сотрудничеству."
  },
  {
    rank: 2,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    name: "Дмитрий Козлов",
    handle: "dmitry_tech",
    gender: "Парень",
    topics: ["Технологии", "Lifestyle", "Автомобили"],
    followers: "98.7K",
    postPrice: 2200,
    storyPrice: 700,
    postReach: "38.9K",
    storyReach: "28.4K",
    bio: "Tech блогер и автолюбитель. Обзоры гаджетов и тест-драйвы.",
    er: "4.2%",
    workFormat: "Профессиональный доход",
    mart: false,
    barter: false,
    restrictedTopics: ["Алкоголь"],
    socialLinks: {
      instagram: "https://instagram.com/dmitry_tech",
      youtube: "https://youtube.com/@dmitrytech"
    },
    platforms: {
      instagram: {
        followers: "98.7K",
        er: "4.2%",
        postReach: "38.9K",
        storyReach: "28.4K",
        postPrice: 2200,
        storyPrice: 700
      },
      youtube: {
        subscribers: "45.3K",
        er: "5.1%",
        views: "125.7K",
        price: 3500
      }
    },
    conditions: "Только качественные бренды. Договор подряда, оплата по факту."
  },
  {
    rank: 3,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    name: "Елена Волкова",
    handle: "elena_travel",
    gender: "Девушка",
    topics: ["Путешествия", "Lifestyle", "Еда"],
    followers: "87.2K",
    postPrice: 1800,
    storyPrice: 600,
    postReach: "31.5K",
    storyReach: "24.8K",
    bio: "Путешествую по миру и делюсь впечатлениями. Люблю находить скрытые жемчужины.",
    er: "3.9%",
    workFormat: "ИП",
    mart: true,
    barter: true,
    socialLinks: {
      instagram: "https://instagram.com/elena_travel",
      telegram: "https://t.me/elena_travels"
    },
    platforms: {
      instagram: {
        followers: "87.2K",
        er: "3.9%",
        postReach: "31.5K",
        storyReach: "24.8K",
        postPrice: 1800,
        storyPrice: 600
      },
      telegram: {
        subscribers: "12.4K",
        er: "7.2%",
        price24h: 500,
        price48h: 800
      }
    },
    conditions: "Предпочитаю бартерное сотрудничество с отелями и ресторанами."
  },
  {
    rank: 4,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    name: "Максим Спортов",
    handle: "max_fitness",
    gender: "Парень",
    topics: ["Спорт", "Здоровье", "Lifestyle"],
    followers: "76.8K",
    postPrice: 1600,
    storyPrice: 500,
    postReach: "29.2K",
    storyReach: "21.7K",
    bio: "Фитнес-тренер и нутрициолог. Помогаю людям достигать спортивных целей.",
    er: "4.1%",
    workFormat: "ИП",
    mart: false,
    barter: true,
    restrictedTopics: ["Алкоголь", "Табак"],
    socialLinks: {
      instagram: "https://instagram.com/max_fitness",
      youtube: "https://youtube.com/@maxfitness"
    },
    platforms: {
      instagram: {
        followers: "76.8K",
        er: "4.1%",
        postReach: "29.2K",
        storyReach: "21.7K",
        postPrice: 1600,
        storyPrice: 500
      },
      youtube: {
        subscribers: "23.1K",
        er: "6.8%",
        views: "89.4K",
        price: 2800
      }
    },
    conditions: "Сотрудничаю только с проверенными брендами спортивного питания."
  },
  {
    rank: 5,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    name: "София Мама",
    handle: "sofia_mama",
    gender: "Девушка",
    topics: ["Материнство", "Lifestyle", "Дети"],
    followers: "65.4K",
    postPrice: 1400,
    storyPrice: 450,
    postReach: "25.8K",
    storyReach: "18.9K",
    bio: "Мама двоих детей. Делюсь опытом материнства и семейными моментами.",
    er: "4.5%",
    workFormat: "Договор подряда",
    mart: true,
    barter: true,
    socialLinks: {
      instagram: "https://instagram.com/sofia_mama",
      telegram: "https://t.me/sofia_family"
    },
    platforms: {
      instagram: {
        followers: "65.4K",
        er: "4.5%",
        postReach: "25.8K",
        storyReach: "18.9K",
        postPrice: 1400,
        storyPrice: 450
      },
      telegram: {
        subscribers: "8.7K",
        er: "8.1%",
        price24h: 350,
        price48h: 550
      }
    },
    conditions: "Только детские и семейные бренды. Предоплата обязательна."
  }
];