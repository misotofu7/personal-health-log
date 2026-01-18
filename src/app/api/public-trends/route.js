import { checkCommunityTrends, checkMultipleTrends } from '../../../services/publicData';

/**
 * GET /api/public-trends?keyword=heat
 * Check community health trends from public sources (Reddit)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const demoMode = searchParams.get('demo') === 'true'; // Only use demo if explicitly requested
    
    if (!keyword) {
      return Response.json(
        { success: false, error: 'Keyword parameter required' },
        { status: 400 }
      );
    }

    // Try real Reddit fetch first (demoMode = false by default)
    const result = await checkCommunityTrends(keyword, demoMode);
    
    return Response.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error checking public trends:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/public-trends
 * Check multiple keywords at once
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { keywords = [], demoMode = false } = body;
    
    if (!Array.isArray(keywords) || keywords.length === 0) {
      return Response.json(
        { success: false, error: 'Keywords array required' },
        { status: 400 }
      );
    }

    const result = await checkMultipleTrends(keywords, demoMode);
    
    return Response.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error checking multiple trends:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
