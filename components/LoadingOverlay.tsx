'use client';

import React from 'react';

const LoadingOverlay = () => {
  return (
    <div className="loading-wrapper">
      <div className="loading-shadow-wrapper">
        <div className="loading-shadow" />
      </div>
      <div className="loading-animation" />
      <div className="flex flex-col items-center gap-2">
        <h2 className="loading-title">Synthesizing Your Book</h2>
        <div className="loading-progress">
          <div className="loading-progress-item animate-pulse" />
          <div className="loading-progress-item animate-pulse delay-75" />
          <div className="loading-progress-item animate-pulse delay-150" />
        </div>
        <p className="loading-progress-status text-center">
          Analyzing PDF structure and generating AI voice model...
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
