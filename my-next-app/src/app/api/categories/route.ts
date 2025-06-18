import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface Category extends RowDataPacket{
  name: string;
  count: number;
}

export async function  GET() {
    try {
        // const categories = await executeQuery<Category> (`
        //     SELECT category, COUNT(id) as count
        //     FROM posts
        //     WHERE category IS NOT NULL AND category != ''
        //     GROUP BY category
        //     ORDER BY count DESC, category ASC
        // `);
        const categories = await executeQuery<Category> (`
            SELECT 
                c.name, 
                (SELECT COUNT(*) FROM posts p WHERE p.category_id = c.id) as count
            FROM categories c
            WHERE (SELECT COUNT(*) FROM posts p WHERE p.category_id = c.id) > 0
            ORDER BY count DESC, c.name ASC
        `);

        return NextResponse.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('카테고리 조회 오류: ', error)
        return NextResponse.json(
            { success: false, error: '카테고리 조회 실패' },
            { status: 500 }
        );
    }
    
}