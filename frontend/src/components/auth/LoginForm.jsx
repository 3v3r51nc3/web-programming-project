// Frontend developer: Mehdi AGHAEI
import { useState } from 'react'
import { buttonClassNames } from '../../styles'
import InlineNotice from '../common/InlineNotice'

export default function LoginForm({ authState, onSubmit }) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  })

  function updateField(event) {
    const { name, value } = event.target
    setCredentials((currentCredentials) => ({
      ...currentCredentials,
      [name]: value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(credentials)
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <label className="field">
        <span>Username</span>
        <input
          autoComplete="username"
          name="username"
          onChange={updateField}
          placeholder="eventhub_admin"
          type="text"
          value={credentials.username}
        />
      </label>

      <label className="field">
        <span>Password</span>
        <input
          autoComplete="current-password"
          name="password"
          onChange={updateField}
          placeholder="Enter your Django password"
          type="password"
          value={credentials.password}
        />
      </label>

      {authState.error ? <InlineNotice message={authState.error} tone="error" /> : null}

      <button className={buttonClassNames.primaryWide} disabled={authState.pending} type="submit">
        {authState.pending ? 'Signing in...' : 'Enter dashboard'}
      </button>
    </form>
  )
}
