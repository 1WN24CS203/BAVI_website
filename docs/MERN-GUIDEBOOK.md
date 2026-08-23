# Building a MERN Web App: A Beginner's Guidebook

This guide teaches you how to build a small but functioning MERN application from the current BAVI project. The example application is a **Task Tracker** where users can view, add, update, and delete tasks.

The guide assumes you are new to full-stack JavaScript. Follow the chapters in order. The code is intentionally simple so that you can understand every request from the browser to the database.

## 1. What MERN Means

MERN is four technologies used together:

- **MongoDB**: Stores application data as documents.
- **Express**: Provides a web server and API routes.
- **React**: Builds the browser interface.
- **Node.js**: Runs JavaScript on the server.

The request flow looks like this:

```text
User clicks a React button
        |
        v
React sends HTTP request with fetch()
        |
        v
Express route receives the request
        |
        v
Mongoose talks to MongoDB
        |
        v
Server returns JSON
        |
        v
React updates its state and redraws the page
```

React is not the database, and MongoDB does not render pages. Each part has a focused responsibility.

## 2. What You Already Have

Your current project is a Vite React client:

```text
BAVI/
  client/
    index.html       Browser HTML shell
    package.json     Client dependencies and scripts
    vite.config.js   Vite configuration
    src/
      main.jsx       React entry point
      App.jsx        Main component
      App.css        App styles
      index.css      Global styles
      assets/        Imported images
    public/          Files served directly by URL
```

The browser starts at `client/index.html`. Its `root` element is filled by `client/src/main.jsx`, which renders `App`. The missing server will be added beside `client`:

```text
BAVI/
  client/            React frontend
  server/            Node and Express backend
    src/
      server.js
      db.js
      models/Task.js
      routes/taskRoutes.js
    .env
    .gitignore
    package.json
```

## 3. Prerequisites

Install these tools before starting:

- Node.js LTS, which includes `npm`
- VS Code
- A MongoDB Atlas account, or MongoDB Community Server locally
- A web browser
- Basic JavaScript: variables, functions, arrays, objects, and `async/await`

Check Node and npm in PowerShell:

```powershell
node --version
npm --version
```

Use two terminals during development: one for the server and one for the client.

## 4. Create the Server

From the `BAVI` folder, create and initialize the backend:

```powershell
mkdir server
cd server
npm init -y
npm install express mongoose cors dotenv
npm install --save-dev nodemon
```

Update `server/package.json` scripts:

```json
{
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  }
}
```

Create the folders:

```powershell
mkdir src
mkdir src\models
mkdir src\routes
```

### 4.1 Environment variables

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://your_user:your_password@your-cluster.mongodb.net/task_tracker
CLIENT_URL=http://localhost:5173
```

Never commit passwords or connection strings. Create `server/.gitignore`:

```gitignore
node_modules/
.env
```

For MongoDB Atlas, create a database user, allow your development IP address in Network Access, and copy the driver connection string. Replace the username, password, cluster, and database name.

### 4.2 Connect to MongoDB

Create `server/src/db.js`:

```js
import mongoose from 'mongoose'

export async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing from the environment')
  }

  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')
}
```

### 4.3 Define a model

A Mongoose model describes the shape of a MongoDB document and gives you methods for reading and changing it. Create `server/src/models/Task.js`:

```js
import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 120,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

export const Task = mongoose.model('Task', taskSchema)
```

A document will look similar to this:

```json
{
  "_id": "generated-by-mongodb",
  "title": "Learn Express routes",
  "completed": false,
  "createdAt": "2026-08-23T10:00:00.000Z",
  "updatedAt": "2026-08-23T10:00:00.000Z"
}
```

### 4.4 Create API routes

An API route combines an HTTP method with a URL. Create `server/src/routes/taskRoutes.js`:

```js
import { Router } from 'express'
import { Task } from '../models/Task.js'

const router = Router()

router.get('/', async (request, response, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 })
    response.json(tasks)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (request, response, next) => {
  try {
    const title = request.body.title?.trim()

    if (!title) {
      return response.status(400).json({ message: 'Title is required' })
    }

    const task = await Task.create({ title })
    response.status(201).json(task)
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', async (request, response, next) => {
  try {
    const task = await Task.findByIdAndUpdate(
      request.params.id,
      { completed: request.body.completed },
      { new: true, runValidators: true },
    )

    if (!task) {
      return response.status(404).json({ message: 'Task not found' })
    }

    response.json(task)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', async (request, response, next) => {
  try {
    const task = await Task.findByIdAndDelete(request.params.id)

    if (!task) {
      return response.status(404).json({ message: 'Task not found' })
    }

    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

export default router
```

The routes implement CRUD:

| Method | URL | Purpose |
| --- | --- | --- |
| `GET` | `/api/tasks` | Read all tasks |
| `POST` | `/api/tasks` | Create a task |
| `PATCH` | `/api/tasks/:id` | Change completion status |
| `DELETE` | `/api/tasks/:id` | Delete a task |

The `:id` part is a URL parameter. For example, `/api/tasks/abc123` makes `request.params.id` equal to `abc123`.

### 4.5 Start Express

Create `server/src/server.js`:

```js
import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { connectDatabase } from './db.js'
import taskRoutes from './routes/taskRoutes.js'

const app = express()
const port = process.env.PORT || 5000

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (request, response) => {
  response.json({ status: 'ok' })
})

app.use('/api/tasks', taskRoutes)

app.use((error, request, response, next) => {
  console.error(error)
  response.status(500).json({ message: 'Something went wrong on the server' })
})

connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`API running at http://localhost:${port}`)
    })
  })
  .catch((error) => {
    console.error('Unable to start server', error)
    process.exit(1)
  })
```

Important middleware:

- `cors()` allows the React development server to call the API.
- `express.json()` converts JSON request bodies into `request.body`.
- `app.use('/api/tasks', taskRoutes)` prefixes every task route with `/api/tasks`.

Run the backend:

```powershell
cd server
npm run dev
```

Test the health endpoint in a browser:

```text
http://localhost:5000/api/health
```

Expected result:

```json
{"status":"ok"}
```

## 5. Build the React Pages

Install the router in the client:

```powershell
cd client
npm install react-router-dom
```

Create these files:

```text
client/src/
  pages/
    Home.jsx
    Tasks.jsx
  components/
    TaskForm.jsx
    TaskList.jsx
```

### 5.1 Add routes and navigation

Replace the starter content in `client/src/App.jsx`:

```jsx
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Tasks from './pages/Tasks.jsx'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/tasks">Tasks</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<Tasks />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

Create `client/src/pages/Home.jsx`:

```jsx
import { Link } from 'react-router-dom'

function Home() {
  return (
    <main className="page">
      <h1>Task Tracker</h1>
      <p>Organize your work with a simple MERN application.</p>
      <Link className="button" to="/tasks">
        Open tasks
      </Link>
    </main>
  )
}

export default Home
```

`Link` changes the URL through React Router without performing a full browser reload. Use an ordinary `<a href="https://example.com">` for external websites.

## 6. Connect React to the API

Create `client/src/pages/Tasks.jsx`:

```jsx
import { useEffect, useState } from 'react'

const API_URL = 'http://localhost:5000/api/tasks'

function Tasks() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadTasks() {
    try {
      setError('')
      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error('Could not load tasks')
      }

      setTasks(await response.json())
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  async function addTask(event) {
    event.preventDefault()

    if (!title.trim()) return

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })

    if (!response.ok) {
      setError('Could not create task')
      return
    }

    const newTask = await response.json()
    setTasks((currentTasks) => [newTask, ...currentTasks])
    setTitle('')
  }

  async function toggleTask(task) {
    const response = await fetch(`${API_URL}/${task._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed }),
    })

    if (!response.ok) {
      setError('Could not update task')
      return
    }

    const updatedTask = await response.json()
    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask._id === updatedTask._id ? updatedTask : currentTask,
      ),
    )
  }

  async function deleteTask(id) {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })

    if (!response.ok) {
      setError('Could not delete task')
      return
    }

    setTasks((currentTasks) =>
      currentTasks.filter((currentTask) => currentTask._id !== id),
    )
  }

  return (
    <main className="page">
      <h1>Your Tasks</h1>

      <form onSubmit={addTask}>
        <label htmlFor="task-title">New task</label>
        <input
          id="task-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Learn MongoDB"
        />
        <button type="submit">Add task</button>
      </form>

      {loading && <p>Loading tasks...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && tasks.length === 0 && <p>No tasks yet.</p>}

      <ul>
        {tasks.map((task) => (
          <li key={task._id}>
            <button type="button" onClick={() => toggleTask(task)}>
              {task.completed ? 'Undo' : 'Complete'}
            </button>
            <span className={task.completed ? 'completed' : ''}>
              {task.title}
            </span>
            <button type="button" onClick={() => deleteTask(task._id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default Tasks
```

The most important React ideas in this page are:

- `useState` stores data that can change and causes a re-render.
- `useEffect` runs `loadTasks` after the page first appears.
- `fetch` sends HTTP requests to Express.
- `map` creates an updated list without mutating the old state.
- `filter` removes a deleted task from the displayed list.
- `key={task._id}` gives React a stable identity for each list item.

Add basic styles to `client/src/App.css`:

```css
nav {
  display: flex;
  gap: 1rem;
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--border);
}

nav a {
  color: var(--text-h);
  text-decoration: none;
}

.page {
  max-width: 720px;
  margin: 0 auto;
  padding: 3rem 2rem;
  text-align: left;
}

.page form {
  display: flex;
  gap: 0.75rem;
  align-items: end;
  margin: 2rem 0;
}

.page label {
  display: block;
}

.page input {
  min-width: 0;
  flex: 1;
  padding: 0.65rem;
}

.page li {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin: 0.75rem 0;
}

.page li span {
  flex: 1;
}

.completed {
  text-decoration: line-through;
  opacity: 0.6;
}

.button {
  display: inline-block;
  margin-top: 1.5rem;
}

@media (max-width: 600px) {
  .page form {
    align-items: stretch;
    flex-direction: column;
  }
}
```

Start both applications:

```powershell
# Terminal 1
cd BAVI\server
npm run dev

# Terminal 2
cd BAVI\client
npm run dev
```

Open the client URL printed by Vite, usually `http://localhost:5173`. Open `/tasks` and create a task. The task should be saved in MongoDB, not just in browser memory.

## 7. Understand a Complete Create Request

When you submit the form:

1. `onSubmit={addTask}` calls `addTask`.
2. `event.preventDefault()` stops the browser from reloading.
3. `fetch` sends `POST http://localhost:5000/api/tasks`.
4. `JSON.stringify({ title })` creates the request body.
5. Express `express.json()` reads that body.
6. The `POST /` route validates the title.
7. `Task.create` inserts a MongoDB document.
8. Express sends the new task as JSON.
9. React adds it to `tasks` with `setTasks`.
10. React renders the new list item.

This request flow is the central pattern you will use for nearly every MERN feature.

## 8. Common Problems and Fixes

### CORS error

Make sure the server has `cors()` and that `CLIENT_URL` matches the Vite URL exactly.

### MongoDB connection fails

Check `MONGODB_URI`, the Atlas IP allowlist, the database user password, and whether special characters in the password need URL encoding.

### `Cannot use import statement outside a module`

Add `"type": "module"` to `server/package.json`.

### The page is blank

Check the browser developer console and the terminal running Vite. A JSX syntax error often appears there.

### API returns 404

Confirm that the server is running on port `5000` and that the client URL is `/api/tasks`, not only `/tasks`. `/tasks` is a React page; `/api/tasks` is the backend endpoint.

### Data appears but disappears after refresh

The app may only be updating React state. Make sure the server route calls MongoDB and that the client calls `GET /api/tasks` when the page loads.

### Delete or update does not work

Use MongoDB's `_id` in the URL and confirm that the request method is `PATCH` or `DELETE` as required by the route.

## 9. Improve the Project Structure

As the application grows, move repeated responsibilities into separate files:

```text
server/src/
  controllers/       Request logic
  middleware/        Authentication and error middleware
  models/            Mongoose schemas
  routes/            URL and HTTP method definitions
  db.js              Database connection
  server.js          Application startup

client/src/
  components/        Reusable visual pieces
  pages/             URL-level screens
  services/           API request functions
  hooks/             Reusable React hooks
  App.jsx            Router and global layout
```

For example, later you can move API calls into `client/src/services/taskService.js`:

```js
const API_URL = 'http://localhost:5000/api/tasks'

export async function getTasks() {
  const response = await fetch(API_URL)

  if (!response.ok) throw new Error('Could not load tasks')
  return response.json()
}
```

This keeps page components focused on presentation and state.

## 10. Authentication Comes Later

Do not begin with authentication until you can build and understand CRUD. When you are ready, the usual flow is:

1. Create a `User` model.
2. Hash passwords with `bcrypt`.
3. Create login and registration routes.
4. Issue a signed session or JWT.
5. Protect task routes with authentication middleware.
6. Store an owner ID on every task.
7. Only query tasks belonging to the logged-in user.

Never store plain-text passwords. Never put a server secret in React source code. A browser can inspect every client-side value.

## 11. Production Checklist

Before deploying:

- Validate all request input on the server.
- Keep `.env` out of Git.
- Use a restricted MongoDB user.
- Configure a production CORS origin instead of `*`.
- Add useful loading, empty, and error states.
- Add tests for important API routes.
- Run `npm run lint` and `npm run build` in the client.
- Use HTTPS in production.
- Do not trust IDs, prices, permissions, or user roles sent by the browser.
- Log errors without exposing secrets.

A common deployment arrangement is a hosted React client, a hosted Node/Express server, and MongoDB Atlas. Set the production client URL and API URL through environment variables rather than hard-coding local addresses.

## 12. A Good Learning Sequence

Build features in this order:

1. Render static React components.
2. Add CSS and responsive layouts.
3. Add React Router pages.
4. Store temporary data with `useState`.
5. Build one Express health endpoint.
6. Connect Express to MongoDB.
7. Implement one resource with CRUD routes.
8. Connect React to those routes with `fetch`.
9. Add validation and error states.
10. Add authentication.
11. Test and deploy.

Do not try to memorize every package. Learn the movement of data: component state, HTTP request, Express route, model query, JSON response, and state update.

## 13. Essential Vocabulary

- **Component**: A reusable React function that returns JSX.
- **JSX**: HTML-like syntax written inside JavaScript.
- **State**: Data owned by a React component that can change.
- **Props**: Data passed from a parent component to a child component.
- **Route**: A backend method and URL, or a frontend URL and screen.
- **API**: A contract that lets software communicate.
- **Middleware**: A function that runs during an Express request.
- **Schema**: Rules describing the shape of stored data.
- **Model**: A Mongoose object used to work with a MongoDB collection.
- **CRUD**: Create, Read, Update, Delete.
- **Environment variable**: Configuration supplied outside source code.

## Final Result

After completing this guide, your app has:

- A React home page and task page.
- Navigation without full page reloads.
- An Express API.
- A MongoDB connection.
- A Mongoose task model.
- Create, read, update, and delete functionality.
- Loading, empty, validation, and error states.

That is a real MERN application. From here, add one feature at a time and trace each feature through the same frontend-to-backend-to-database flow.
