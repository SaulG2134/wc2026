import { Component } from 'react'
import { C } from '../constants.js'

/**
 * Catches any render error in child components and shows a friendly message
 * instead of a blank screen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 32, textAlign: 'center',
        }}>
          <div>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ color: 'white', marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>
              {this.state.error.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => this.setState({ error: null })}
              style={{
                background: C.accent, color: '#000', border: 'none', borderRadius: 20,
                padding: '8px 24px', fontWeight: 700, cursor: 'pointer', fontSize: 13,
              }}
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
