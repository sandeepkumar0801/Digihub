// BarcodeManagement.js
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarcode } from '@fortawesome/free-solid-svg-icons';

export const BarcodeManagement = () => {
  const [barcodes, setBarcodes] = useState([]);

  const addBarcode = (barcode) => {
    setBarcodes([...barcodes, barcode]);
  };

  return (
    <button className="submit green" onClick={() => addBarcode('123456')}>
      <FontAwesomeIcon icon={faBarcode} /> Barcode
    </button>
  );
};
