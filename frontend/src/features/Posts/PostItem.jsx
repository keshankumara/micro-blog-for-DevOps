import React from 'react'
import Card from '../../components/Card'

export default function PostItem({ post }) {
		// const id = post._id || post.id
	return (
		<Card className="">
			<div className="row" style={{ justifyContent: 'space-between' }}>
				<div>
					<strong>{post.author?.name || 'Anonymous'}</strong>
					<div className="muted small">{new Date(post.createdAt || Date.now()).toLocaleString()}</div>
				</div>
			</div>

			<div style={{ marginTop: '.5rem' }}>{post.content}</div>

			<div className="row" style={{ marginTop: '.75rem', justifyContent: 'flex-end' }}>
				<button className="btn ghost">Comment</button>
			</div>
		</Card>
	)
}
