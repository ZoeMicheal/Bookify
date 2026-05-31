'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingOverlay = () => {
  return (
    <div className="loading-wrapper">
      <div className="loading-card">
        <Loader2 className="loading-spinner" />
        <div className="flex flex-col items-center gap-2">
          <h2 className="loading-title">Synthesizing Your Book</h2>
          <p className="loading-status">
            Analyzing PDF structure and generating AI voice model...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
