import React, { useState } from 'react'
import { api } from '../../services/api'
import Button from '../../components/Button'

export default function NewPostForm({ onCreate }) {
	const [text, setText] = useState('')
	const [loading, setLoading] = useState(false)

	const submit = async (e) => {
		e.preventDefault()
		if (!text.trim()) return
		setLoading(true)
		try {
			const created = await api.createPost({ content: text })
			setText('')
			onCreate && onCreate(created)
		} catch (err) {
			console.error(err)
			alert('Could not create post')
		} finally {
			setLoading(false)
		}
	}

	return (
		<form onSubmit={submit} className="stack">
			<div className="form-field">
				<label className="small muted">Share something</label>
				<textarea
					placeholder="What's happening?"
					value={text}
					onChange={(e) => setText(e.target.value)}
				/>
			</div>
			<div className="row">
				<Button type="submit">{loading ? 'Posting...' : 'Post'}</Button>
			</div>
		</form>
	)
}
