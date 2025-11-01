import React from 'react'

export default function Button({ children, onClick, className = '', type = 'button' }) {
  return (
    <button type={type} onClick={onClick} className={`btn ${className}`}>
      {children}
    </button>
  )
}
