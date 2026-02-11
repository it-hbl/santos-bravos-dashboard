"use client";

import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Dashboard error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <div className="text-center space-y-4 max-w-md p-8">
              <div className="text-4xl">⚠️</div>
              <h1 className="text-xl font-bold">Dashboard Loading Error</h1>
              <p className="text-neutral-400 text-sm">
                {this.state.error?.message || "An unexpected error occurred."}
              </p>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Reload Dashboard
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
