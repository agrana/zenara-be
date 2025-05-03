export interface Quote {
  id: number;
  text: string;
  author: string;
}

export const quotes: Quote[] = [
  {
    id: 1,
    text: "The best way to predict your future is to create it.",
    author: "Abraham Lincoln"
  },
  {
    id: 2,
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
  },
  {
    id: 3,
    text: "The journey of a thousand miles begins with one step.",
    author: "Lao Tzu"
  },
  {
    id: 4,
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson"
  },
  {
    id: 5,
    text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    id: 6,
    text: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs"
  },
  {
    id: 7,
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    id: 8,
    text: "Do not wait to strike till the iron is hot; but make it hot by striking.",
    author: "William Butler Yeats"
  },
  {
    id: 9,
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    id: 10,
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius"
  },
  {
    id: 11,
    text: "What you do today can improve all your tomorrows.",
    author: "Ralph Marston"
  },
  {
    id: 12,
    text: "Success usually comes to those who are too busy to be looking for it.",
    author: "Henry David Thoreau"
  },
  {
    id: 13,
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  },
  {
    id: 14,
    text: "The harder you work for something, the greater you'll feel when you achieve it.",
    author: "Anonymous"
  },
  {
    id: 15,
    text: "Your imagination is your preview of life's coming attractions.",
    author: "Albert Einstein"
  },
  {
    id: 16,
    text: "Begin anywhere.",
    author: "John Cage"
  },
  {
    id: 17,
    text: "Don't count the days, make the days count.",
    author: "Muhammad Ali"
  },
  {
    id: 18,
    text: "With the new day comes new strength and new thoughts.",
    author: "Eleanor Roosevelt"
  },
  {
    id: 19,
    text: "The difference between ordinary and extraordinary is that little extra.",
    author: "Jimmy Johnson"
  },
  {
    id: 20,
    text: "Never give up on a dream just because of the time it will take to accomplish it. The time will pass anyway.",
    author: "Earl Nightingale"
  }
];

export const getRandomQuote = (): Quote => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
};

export const getQuoteOfTheDay = (): Quote => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % quotes.length;
  return quotes[index];
};
