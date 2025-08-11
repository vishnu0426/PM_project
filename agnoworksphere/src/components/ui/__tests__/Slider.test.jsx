import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Slider from '../Slider';

describe('Slider', () => {
  const defaultProps = {
    min: 0,
    max: 100,
    step: 1,
    value: 50,
    onChange: jest.fn(),
    label: 'Test Slider'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with label', () => {
    render(<Slider {...defaultProps} />);
    
    expect(screen.getByText('Test Slider')).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('displays current value', () => {
    render(<Slider {...defaultProps} showValue={true} />);
    
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('formats value with custom formatter', () => {
    const formatValue = (value) => `$${value}`;
    render(<Slider {...defaultProps} formatValue={formatValue} />);
    
    expect(screen.getByText('$50')).toBeInTheDocument();
  });

  it('calls onChange when value changes', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<Slider {...defaultProps} onChange={onChange} />);
    
    const slider = screen.getByRole('slider');
    await user.clear(slider);
    await user.type(slider, '75');
    
    expect(onChange).toHaveBeenCalledWith(75);
  });

  it('respects min and max values', () => {
    render(<Slider {...defaultProps} min={10} max={90} />);
    
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('min', '10');
    expect(slider).toHaveAttribute('max', '90');
  });

  it('uses correct step value', () => {
    render(<Slider {...defaultProps} step={5} />);
    
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('step', '5');
  });

  it('shows description when provided', () => {
    render(<Slider {...defaultProps} description="This is a test slider" />);
    
    expect(screen.getByText('This is a test slider')).toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(<Slider {...defaultProps} disabled={true} />);
    
    const slider = screen.getByRole('slider');
    expect(slider).toBeDisabled();
  });

  it('hides value when showValue is false', () => {
    render(<Slider {...defaultProps} showValue={false} />);
    
    expect(screen.queryByText('50')).not.toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<Slider {...defaultProps} label={null} />);
    
    expect(screen.queryByText('Test Slider')).not.toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Slider {...defaultProps} className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<Slider {...defaultProps} />);
    
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '100');
    expect(slider).toHaveAttribute('aria-valuenow', '50');
  });

  it('updates progress track width based on value', () => {
    const { container } = render(<Slider {...defaultProps} value={25} />);
    
    const progressTrack = container.querySelector('.bg-primary');
    expect(progressTrack).toHaveStyle('width: 25%');
  });

  it('handles edge case values', () => {
    const { rerender } = render(<Slider {...defaultProps} value={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
    
    rerender(<Slider {...defaultProps} value={100} />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('handles decimal values', () => {
    render(<Slider {...defaultProps} value={25.5} step={0.5} />);
    
    expect(screen.getByText('25.5')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef();
    render(<Slider {...defaultProps} ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
