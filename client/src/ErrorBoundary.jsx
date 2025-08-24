import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(p){ super(p); this.state = { error: null, info: null }; }
  static getDerivedStateFromError(error){ return { error }; }
  componentDidCatch(error, info){ console.error("UI error:", error, info); this.setState({ info }); }
  render(){
    if (this.state.error) {
      return (
        <div className="p-4 m-4 rounded bg-red-100 text-red-800">
          <div className="font-bold mb-2">UI crashed:</div>
          <pre className="whitespace-pre-wrap text-xs">
{String(this.state.error?.message || this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}