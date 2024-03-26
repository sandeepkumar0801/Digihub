// RefreshButton.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';

export const RefreshButton = () => {
  const handleRefresh = () => {
    window.location.reload();
};
  return (
    <button className="submit red" onClick={handleRefresh}>
      <FontAwesomeIcon icon={faSyncAlt} /> Refresh
    </button>
  );
};
