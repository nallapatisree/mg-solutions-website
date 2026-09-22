'use client';

export default function GlobalError({ reset }) {
  // Deliberately does not render the error object - no stack traces reach the browser.
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-bold text-ink-900">Something went wrong</h1>
      <p className="mt-2 max-w-md text-ink-500">
        We hit an unexpected problem. Please try again in a moment.
      </p>
      <button onClick={reset} className="btn-primary mt-8">Try again</button>
    </div>
  );
}
