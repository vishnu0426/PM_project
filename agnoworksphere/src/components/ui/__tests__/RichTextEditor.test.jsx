import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import RichTextEditor from '../RichTextEditor';

// Mock document.execCommand
document.execCommand = jest.fn();

describe('RichTextEditor', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
    placeholder: 'Start typing...'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    document.execCommand.mockClear();
  });

  it('renders with placeholder', () => {
    render(<RichTextEditor {...defaultProps} />);
    
    expect(screen.getByText('Start typing...')).toBeInTheDocument();
  });

  it('displays label when provided', () => {
    render(<RichTextEditor {...defaultProps} label="Rich Text Editor" />);
    
    expect(screen.getByText('Rich Text Editor')).toBeInTheDocument();
  });

  it('shows toolbar when enabled', () => {
    render(<RichTextEditor {...defaultProps} showToolbar={true} />);
    
    // Check for toolbar buttons
    expect(screen.getByTitle('Bold')).toBeInTheDocument();
    expect(screen.getByTitle('Italic')).toBeInTheDocument();
    expect(screen.getByTitle('Underline')).toBeInTheDocument();
  });

  it('hides toolbar when disabled', () => {
    render(<RichTextEditor {...defaultProps} showToolbar={false} />);
    
    expect(screen.queryByTitle('Bold')).not.toBeInTheDocument();
  });

  it('shows word count when enabled', () => {
    render(<RichTextEditor {...defaultProps} value="Hello world" showWordCount={true} />);
    
    expect(screen.getByText('2 words')).toBeInTheDocument();
    expect(screen.getByText('1 lines')).toBeInTheDocument();
  });

  it('displays character count with max length', () => {
    render(<RichTextEditor {...defaultProps} value="Hello" maxLength={100} />);
    
    expect(screen.getByText('5/100')).toBeInTheDocument();
  });

  it('calls onChange when content changes', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<RichTextEditor {...defaultProps} onChange={onChange} />);
    
    const editor = screen.getByRole('textbox');
    await user.type(editor, 'Hello world');
    
    expect(onChange).toHaveBeenCalled();
  });

  it('executes formatting commands', async () => {
    const user = userEvent.setup();
    render(<RichTextEditor {...defaultProps} showToolbar={true} />);
    
    const boldButton = screen.getByTitle('Bold');
    await user.click(boldButton);
    
    expect(document.execCommand).toHaveBeenCalledWith('bold', false, null);
  });

  it('handles text alignment commands', async () => {
    const user = userEvent.setup();
    render(<RichTextEditor {...defaultProps} showToolbar={true} />);
    
    const alignCenterButton = screen.getByTitle('Align Center');
    await user.click(alignCenterButton);
    
    expect(document.execCommand).toHaveBeenCalledWith('justifyCenter', false, null);
  });

  it('handles list commands', async () => {
    const user = userEvent.setup();
    render(<RichTextEditor {...defaultProps} showToolbar={true} />);
    
    const bulletListButton = screen.getByTitle('Bullet List');
    await user.click(bulletListButton);
    
    expect(document.execCommand).toHaveBeenCalledWith('insertUnorderedList', false, null);
  });

  it('toggles fullscreen mode', async () => {
    const user = userEvent.setup();
    render(<RichTextEditor {...defaultProps} showToolbar={true} />);
    
    const fullscreenButton = screen.getByTitle('Fullscreen');
    await user.click(fullscreenButton);
    
    // Check if fullscreen class is applied
    const container = screen.getByRole('textbox').closest('.fixed');
    expect(container).toBeInTheDocument();
  });

  it('handles media upload when allowed', async () => {
    const user = userEvent.setup();
    render(<RichTextEditor {...defaultProps} showToolbar={true} allowMedia={true} />);
    
    const mediaButton = screen.getByTitle('Insert Media');
    expect(mediaButton).toBeInTheDocument();
    
    // Check for hidden file input
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('accept', 'image/*,video/*');
  });

  it('hides media button when not allowed', () => {
    render(<RichTextEditor {...defaultProps} showToolbar={true} allowMedia={false} />);
    
    expect(screen.queryByTitle('Insert Media')).not.toBeInTheDocument();
  });

  it('inserts links when requested', async () => {
    const user = userEvent.setup();
    // Mock prompt
    global.prompt = jest.fn(() => 'https://example.com');
    
    render(<RichTextEditor {...defaultProps} showToolbar={true} />);
    
    const linkButton = screen.getByTitle('Insert Link');
    await user.click(linkButton);
    
    expect(global.prompt).toHaveBeenCalledWith('Enter URL:');
    expect(document.execCommand).toHaveBeenCalledWith(
      'insertHTML',
      false,
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">https://example.com</a>'
    );
    
    global.prompt.mockRestore();
  });

  it('respects max length limit', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<RichTextEditor {...defaultProps} maxLength={5} onChange={onChange} />);
    
    const editor = screen.getByRole('textbox');
    await user.type(editor, 'Hello world'); // More than 5 characters
    
    // Should not call onChange for characters beyond limit
    expect(onChange).not.toHaveBeenCalledWith('Hello world');
  });

  it('shows description when provided', () => {
    render(<RichTextEditor {...defaultProps} description="This is a rich text editor" />);
    
    expect(screen.getByText('This is a rich text editor')).toBeInTheDocument();
  });

  it('shows error message when provided', () => {
    render(<RichTextEditor {...defaultProps} error="This field is required" />);
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(<RichTextEditor {...defaultProps} disabled={true} />);
    
    const editor = screen.getByRole('textbox');
    expect(editor).toHaveAttribute('contenteditable', 'false');
  });

  it('updates word and line counts correctly', () => {
    const { rerender } = render(
      <RichTextEditor {...defaultProps} value="Hello world" showWordCount={true} />
    );
    
    expect(screen.getByText('2 words')).toBeInTheDocument();
    expect(screen.getByText('1 lines')).toBeInTheDocument();
    
    rerender(
      <RichTextEditor {...defaultProps} value="Hello\nworld\ntest" showWordCount={true} />
    );
    
    expect(screen.getByText('3 words')).toBeInTheDocument();
    expect(screen.getByText('3 lines')).toBeInTheDocument();
  });

  it('handles empty content correctly', () => {
    render(<RichTextEditor {...defaultProps} value="" showWordCount={true} />);
    
    expect(screen.getByText('0 words')).toBeInTheDocument();
    expect(screen.getByText('1 lines')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<RichTextEditor {...defaultProps} className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef();
    render(<RichTextEditor {...defaultProps} ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('handles file upload for images', async () => {
    const user = userEvent.setup();
    render(<RichTextEditor {...defaultProps} showToolbar={true} allowMedia={true} />);
    
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
    
    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/jpeg;base64,test'
    };
    global.FileReader = jest.fn(() => mockFileReader);
    
    await user.upload(fileInput, file);
    
    expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(file);
  });

  it('shows warning when approaching character limit', () => {
    render(<RichTextEditor {...defaultProps} value="Hello" maxLength={10} />);
    
    // Should show warning color when > 90% of limit
    const charCount = screen.getByText('5/10');
    expect(charCount).not.toHaveClass('text-warning');
    
    const { rerender } = render(<RichTextEditor {...defaultProps} value="Hello wor" maxLength={10} />);
    
    const warningCharCount = screen.getByText('9/10');
    expect(warningCharCount).toHaveClass('text-warning');
  });
});
