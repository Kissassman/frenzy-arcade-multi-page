export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      
      // 处理 CORS
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });
      }

      // 获取评论列表，支持按 game 查询
      if (request.method === 'GET' && url.pathname === '/api/comments') {
        const game = url.searchParams.get('game');
        let comments;
        if (game) {
          comments = await env.DB.prepare(
            'SELECT * FROM comments WHERE game = ? ORDER BY created_at DESC'
          ).bind(game).all();
        } else {
          comments = await env.DB.prepare(
            'SELECT * FROM comments ORDER BY created_at DESC'
          ).all();
        }
        return new Response(JSON.stringify(comments), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // 添加新评论，需带 game 字段
      if (request.method === 'POST' && url.pathname === '/api/comments') {
        const { game, content, author } = await request.json();
        if (!game || !content || !author) {
          return new Response(JSON.stringify({ error: '缺少参数' }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
        // 内容长度校验
        if (content.length < 5 || content.length > 200) {
          return new Response(JSON.stringify({ error: '评论内容需5~200字' }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
        // 防刷：同一作者同一游戏1分钟只能发1条
        const recent = await env.DB.prepare(
          'SELECT * FROM comments WHERE game = ? AND author = ? AND created_at > datetime("now", "-1 minute")'
        ).bind(game, author).all();
        if (recent.results && recent.results.length > 0) {
          return new Response(JSON.stringify({ error: '请勿频繁评论' }), {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
        await env.DB.prepare(
          'INSERT INTO comments (game, content, author) VALUES (?, ?, ?)'
        ).bind(game, content, author).run();
        return new Response(JSON.stringify({ success: true }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // 处理首页
      if (request.method === 'GET' && url.pathname === '/') {
        return new Response(`<!DOCTYPE html><html><body><h1>Worker 正常运行</h1></body></html>`, {
          headers: {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
