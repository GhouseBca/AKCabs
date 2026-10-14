"use client";

import {
  Component,
  Fragment,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { ErrorState } from "@/components/ui/error-state";

type ErrorBoundaryProps = {
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  /** Called with the caught error and component stack (e.g. for logging). */
  onError?: (error: Error, info: ErrorInfo) => void;
};

type ErrorBoundaryState = {
  error: Error | null;
  resetKey: number;
};

/**
 * Catches render errors (including thrown Convex query errors) and shows an
 * `ErrorState` with a retry action that remounts the subtree.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, resetKey: 0 };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  reset = () => {
    this.setState((previous) => ({
      error: null,
      resetKey: previous.resetKey + 1,
    }));
  };

  render() {
    if (this.state.error) {
      return (
        <ErrorState
          title={this.props.title}
          description={this.props.description}
          onRetry={this.reset}
        />
      );
    }

    return (
      <Fragment key={this.state.resetKey}>{this.props.children}</Fragment>
    );
  }
}

export { ErrorBoundary };
export type { ErrorBoundaryProps };
