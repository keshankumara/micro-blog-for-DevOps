import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Card from '../components/Card'
import { api } from '../services/api'
import PostList from '../features/Posts/PostList'

export default function Profile() {
  const { id } = useParams()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    api
      .getUserPosts(id)
      .then((r) => mounted && setPosts(r || []))
      .catch(() => {})
      .finally(() => mounted && setLoading(false))
    return () => (mounted = false)
  }, [id])

  return (
    <div className="app-container">
      <Card>
        <h2>Profile</h2>
        <p className="muted small">Showing posts for user {id}</p>
      </Card>

      <div style={{ marginTop: '1rem' }}>
        <PostList posts={posts} loading={loading} />
      </div>
    </div>
  )
}
