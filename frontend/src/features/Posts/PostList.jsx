import React from 'react'
import PostItem from './PostItem'

export default function PostList({ posts = [], loading }) {
	if (loading) return <div className="muted">Loading posts...</div>
	if (!posts || posts.length === 0) return <div className="muted">No posts yet</div>

	return (
		<div className="posts">
			{posts.map((p) => (
				<PostItem key={p._id || p.id} post={p} />
			))}
		</div>
	)
}
