import React from 'react';

function CompanyCardSkeleton() {
  return (
    <article className="company-card social-card skeleton-card" aria-hidden="true">
      <div className="social-card-header">
        <div className="skeleton skeleton-avatar" />
        <div className="skeleton-identity">
          <div className="skeleton skeleton-text skeleton-text-lg" />
          <div className="skeleton skeleton-text skeleton-text-sm" />
        </div>
        <div className="skeleton-rank">
          <div className="skeleton skeleton-text skeleton-text-xs" />
          <div className="skeleton skeleton-pill" />
        </div>
      </div>
      <div className="skeleton skeleton-text skeleton-text-block" />
      <div className="skeleton-metrics">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton skeleton-metric" />
        ))}
      </div>
      <div className="skeleton-footer">
        <div className="skeleton skeleton-pill skeleton-pill-wide" />
        <div className="skeleton-actions">
          <div className="skeleton skeleton-btn" />
          <div className="skeleton skeleton-btn" />
        </div>
      </div>
    </article>
  );
}

export default CompanyCardSkeleton;
