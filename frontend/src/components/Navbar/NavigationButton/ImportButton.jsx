import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImport, faDownload } from '@fortawesome/free-solid-svg-icons';
import { Dialog } from 'primereact/dialog';
import { read, utils, writeFile } from "xlsx";

export const ImportButton = ({ onFileChange }) => {
  const fileInputRef = useRef(null);
  const [showDialog, setShowDialog] = useState(false);
  const [importButtonDisabled, setImportButtonDisabled] = useState(true);
  const [checkedNotes, setCheckedNotes] = useState(false);


  const handleFileChange = () => {
    if (fileInputRef.current && fileInputRef.current.files.length > 0) {
      setImportButtonDisabled(false);
    } else {
      setImportButtonDisabled(true);
    }
  };

  const hideUploadDialog = () => {
    setShowDialog(false);
  }

  const handleImport = () => {
    if (!importButtonDisabled) {
      const file = fileInputRef.current.files[0];
      if (file) {
        onFileChange(file);
        setShowDialog(false);
      }
    }
  };

  const exportSampleFileDownload = async () => {
    const wb = utils.book_new();
    const ws = utils.json_to_sheet([]);
    let headings = [["id", "title", "description", "option_1_name", "option_1_value", "option_2_name", "option_2_value",
      "sku", "gtin", "asin", "quantity", "price", "image_link", "brand", "tags", "category", "weight", "weight_unit", "height", "width",
      "length", "dimensions_units"
    ]];
    let data = [];
    utils.sheet_add_aoa(ws, headings);
    utils.sheet_add_json(ws, data, { origin: 'A2', skipHeader: true });
    utils.book_append_sheet(wb, ws, 'Report');
    writeFile(wb, `productSample.csv`);
  };

  return (
    <>
      <button className="submit light-blue" onClick={() => setShowDialog(true)}>
        <FontAwesomeIcon icon={faFileImport} /> Import
      </button>
      <Dialog visible={showDialog} onHide={hideUploadDialog}>
        <div className="upload-dialog-content">
          <h2>Import Products</h2>
          <div className="upload-options">
            <div className="local-upload">
              <div class="drag-drop-box">
                <input id="file-upload" type="file" class="file-upload-input" ref={fileInputRef} onChange={handleFileChange} accept=".csv" />
                <label for="file-upload" class="file-upload-label">
                  <span class="plus-icon">+</span>
                  <span class="drag-drop-text">
                    <FontAwesomeIcon icon={faFileImport} className="upload-icon" />
                    Upload a CSV file or Drag & Drop it
                  </span>
                </label>
              </div>
            </div>
            <div className="template-download" onClick={exportSampleFileDownload}>
              <a href="#" className="download-template">
                <FontAwesomeIcon icon={faDownload} className="download-icon" />
                Download Template
              </a>
            </div>
          </div>
          <div className="import-notes">
            <input type="checkbox" id="show-notes" checked={checkedNotes} onChange={() => setCheckedNotes(!checkedNotes)} />
              <p>
                Prior to importing your products, please ensure that you have assigned a unique SKU code to each product or variant.
                Nembol will link products with matching SKU codes. The duration of the import process may vary based on the quantity of products
                and their associated images. Please be aware that this operation cannot be paused or interrupted.
              </p>
          
          </div>
          <button className="submit-button" onClick={handleImport} disabled={!(!importButtonDisabled && checkedNotes)}>
            Import Products
          </button>
        </div>
      </Dialog>
    </>
  );
};


