import React, { useState } from 'react';
import './CreatePost.css';

const CreatePost = ({ onPost }) => {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!caption || !image) return;
    onPost({ caption, image });
    setCaption('');
    setImage(null);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="create-post">
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="What's on your mind?"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button type="submit">Post</button>
      </form>
    </div>
  );
};

export default CreatePost;
