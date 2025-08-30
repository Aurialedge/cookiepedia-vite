import React from 'react';

const Post = ({ post }) => {
  return (
    <div className="post">
      <div className="post-header">
        <img src={post.avatar} alt={`${post.author}'s avatar`} className="avatar" />
        <h3>{post.author}</h3>
      </div>
      <img src={post.image} alt="Post" className="post-image" />
      <div className="post-caption">
        <p>
          <strong>{post.author}</strong> {post.caption}
        </p>
      </div>
    </div>
  );
};

export default Post;
