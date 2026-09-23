import { Component } from "react";

// Última línea de defensa: si algo lanza una excepción durante el render,
// evita que toda la app quede en blanco y ofrece una forma de recuperarse.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Error no controlado:", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__box">
            <h1>No pudimos cargar esta información.</h1>
            <p>Ocurrió un error inesperado. Intenta nuevamente.</p>
            <button className="btn btn--primary" onClick={this.handleRetry}>
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
