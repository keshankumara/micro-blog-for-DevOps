import React, { useEffect, useState } from 'react'
import NewPostForm from '../features/Posts/NewPostForm'
import PostList from '../features/Posts/PostList'
import Card from '../components/Card'
import { api } from '../services/api'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    api
      .getPosts()
      .then((r) => mounted && setPosts(r || []))
      .catch(() => {})
      .finally(() => mounted && setLoading(false))
    return () => (mounted = false)
  }, [])

  const addPost = (p) => setPosts((s) => [p, ...s])

  return (
    <div className="layout">
      <main>
        <section className="stack">
          <Card>
            <NewPostForm onCreate={addPost} />
          </Card>

          <Card>
            <h2>Recent posts</h2>
            <div style={{ marginTop: '.75rem' }}>
              <PostList posts={posts} loading={loading} />
            </div>
          </Card>
        </section>
      </main>

      <aside>
        <Card>
          <h3>Your profile</h3>
          <p className="muted small">Log in to manage your posts and profile.</p>
        </Card>
      </aside>
    </div>
  )
}
