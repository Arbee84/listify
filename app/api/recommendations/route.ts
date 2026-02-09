import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { subcategoryId, items } = body

    if (!subcategoryId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Subcategory and items are required' },
        { status: 400 }
      )
    }

    // Convert items to lowercase for database matching
    const userList = items.map((item: string) => item.toLowerCase())

    // Complex recommendation algorithm from inspirenta
    // This SQL query:
    // 1. Calculates rank points based on position (1=8pts, 2=5pts, 3=3pts, 4=2pts, 5+=0pts)
    // 2. Adds bonus points (+15) if list has #1 match with user
    // 3. Calculates hit percentage (% of user's items found in each list)
    // 4. Adds final score based on hit percentage (≥80%=+100, ≥60%=+50, ≥30%=+25, >0%=+5)
    // 5. Excludes user's own lists and items already in user's list

    const query = `
      WITH user_info AS (
        SELECT i.item_id, unnest($1::text[]) AS list_item,
               generate_subscripts($1::text[], 1) AS list_rank
        FROM items i
        WHERE i.item_name = ANY($1::text[])
      ),
      result_set1 AS (
        SELECT
          CASE WHEN l.list_rank = 1 THEN 8
               WHEN l.list_rank = 2 THEN 5
               WHEN l.list_rank = 3 THEN 3
               WHEN l.list_rank = 4 THEN 2
               ELSE 0
          END AS rank_points,
          CASE WHEN ui.list_rank = 1 AND l.list_rank = 1
               THEN l.list_id ELSE 0 END AS lists_with_no1_match,
          100 * SUM(CASE WHEN ui.item_id IS NOT NULL THEN 1 ELSE 0 END)
              OVER (PARTITION BY l.list_id) / (SELECT COUNT(*) FROM user_info)
              AS hit_percentage,
          l.item_id,
          l.list_id
        FROM lists_meta lm
        INNER JOIN lists l ON l.list_id = lm.list_id
        LEFT JOIN user_info ui ON ui.item_id = l.item_id
        WHERE lm.subcategory_id = $2
        AND lm.account_id <> $3
        AND lm.state = true
      ),
      result_set2 AS (
        SELECT
          item_id,
          CASE WHEN SUM(lists_with_no1_match) OVER (PARTITION BY list_id) > 0
               THEN rank_points + 15 ELSE rank_points END AS bonus_points,
          hit_percentage
        FROM result_set1
      )
      SELECT i.item_name,
          SUM(bonus_points) +
          SUM(CASE
              WHEN hit_percentage >= 80 THEN 100
              WHEN hit_percentage >= 60 THEN 50
              WHEN hit_percentage >= 30 THEN 25
              WHEN hit_percentage > 0 THEN 5
              ELSE 0
          END) AS points
      FROM result_set2 rs2
      INNER JOIN items i ON i.item_id = rs2.item_id
      WHERE NOT EXISTS (
          SELECT 1 FROM user_info ui WHERE ui.item_id = rs2.item_id
      )
      AND hit_percentage > 0
      GROUP BY i.item_name
      ORDER BY points DESC
      LIMIT 50
    `

    const recommendations = await prisma.$queryRawUnsafe<{ item_name: string; points: number }[]>(
      query,
      userList,
      subcategoryId,
      session.user_id
    )

    // Capitalize results for display
    const formattedRecommendations = recommendations.map(rec => ({
      itemName: rec.item_name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      points: Number(rec.points),
    }))

    return NextResponse.json(formattedRecommendations)
  } catch (error) {
    console.error('Error finding recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to find recommendations' },
      { status: 500 }
    )
  }
}
