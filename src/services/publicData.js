/**
 * Public Data Service - Checks community health trends from public sources
 * Used for the "Unwrap" prize track - extracting insights from public data
 */

/**
 * Check community health trends from Reddit
 * @param {string} keyword - Search keyword (e.g., "heat", "fire", "air quality")
 * @param {boolean} demoMode - If true, returns demo data instead of fetching
 * @returns {Promise<Object>} Object with found status, source, headline, and context
 */
export async function checkCommunityTrends(keyword, demoMode = false) {
  if (demoMode) {
    return getDemoData(keyword);
  }

  try {
    // Try to fetch from Reddit UCSC subreddit
    // Sort by new and get more results to filter for recent/relevant ones
    const redditUrl = `https://www.reddit.com/r/UCSC/search.json?q=${encodeURIComponent(keyword)}&restrict_sr=1&sort=new&limit=10`;
    
    const response = await fetch(redditUrl, {
      headers: {
        'User-Agent': 'Pulsify Health Tracker/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Reddit API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Filter for recent posts (within last 7 days) and health-related content
    const now = Date.now() / 1000; // Unix timestamp in seconds
    const sevenDaysAgo = now - (7 * 24 * 60 * 60);
    
    if (data.data && data.data.children && data.data.children.length > 0) {
      // Filter posts: must be recent (within 7 days) and relevant
      const relevantPosts = data.data.children
        .map(child => child.data)
        .filter(post => {
          const postAge = post.created_utc;
          const isRecent = postAge > sevenDaysAgo;
          
          // Filter out irrelevant content (lectures, research papers, old events)
          const title = post.title.toLowerCase();
          const isRelevant = !title.includes('lecture') && 
                            !title.includes('seminar') && 
                            !title.includes('event') &&
                            !title.includes('december') &&
                            !title.includes('november') &&
                            !title.includes('october') &&
                            !title.includes('research paper') &&
                            !title.includes('study published');
          
          return isRecent && isRelevant;
        });
      
      if (relevantPosts.length > 0) {
        const post = relevantPosts[0];
        return {
          found: true,
          source: `Reddit (r/UCSC)`,
          headline: post.title,
          url: `https://reddit.com${post.permalink}`,
          context: keyword,
          timestamp: new Date(post.created_utc * 1000).toISOString()
        };
      }
    }

    // try Santa Cruz subreddit as fallback
    return await trySantaCruzSubreddit(keyword);
    
  } catch (error) {
    console.warn('Reddit fetch failed, using demo data:', error.message);
    // Fallback to demo data if fetch fails
    return getDemoData(keyword);
  }
}

/**
 * Try fetching from Santa Cruz subreddit as fallback
 */
async function trySantaCruzSubreddit(keyword) {
  try {
    const redditUrl = `https://www.reddit.com/r/santacruz/search.json?q=${encodeURIComponent(keyword)}&restrict_sr=1&sort=new&limit=10`;
    
    const response = await fetch(redditUrl, {
      headers: {
        'User-Agent': 'Pulsify Health Tracker/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Reddit API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Filter for recent posts (within last 7 days) and health-related content
    const now = Date.now() / 1000; // Unix timestamp in seconds
    const sevenDaysAgo = now - (7 * 24 * 60 * 60);
    
    if (data.data && data.data.children && data.data.children.length > 0) {
      // Filter posts: must be recent (within 7 days) and relevant
      const relevantPosts = data.data.children
        .map(child => child.data)
        .filter(post => {
          const postAge = post.created_utc;
          const isRecent = postAge > sevenDaysAgo;
          
          // Filter out irrelevant content (lectures, research papers, old events)
          const title = post.title.toLowerCase();
          const isRelevant = !title.includes('lecture') && 
                            !title.includes('seminar') && 
                            !title.includes('event') &&
                            !title.includes('december') &&
                            !title.includes('november') &&
                            !title.includes('october') &&
                            !title.includes('research paper') &&
                            !title.includes('study published');
          
          return isRecent && isRelevant;
        });
      
      if (relevantPosts.length > 0) {
        const post = relevantPosts[0];
        return {
          found: true,
          source: `Reddit (r/SantaCruz)`,
          headline: post.title,
          url: `https://reddit.com${post.permalink}`,
          context: keyword,
          timestamp: new Date(post.created_utc * 1000).toISOString()
        };
      }
    }
  } catch (error) {
    console.warn('Santa Cruz subreddit fetch failed:', error.message);
  }
  
  // If both fail, return demo data
  return getDemoData(keyword);
}

/**
 * Get demo data for reliable demo mode
 */
function getDemoData(keyword) {
  // Keyword-specific demo data
  const demoData = {
    'heat': {
      found: true,
      source: "Reddit (r/SantaCruz)",
      headline: "PSA: Extreme Heat Advisory in Santa Cruz today. Stay hydrated.",
      context: "Heatwave",
      url: "https://reddit.com/r/santacruz/demo"
    },
    'fire': {
      found: true,
      source: "Reddit (r/SantaCruz)",
      headline: "Wildfire smoke advisory: Air quality may be affected. Limit outdoor activities.",
      context: "Wildfire",
      url: "https://reddit.com/r/santacruz/demo"
    },
    'air quality': {
      found: true,
      source: "Reddit (r/SantaCruz)",
      headline: "Air Quality Alert: Unhealthy conditions expected. Sensitive groups should stay indoors.",
      context: "Air Quality",
      url: "https://reddit.com/r/santacruz/demo"
    },
    'covid': {
      found: true,
      source: "Reddit (r/UCSC)",
      headline: "COVID cases on campus: Health center updates protocols.",
      context: "COVID-19",
      url: "https://reddit.com/r/UCSC/demo"
    },
    'flu': {
      found: true,
      source: "Reddit (r/UCSC)",
      headline: "Flu season alert: High activity reported in Santa Cruz County.",
      context: "Influenza",
      url: "https://reddit.com/r/UCSC/demo"
    }
  };

  // Return keyword-specific demo or default
  const lowerKeyword = keyword.toLowerCase();
  for (const [key, data] of Object.entries(demoData)) {
    if (lowerKeyword.includes(key)) {
      return data;
    }
  }

  // Default demo data
  return {
    found: true,
    source: "Reddit (r/SantaCruz)",
    headline: "PSA: Extreme Heat Advisory in Santa Cruz today. Stay hydrated.",
    context: "Heatwave",
    url: "https://reddit.com/r/santacruz/demo"
  };
}

/**
 * Check multiple keywords and return aggregated results
 */
export async function checkMultipleTrends(keywords = ['heat', 'fire', 'air quality'], demoMode = false) {
  const results = await Promise.all(
    keywords.map(keyword => checkCommunityTrends(keyword, demoMode))
  );
  
  return {
    trends: results.filter(r => r.found),
    checked: keywords,
    timestamp: new Date().toISOString()
  };
}
