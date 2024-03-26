// ExportButton.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport } from '@fortawesome/free-solid-svg-icons';
import { getProducts } from '../../../api/products';
import { read, utils, writeFile } from "xlsx";

export const ExportButton = () => {
  const exportProduct = async () => {
    const wb = utils.book_new();
    const ws = utils.json_to_sheet([]);
    let headings = [["id", "title", "description", "option_1_name", "option_1_value", "option_2_name", "option_2_value",
      "sku", "gtin", "asin", "quantity", "price", "image_link", "brand", "tags", "category", "weight", "weight_unit", "height", "width",
      "length", "dimensions_units"
    ]];
    let data = [];
    try {
      utils.sheet_add_aoa(ws, headings);
      data = await getProducts();
      
    } catch (error) {
      data = [];
      console.error('Error fetching products:', error);

    }
    utils.sheet_add_json(ws, data, { origin: 'A2', skipHeader: true });
    utils.book_append_sheet(wb, ws, 'Report');
    writeFile(wb, `product.csv`);
  };

  return (
    <button className="submit light-blue" onClick={exportProduct}>
      <FontAwesomeIcon icon={faFileExport} /> Export
    </button>
  );
};
