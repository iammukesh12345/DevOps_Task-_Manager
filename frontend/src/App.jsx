import { useEffect, useState } from 'react'

const API = '/api'

function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadTasks() {
    const response = await fetch(`${API}/tasks`)
    if (!response.ok) throw new Error('Failed to load tasks')
    setTasks(await response.json())
    setLoading(false)
  }

  useEffect(() => {
    loadTasks().catch(console.error)
  }, [])

  async function addTask(event) {
    event.preventDefault()
    if (!title.trim()) return

    await fetch(`${API}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    })

    setTitle('')
    await loadTasks()
  }

  async function toggleTask(id) {
    await fetch(`${API}/tasks/${id}/toggle`, { method: 'PUT' })
    await loadTasks()
  }

  async function deleteTask(id) {
    await fetch(`${API}/tasks/${id}`, { method: 'DELETE' })
    await loadTasks()
  }

  return (
    <main className="container">
      <section className="card">
        <h1>DevOps Task Manager</h1>
        <p className="subtitle">Three-tier React + Spring Boot + MySQL application</p>

        <form onSubmit={addTask} className="task-form">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a task..."
          />
          <button type="submit">Add Task</button>
        </form>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul>
            {tasks.map(task => (
              <li key={task.id} className={task.completed ? 'completed' : ''}>
                <span onClick={() => toggleTask(task.id)}>{task.title}</span>
                <button onClick={() => deleteTask(task.id)}>Delete</button>
              </li>
            ))}
          </ul>
        )}

        {!loading && tasks.length === 0 && <p>No tasks yet.</p>}
      </section>
    </main>
  )
}

export default App
