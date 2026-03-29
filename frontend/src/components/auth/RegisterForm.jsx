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
    confirmEmail: '',
    birthDate: '',
    password: '',
    passwordConfirmation: '',
  })
  const [showPasswords, setShowPasswords] = useState(false)

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
        <input
          autoComplete="given-name"
          name="firstName"
          onChange={updateField}
          placeholder="Soroosh"
          required
          type="text"
          value={formValues.firstName}
        />
      </label>

      <label className="field">
        <span>Last name</span>
        <input
          autoComplete="family-name"
          name="lastName"
          onChange={updateField}
          placeholder="Aghaei"
          required
          type="text"
          value={formValues.lastName}
        />
      </label>

      <label className="field">
        <span>Username</span>
        <input
          autoComplete="username"
          name="username"
          onChange={updateField}
          placeholder="sorooshaghaei"
          required
          type="text"
          value={formValues.username}
        />
      </label>

      <label className="field">
        <span>Email</span>
        <input
          autoComplete="email"
          name="email"
          onChange={updateField}
          placeholder="soroosh@example.com"
          required
          type="email"
          value={formValues.email}
        />
      </label>

      <label className="field">
        <span>Confirm email</span>
        <input
          name="confirmEmail"
          onChange={updateField}
          placeholder="Repeat your email address"
          required
          type="email"
          value={formValues.confirmEmail}
        />
      </label>

      <label className="field">
        <span>Date of birth</span>
        <input
          max={new Date().toISOString().split('T')[0]}
          name="birthDate"
          onChange={updateField}
          required
          type="date"
          value={formValues.birthDate}
        />
      </label>

      <label className="field field--full">
        <span>Password</span>
        <div className="field__control">
          <input
            autoComplete="new-password"
            minLength={8}
            name="password"
            onChange={updateField}
            placeholder="Create a secure password"
            required
            type={showPasswords ? 'text' : 'password'}
            value={formValues.password}
          />
          <button
            aria-label={showPasswords ? 'Hide password' : 'Show password'}
            className={`${buttonClassNames.ghost} field__toggle`}
            onClick={() => setShowPasswords((currentValue) => !currentValue)}
            type="button"
          >
            {showPasswords ? 'Hide' : 'Show'}
          </button>
        </div>
      </label>

      <label className="field field--full">
        <span>Confirm password</span>
        <div className="field__control">
          <input
            autoComplete="new-password"
            minLength={8}
            name="passwordConfirmation"
            onChange={updateField}
            placeholder="Repeat the password"
            required
            type={showPasswords ? 'text' : 'password'}
            value={formValues.passwordConfirmation}
          />
          <button
            aria-label={showPasswords ? 'Hide password confirmation' : 'Show password confirmation'}
            className={`${buttonClassNames.ghost} field__toggle`}
            onClick={() => setShowPasswords((currentValue) => !currentValue)}
            type="button"
          >
            {showPasswords ? 'Hide' : 'Show'}
          </button>
        </div>
      </label>

      {helperText ? <p className="micro-copy field--full">{helperText}</p> : null}
      {authState.error ? <InlineNotice message={authState.error} tone="error" /> : null}

      <button
        className={`${buttonClassNames.secondary} primary-button--wide field--full`}
        disabled={disabled || authState.pending}
        type="submit"
      >
        {disabled ? 'Registration unavailable' : authState.pending ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  )
}
