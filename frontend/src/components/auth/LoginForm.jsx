// Frontend developer: Mehdi AGHAEI
import { useState } from 'react'
import { buttonClassNames } from '../../styles'
import InlineNotice from '../common/InlineNotice'

export default function LoginForm({ authState, onSubmit }) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)

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
          placeholder="sorooshaghaei"
          type="text"
          value={credentials.username}
        />
      </label>

      <label className="field">
        <span>Password</span>
        <div className="field__control">
          <input
            autoComplete="current-password"
            name="password"
            onChange={updateField}
            placeholder="Enter your password"
            type={showPassword ? 'text' : 'password'}
            value={credentials.password}
          />
          <button
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className={`${buttonClassNames.ghost} field__toggle`}
            onClick={() => setShowPassword((currentValue) => !currentValue)}
            type="button"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </label>

      {authState.error ? <InlineNotice message={authState.error} tone="error" /> : null}

      <button className={`${buttonClassNames.primaryWide} field--full`} disabled={authState.pending} type="submit">
        {authState.pending ? 'Signing in...' : 'Enter dashboard'}
      </button>
    </form>
  )
}
