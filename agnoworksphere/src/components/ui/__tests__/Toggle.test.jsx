import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Toggle from '../Toggle';

describe('Toggle', () => {
  const defaultProps = {
    checked: false,
    onChange: jest.fn(),
    label: 'Test Toggle'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with label', () => {
    render(<Toggle {...defaultProps} />);
    
    expect(screen.getByText('Test Toggle')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('shows checked state correctly', () => {
    render(<Toggle {...defaultProps} checked={true} />);
    
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('shows unchecked state correctly', () => {
    render(<Toggle {...defaultProps} checked={false} />);
    
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange when clicked', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<Toggle {...defaultProps} onChange={onChange} />);
    
    const toggle = screen.getByRole('switch');
    await user.click(toggle);
    
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with opposite value', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<Toggle {...defaultProps} checked={true} onChange={onChange} />);
    
    const toggle = screen.getByRole('switch');
    await user.click(toggle);
    
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('can be disabled', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<Toggle {...defaultProps} disabled={true} onChange={onChange} />);
    
    const toggle = screen.getByRole('switch');
    expect(toggle).toBeDisabled();
    
    await user.click(toggle);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows description when provided', () => {
    render(<Toggle {...defaultProps} description="This is a test toggle" />);
    
    expect(screen.getByText('This is a test toggle')).toBeInTheDocument();
  });

  it('renders different sizes', () => {
    const { rerender } = render(<Toggle {...defaultProps} size="sm" />);
    expect(screen.getByRole('switch')).toHaveClass('h-4', 'w-8');
    
    rerender(<Toggle {...defaultProps} size="lg" />);
    expect(screen.getByRole('switch')).toHaveClass('h-6', 'w-12');
  });

  it('renders without label and description', () => {
    render(<Toggle checked={false} onChange={jest.fn()} />);
    
    expect(screen.getByRole('switch')).toBeInTheDocument();
    expect(screen.queryByText('Test Toggle')).not.toBeInTheDocument();
  });

  it('label is clickable', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<Toggle {...defaultProps} onChange={onChange} />);
    
    const label = screen.getByText('Test Toggle');
    await user.click(label);
    
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('applies custom className', () => {
    const { container } = render(<Toggle {...defaultProps} className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<Toggle {...defaultProps} />);
    
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('type', 'button');
    expect(toggle).toHaveAttribute('role', 'switch');
    expect(toggle).toHaveAttribute('aria-checked');
  });

  it('shows visual state changes', () => {
    const { rerender } = render(<Toggle {...defaultProps} checked={false} />);
    
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveClass('bg-secondary');
    
    rerender(<Toggle {...defaultProps} checked={true} />);
    expect(toggle).toHaveClass('bg-primary');
  });

  it('thumb moves based on checked state', () => {
    const { container, rerender } = render(<Toggle {...defaultProps} checked={false} />);
    
    const thumb = container.querySelector('.translate-x-0');
    expect(thumb).toBeInTheDocument();
    
    rerender(<Toggle {...defaultProps} checked={true} />);
    const movedThumb = container.querySelector('.translate-x-5');
    expect(movedThumb).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef();
    render(<Toggle {...defaultProps} ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('handles keyboard navigation', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<Toggle {...defaultProps} onChange={onChange} />);
    
    const toggle = screen.getByRole('switch');
    toggle.focus();
    
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(true);
    
    await user.keyboard('{Space}');
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
