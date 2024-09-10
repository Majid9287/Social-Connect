import Story from "@lib/models/Story";
import { connectToDB } from "@lib/mongodb/mongoose";

// Comprehensive list of stop words
const stopWords = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at", 
  "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", 
  "can't", "cannot", "could", "couldn't", 
  "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", 
  "each", 
  "few", "for", "from", "further", 
  "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", 
  "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", 
  "let's", 
  "me", "more", "most", "mustn't", "my", "myself", 
  "no", "nor", "not", 
  "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", 
  "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", 
  "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", 
  "under", "until", "up", 
  "very", 
  "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", 
  "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"
]);

// Helper function to get common words from titles
const getCommonWords = (titles) => {
  const wordCounts = {};

  titles.forEach(title => {
    const words = title.toLowerCase().split(/\W+/);
    words.forEach(word => {
      if (!stopWords.has(word) && word.length > 1) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
  });

  return Object.keys(wordCounts)
    .sort((a, b) => wordCounts[b] - wordCounts[a]); // Sort by frequency
};

// Helper function to fetch stories and get common words for a given period
const fetchTrendingWordsForPeriod = async (startDate, endDate) => {
  const stories = await Story.find({
    createdAt: { $gte: startDate, $lt: endDate }
  }).select('title').lean().exec();

  const titles = stories.map(story => story.title);
  return getCommonWords(titles);
};

// GET: Fetch trending words from story titles for day, week, and month
export const GET = async (req) => {
  try {
    await connectToDB();
    const endDate = new Date();

    const dayStartDate = new Date();
    dayStartDate.setDate(endDate.getDate() - 1);

    const weekStartDate = new Date();
    weekStartDate.setDate(endDate.getDate() - 7);

    const monthStartDate = new Date();
    monthStartDate.setMonth(endDate.getMonth() - 1);

    const [dayWords, weekWords, monthWords] = await Promise.all([
      fetchTrendingWordsForPeriod(dayStartDate, endDate),
      fetchTrendingWordsForPeriod(weekStartDate, endDate),
      fetchTrendingWordsForPeriod(monthStartDate, endDate)
    ]);

    // Combine and deduplicate words
    const allWords = [...new Set([...dayWords, ...weekWords, ...monthWords])];

    // Get the most common words among day, week, and month
    const trendingWords = allWords.filter(word =>
      dayWords.includes(word) && weekWords.includes(word) && monthWords.includes(word)
    ).slice(0, 8);

    return new Response(JSON.stringify(trendingWords), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to fetch trending words" }), { status: 500 });
  }
};
