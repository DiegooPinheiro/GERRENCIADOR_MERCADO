import React from 'react'

type State = { hasError: boolean; error?: Error }

// Allow children prop in props typing so TypeScript sees React children correctly
type Props = React.PropsWithChildren<{}>

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: {}) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: any) {
    // Log to console — you could hook a telemetry service here
    console.error('Uncaught error in App:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20 }}>
          <h2>Ocorreu um erro na aplicação</h2>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#a00' }}>{String(this.state.error)}</pre>
          <p>Tente recarregar a página ou verifique o console para mais detalhes.</p>
        </div>
      )
    }
    return this.props.children
  }
}
