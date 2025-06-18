import React, { useEffect, useState } from 'react';

export default function CommentBox({ game }) {
  const [comments, setComments] = useState([]);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [disabled, setDisabled] = useState(false);

  // Fetch comments
  const fetchComments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:8788/api/comments?game=' + encodeURIComponent(game));
      const data = await res.json();
      setComments(data.results || []);
    } catch (e) {
      setError('Failed to fetch comments');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, [game]);

  // Submit comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!author.trim() || !content.trim()) {
      setError('Name and comment cannot be empty');
      return;
    }
    if (content.length < 5 || content.length > 200) {
      setError('Comment must be 5-200 characters');
      return;
    }
    setDisabled(true);
    try {
      const res = await fetch('http://127.0.0.1:8788/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game, author, content })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Comment submitted!');
        setContent('');
        fetchComments();
      } else {
        setError(data.error || 'Failed to submit comment');
      }
    } catch (e) {
      setError('Failed to submit comment');
    }
    // Disable submit for 10 seconds
    setTimeout(() => setDisabled(false), 10000);
  };

  return (
    <div style={{border:'1px solid #aaa',background:'#23232b',padding:24,borderRadius:12,marginTop:32}}>
      <h2 style={{fontSize:20,marginBottom:16,color:'#fff'}}>Comments</h2>
      {loading ? <div style={{color:'#fff'}}>Loading...</div> : null}
      {error ? <div style={{color:'#ff6b6b',marginBottom:8}}>{error}</div> : null}
      {success ? <div style={{color:'#4caf50',marginBottom:8}}>{success}</div> : null}
      <form onSubmit={handleSubmit} style={{display:'flex',gap:12,alignItems:'center',marginBottom:20,flexWrap:'wrap'}}>
        <input
          type="text"
          placeholder="Your name"
          value={author}
          maxLength={20}
          onChange={e => setAuthor(e.target.value)}
          style={{
            width:120,
            height:40,
            borderRadius:6,
            border:'1px solid #444',
            background:'#18181f',
            color:'#fff',
            padding:'0 12px',
            fontSize:16
          }}
          disabled={disabled}
        />
        <textarea
          placeholder="Write a comment..."
          value={content}
          maxLength={200}
          onChange={e => setContent(e.target.value)}
          style={{
            flex:1,
            minWidth:220,
            height:40,
            borderRadius:6,
            border:'1px solid #444',
            background:'#18181f',
            color:'#fff',
            padding:'8px 12px',
            fontSize:16,
            resize:'none',
            lineHeight:'24px'
          }}
          disabled={disabled}
        />
        <button type="submit" disabled={disabled} style={{
          height:40,
          padding:'0 24px',
          borderRadius:6,
          border:'none',
          background:'#4f8cff',
          color:'#fff',
          fontWeight:600,
          fontSize:16,
          cursor:disabled ? 'not-allowed' : 'pointer',
          opacity:disabled ? 0.6 : 1
        }}>Send</button>
      </form>
      <div>
        {comments.length === 0 ? <div style={{color:'#ccc'}}>No comments yet. Be the first to comment!</div> : (
          comments.map(c => (
            <div key={c.id} style={{borderBottom:'1px solid #333',padding:'10px 0'}}>
              <b style={{color:'#4f8cff'}}>{c.author}</b> <span style={{color:'#888',fontSize:12}}>{c.created_at?.replace('T',' ').replace('Z','')}</span>
              <div style={{color:'#fff',marginTop:2}}>{c.content}</div>
            </div>
          ))
        )}
      </div>
      <div style={{marginTop:20,textAlign:'center',color:'#888',fontSize:12}}>
        © 2025 HordeHub. All rights reserved. | Contact: blazestone25@gmail.com | Privacy Policy | Terms of Service
      </div>
    </div>
  );
} 