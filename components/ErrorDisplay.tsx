
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-white bg-red-500/20 rounded-2xl p-6 border border-red-500">
      <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
      <h2 className="text-2xl font-bold text-red-300">Error</h2>
      <p className="mt-2 text-lg text-center text-red-300/80">{message}</p>
    </div>
  );
};

export default ErrorDisplay;
