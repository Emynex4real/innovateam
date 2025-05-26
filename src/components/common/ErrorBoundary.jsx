import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
          <div className="mx-auto max-w-max">
            <main className="sm:flex">
              <ExclamationTriangleIcon
                className="h-12 w-12 text-red-500"
                aria-hidden="true"
              />
              <div className="sm:ml-6">
                <div className="sm:border-l sm:border-gray-200 sm:pl-6">
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                    Something went wrong
                  </h1>
                  <p className="mt-1 text-base text-gray-500">
                    We've encountered an error and are working to fix it.
                  </p>
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-4">
                      <details className="whitespace-pre-wrap text-sm text-gray-600">
                        <summary className="cursor-pointer text-primary-600 hover:text-primary-500">
                          View error details
                        </summary>
                        <pre className="mt-2 bg-gray-50 p-4 rounded-md overflow-auto">
                          {this.state.error && this.state.error.toString()}
                          {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
                <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
                  <Button
                    onClick={() => window.location.reload()}
                    variant="primary"
                  >
                    Refresh page
                  </Button>
                  <Button
                    onClick={this.handleReset}
                    variant="secondary"
                  >
                    Try again
                  </Button>
                </div>
              </div>
            </main>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 