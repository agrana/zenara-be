// Nature background images from Unsplash (free to use)
// Categories: nature landscapes, forest scenes, ocean views, mountain vistas

export interface Background {
  id: string;
  url: string;
  category: 'landscape' | 'forest' | 'ocean' | 'mountain';
  credit: {
    name: string;
    link: string;
  };
}

export const backgroundImages: Background[] = [
  // Nature Landscapes (6)
  {
    id: 'landscape-1',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    category: 'landscape',
    credit: {
      name: 'Bailey Zindel',
      link: 'https://unsplash.com/photos/NRQV-hBF10M',
    },
  },
  {
    id: 'landscape-2',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05',
    category: 'landscape',
    credit: {
      name: 'Henry Be',
      link: 'https://unsplash.com/photos/IicyiaPYGGI',
    },
  },
  {
    id: 'landscape-3',
    url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b',
    category: 'landscape',
    credit: {
      name: 'Qingbao Meng',
      link: 'https://unsplash.com/photos/01_igFr7hd4',
    },
  },
  {
    id: 'landscape-4',
    url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e',
    category: 'landscape',
    credit: {
      name: 'Robert Lukeman',
      link: 'https://unsplash.com/photos/zNN6ubHmruI',
    },
  },
  {
    id: 'landscape-5',
    url: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f',
    category: 'landscape',
    credit: {
      name: 'Sebastian Unrau',
      link: 'https://unsplash.com/photos/sp-p7uuT0tw',
    },
  },
  {
    id: 'landscape-6',
    url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d',
    category: 'landscape',
    credit: {
      name: 'Tim Swaan',
      link: 'https://unsplash.com/photos/eOpewngf68w',
    },
  },
  
  // Forest Scenes (4)
  {
    id: 'forest-1',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b',
    category: 'forest',
    credit: {
      name: 'Olivier Guillard',
      link: 'https://unsplash.com/photos/FKJgBUDoVC0',
    },
  },
  {
    id: 'forest-2',
    url: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d',
    category: 'forest',
    credit: {
      name: 'Luca Bravo',
      link: 'https://unsplash.com/photos/VowIFDxogG4',
    },
  },
  {
    id: 'forest-3',
    url: 'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1',
    category: 'forest',
    credit: {
      name: 'Ales Krivec',
      link: 'https://unsplash.com/photos/4miBe6zg5r0',
    },
  },
  {
    id: 'forest-4',
    url: 'https://images.unsplash.com/photo-1511497584788-876760111969',
    category: 'forest',
    credit: {
      name: 'Sergei A',
      link: 'https://unsplash.com/photos/NLkXZQ7kHzE',
    },
  },
  
  // Ocean Views (4)
  {
    id: 'ocean-1',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    category: 'ocean',
    credit: {
      name: 'Sean O.',
      link: 'https://unsplash.com/photos/KMn4VEeEPR8',
    },
  },
  {
    id: 'ocean-2',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba',
    category: 'ocean',
    credit: {
      name: 'Zetong Li',
      link: 'https://unsplash.com/photos/U5rMrSI7Pn4',
    },
  },
  {
    id: 'ocean-3',
    url: 'https://images.unsplash.com/photo-1545579133-99bb5ab189bd',
    category: 'ocean',
    credit: {
      name: 'Jeremy Bishop',
      link: 'https://unsplash.com/photos/8xznAGy4HcY',
    },
  },
  {
    id: 'ocean-4',
    url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843',
    category: 'ocean',
    credit: {
      name: 'Nicolas Cool',
      link: 'https://unsplash.com/photos/XQaqV5Wf8yI',
    },
  },
  
  // Mountain Vistas (4)
  {
    id: 'mountain-1',
    url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e',
    category: 'mountain',
    credit: {
      name: 'Jens Johnsson',
      link: 'https://unsplash.com/photos/8b8wKC07NXA',
    },
  },
  {
    id: 'mountain-2',
    url: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99',
    category: 'mountain',
    credit: {
      name: 'Joshua Earle',
      link: 'https://unsplash.com/photos/YrYdmIVSJEY',
    },
  },
  {
    id: 'mountain-3',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
    category: 'mountain',
    credit: {
      name: 'Kalen Emsley',
      link: 'https://unsplash.com/photos/Bkci_8qcdvQ',
    },
  },
  {
    id: 'mountain-4',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba',
    category: 'mountain',
    credit: {
      name: 'Jonatan Pie',
      link: 'https://unsplash.com/photos/h8nxGssjQXs',
    },
  },
];

export type BackgroundRotationType = 'daily' | 'hourly' | 'category' | 'random';

export const getBackgroundByRotationType = (
  type: BackgroundRotationType,
  category?: 'landscape' | 'forest' | 'ocean' | 'mountain'
): Background => {
  const date = new Date();
  let index = 0;
  
  switch (type) {
    case 'daily':
      // Use the day of the year to pick a background
      const start = new Date(date.getFullYear(), 0, 0);
      const diff = date.getTime() - start.getTime();
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);
      index = dayOfYear % backgroundImages.length;
      break;
    
    case 'hourly':
      // Use the hour to pick a background
      index = date.getHours() % backgroundImages.length;
      break;
    
    case 'category':
      // Filter by category if provided
      if (category) {
        const categoryImages = backgroundImages.filter(img => img.category === category);
        if (categoryImages.length > 0) {
          const categoryIndex = date.getDate() % categoryImages.length;
          return categoryImages[categoryIndex];
        }
      }
      // Fallback to random if category not found
      index = Math.floor(Math.random() * backgroundImages.length);
      break;
    
    case 'random':
    default:
      index = Math.floor(Math.random() * backgroundImages.length);
      break;
  }
  
  return backgroundImages[index];
};
