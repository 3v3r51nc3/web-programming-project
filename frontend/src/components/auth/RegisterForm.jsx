// Frontend developer: Mehdi AGHAEI
import { useState } from 'react'
import { buttonClassNames } from '../../styles'
import InlineNotice from '../common/InlineNotice'

export default function RegisterForm({
  authState = { pending: false, error: '' },
  disabled = false,
  helperText = '',
  onSubmit,
}) {
  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
  })

  function updateField(event) {
    const { name, value } = event.target
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (disabled || !onSubmit) {
      return
    }

    onSubmit(formValues)
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <label className="field">
        <span>First name</span>
        <input name="firstName" onChange={updateField} placeholder="Leila" type="text" value={formValues.firstName} />
      </label>

      <label className="field">
        <span>Last name</span>
        <input name="lastName" onChange={updateField} placeholder="Rahmani" type="text" value={formValues.lastName} />
      </label>

      <label className="field">
        <span>Username</span>
        <input name="username" onChange={updateField} placeholder="leila_rahmani" type="text" value={formValues.username} />
      </label>

      <label className="field">
        <span>Email</span>
        <input name="email" onChange={updateField} placeholder="leila@example.com" type="email" value={formValues.email} />
      </label>

      <label className="field field--full">
        <span>Password</span>
        <input
          name="password"
          onChange={updateField}
          placeholder="Create a secure password"
          type="password"
          value={formValues.password}
        />
      </label>

      {helperText ? <p className="micro-copy field--full">{helperText}</p> : null}
      {authState.error ? <InlineNotice message={authState.error} tone="error" /> : null}

      <button className={buttonClassNames.secondary} disabled={disabled || authState.pending} type="submit">
        {disabled ? 'Register after backend merge' : authState.pending ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  )
}
