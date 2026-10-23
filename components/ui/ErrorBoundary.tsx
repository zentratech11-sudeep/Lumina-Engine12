"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  /** Names the protected section in console warnings. */
  label?: string;
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Contains a failure (bad model, lost WebGL context, bad data) to one section of the page. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn(`[${this.props.label ?? "section"}] failed and was replaced by its fallback.`, error, info.componentStack);
    this.props.onError?.(error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
