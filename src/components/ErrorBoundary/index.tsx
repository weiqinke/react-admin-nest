import * as React from "react";
import { Button, Result, Typography } from "antd";

type FallbackElement = React.ReactElement | null;

export interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export type FallbackRender = (props: FallbackProps) => FallbackElement;

interface ErrorBoundaryProps {
  children?: React.ReactNode;
  fallback?: FallbackElement;
  FallbackComponent?: React.ComponentType<FallbackProps>;
  fallbackRender?: FallbackRender;
  onError?: (error: Error, info: React.ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: Array<unknown>;
  onResetKeysChange?: (
    prevResetKeys: Array<unknown> | undefined,
    resetKeys: Array<unknown> | undefined
  ) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

const changedArray = (a: Array<unknown> = [], b: Array<unknown> = []) => {
  return a.length !== b.length || a.some((item, index) => !Object.is(item, b[index]));
};

const initialState: ErrorBoundaryState = {
  error: null
};

/** 未传 fallback 时的内置兜底，避免边界自身再抛错把整页打穿 */
const DefaultFallback = ({ error, resetErrorBoundary }: FallbackProps) => (
  <Result
    status="warning"
    title="组件渲染失败"
    subTitle={import.meta.env.DEV ? error.message : "请重试，或联系管理员排查"}
    extra={
      <Button type="primary" onClick={resetErrorBoundary}>
        重新渲染
      </Button>
    }>
    {import.meta.env.DEV && error.stack ? (
      <Typography.Paragraph
        type="secondary"
        style={{ textAlign: "left", maxHeight: 160, overflow: "auto", fontSize: 12 }}>
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{error.stack}</pre>
      </Typography.Paragraph>
    ) : null}
  </Result>
);

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state = initialState;
  /** 跳过「刚进入错误态」那一次 didUpdate，避免误触发 resetKeys 重置 */
  private updatedWithError = false;

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary]", error, errorInfo.componentStack);
    }
  }

  componentDidUpdate(prevProps: Readonly<ErrorBoundaryProps>) {
    const { error } = this.state;
    const { resetKeys, onResetKeysChange } = this.props;

    if (error !== null && !this.updatedWithError) {
      this.updatedWithError = true;
      return;
    }

    if (error !== null && changedArray(prevProps.resetKeys, resetKeys)) {
      onResetKeysChange?.(prevProps.resetKeys, resetKeys);
      this.reset();
    }
  }

  reset = () => {
    this.updatedWithError = false;
    this.setState(initialState);
  };

  resetErrorBoundary = () => {
    this.props.onReset?.();
    this.reset();
  };

  render() {
    const { fallback, FallbackComponent, fallbackRender, children } = this.props;
    const { error } = this.state;

    if (error === null) {
      return children;
    }

    const fallbackProps: FallbackProps = {
      error,
      resetErrorBoundary: this.resetErrorBoundary
    };

    if (React.isValidElement(fallback)) {
      return fallback;
    }
    if (typeof fallbackRender === "function") {
      return fallbackRender(fallbackProps);
    }
    if (FallbackComponent) {
      return <FallbackComponent {...fallbackProps} />;
    }

    return <DefaultFallback {...fallbackProps} />;
  }
}

function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: ErrorBoundaryProps = {}
): React.ComponentType<P> {
  const Wrapped = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  const name = Component.displayName || Component.name || "Unknown";
  Wrapped.displayName = `withErrorBoundary(${name})`;

  return Wrapped;
}

/**
 * 把事件/异步里的错误抛进最近的 ErrorBoundary。
 * 用法：const showBoundary = useErrorHandler(); try { ... } catch (e) { showBoundary(e); }
 */
function useErrorHandler(givenError?: unknown) {
  const [error, setError] = React.useState<unknown>(null);
  if (givenError != null) throw givenError;
  if (error != null) throw error;
  return setError;
}

export { ErrorBoundary, useErrorHandler, withErrorBoundary, DefaultFallback };
