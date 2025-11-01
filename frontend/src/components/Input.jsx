import React from 'react'

export default function Input({ label, ...props }) {
  return (
    <label className="form-field">
      {label && <span className="small muted">{label}</span>}
      <input className="input" {...props} />
    </label>
  )
}
