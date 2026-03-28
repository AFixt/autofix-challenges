import { useState } from 'react';
import './Feed.css';

/**
 * Inaccessible Feed
 *
 * Accessibility issues:
 * 1. Feed container has no role="feed"
 * 2. Individual posts have no role="article"
 * 3. No aria-setsize or aria-posinset on articles
 * 4. No aria-labelledby on articles
 * 5. No aria-describedby for post content
 * 6. No keyboard navigation between articles (Page Down/Up)
 * 7. "Load More" is a div, not a button
 * 8. No aria-busy while loading
 * 9. No accessible labeling of interactive elements (like, comment)
 * 10. Timestamps not in accessible format
 */

const initialPosts = [
  { id: 1, author: 'Sarah Chen', avatar: 'SC', time: '2h', content: 'Just shipped the new dashboard redesign! Really proud of how the team pulled together on this one. Check it out and let me know what you think.', likes: 24, comments: 8 },
  { id: 2, author: 'Marcus Johnson', avatar: 'MJ', time: '4h', content: 'Great article on accessibility in modern web frameworks. We need to do better as an industry. Sharing some key takeaways in the thread below.', likes: 47, comments: 15 },
  { id: 3, author: 'Emily Rodriguez', avatar: 'ER', time: '6h', content: 'Excited to announce that our open-source component library just hit 10k stars on GitHub! Thanks to everyone who contributed.', likes: 132, comments: 28 },
];

const morePosts = [
  { id: 4, author: 'David Park', avatar: 'DP', time: '8h', content: 'Working on a new talk about design systems for the upcoming conference. Any topics you would like me to cover?', likes: 18, comments: 12 },
  { id: 5, author: 'Lisa Wang', avatar: 'LW', time: '12h', content: 'Just completed the AWS Solutions Architect certification! If anyone has questions about the exam, feel free to reach out.', likes: 89, comments: 22 },
];

export default function Feed() {
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setPosts([...posts, ...morePosts]);
      setHasMore(false);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="feed-widget">
      <div className="feed-container">
        {posts.map((post) => (
          <div key={post.id} className="feed-post">
            <div className="post-header">
              <div className="post-avatar">{post.avatar}</div>
              <div className="post-meta">
                <div className="post-author">{post.author}</div>
                <div className="post-time">{post.time}</div>
              </div>
            </div>
            <div className="post-content">{post.content}</div>
            <div className="post-actions">
              <span className="post-action" onClick={() => {}}>♡ {post.likes}</span>
              <span className="post-action" onClick={() => {}}>💬 {post.comments}</span>
              <span className="post-action" onClick={() => {}}>↗ Share</span>
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="load-more" onClick={loadMore}>
          {loading ? 'Loading...' : 'Load More Posts'}
        </div>
      )}
    </div>
  );
}
