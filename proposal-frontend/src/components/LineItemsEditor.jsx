import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

export default function LineItemsEditor({ lineItems, onLineItemsChange, lineItemsEnabled, setLineItemsEnabled }) {
// export default function LineItemsEditor({ lineItems, onLineItemsChange }) {
  // const [lineItemsEnabled, setLineItemsEnabled] = useState(true);
  const [vatEnabled, setVatEnabled] = useState(false);
  const [globalVat, setGlobalVat] = useState(5); // default VAT %

  const addLineItem = () => {
    onLineItemsChange([
      ...lineItems,
      { description: '', quantity: 1, price: 0, active: true },
    ]);
  };

  const updateLineItem = (index, field, value) => {
    const newItems = [...lineItems];
    if (field === 'description') {
      newItems[index][field] = value;
    } else {
      newItems[index][field] = parseFloat(value) || 0;
    }
    onLineItemsChange(newItems);
  };

  const removeLineItem = (index) => {
    onLineItemsChange(lineItems.filter((_, i) => i !== index));
  };

  const total = lineItemsEnabled
    ? lineItems.reduce((sum, item) => sum + item.quantity * item.price, 0)
    : 0;

  const totalWithVat = vatEnabled ? total * (1 + globalVat / 100) : total;

  return (
    <div className="mb-4">
      <h5>Line Items</h5>
      <Form.Text className="text-muted d-block mb-3 px-2">
        Add individual line items with descriptions. Toggle items on/off or disable
        the entire block. <strong>Total</strong> is calculated automatically.
      </Form.Text>

      {/* Controls: Include items + VAT */}
      <div className="row mb-3 align-items-center">
        <div className="col-md-4 col-sm-12">
          <Form.Check
            type="checkbox"
            label="Include line items in total"
            checked={lineItemsEnabled}
            onChange={(e) => setLineItemsEnabled(e.target.checked)}
          />
        </div>

        <div className="col-md-4 col-sm-12">
          <Form.Check
            type="checkbox"
            label="Apply VAT to all items"
            checked={vatEnabled}
            onChange={(e) => setVatEnabled(e.target.checked)}
            disabled={!lineItemsEnabled}
          />
        </div>

        {lineItemsEnabled && vatEnabled && (
          <div className="col-md-4 col-sm-12">
            <Form.Select
              value={globalVat}
              onChange={(e) => setGlobalVat(parseFloat(e.target.value))}
            >
              <option value={0}>0%</option>
              <option value={5}>5%</option>
              <option value={7.5}>7.5%</option>
              <option value={10}>10%</option>
              <option value={15}>15%</option>
              <option value={16}>16%</option>
              <option value={20}>20%</option>
            </Form.Select>
          </div>
        )}
      </div>

      {/* Line Items Table */}
      {lineItemsEnabled ? (
      <>
        <div className="row g-2 align-items-end mb-1">
          <div className="col-md-6 px-3"><small className="fw-bold">Item Description</small></div>
          <div className="col-md-2 px-3"><small className="fw-bold">Qty</small></div>
          <div className="col-md-3 px-3"><small className="fw-bold">Unit Price</small></div>
          <div className="col-md-1"><small> </small></div>
        </div>

        {lineItems.map((item, index) => (
          <div key={index} className="row mb-2 align-items-center">
            <div className="col-md-6 mb-2">
              <Form.Control
                placeholder="Describe the service or product"
                value={item.description}
                onChange={(e) => updateLineItem(index, 'description', e.target.value)}
              />
            </div>
            <div className="col-md-2 mb-2">
              <Form.Control
                type="number"
                min="1"
                step="1"
                value={item.quantity}
                onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
              />
            </div>
            <div className="col-md-3 mb-2">
              <Form.Control
                type="number"
                min="0"
                step="0.01"
                value={item.price}
                onChange={(e) => updateLineItem(index, 'price', e.target.value)}
              />
            </div>
            <div className="col-md-1 mb-2">
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => removeLineItem(index)}
              >
                ×
              </Button>
            </div>
          </div>
        ))}

        <Button
          variant="outline-primary"
          onClick={addLineItem}
          className="mb-3"
          style={{ color: '#05445E' }}
        >
          + Add Item
        </Button>

        <div className="mt-3 p-3 bg-light rounded">
          <h6>Total: {totalWithVat.toFixed(2)}</h6>
        </div>
      </>
    ) : (
      <div className="p-3 bg-light rounded text-muted">
        Not using line items or pricing.
      </div>
    )}

    </div>
  );
}
