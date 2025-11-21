import React from 'react'

export const Button = ({ children, variant = 'primary', ...props }) => {
  return (
    <button className={`button button--${variant}`} {...props}>
      {children}
    </button>
  )
}