import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
} from 'react';
import { cn } from '../../utils/cn';
import Button from './Button';
import Icon from '../AppIcon';

const RichTextEditor = React.forwardRef(
  (
    {
      className,
      value = '',
      onChange,
      placeholder = 'Start typing...',
      maxLength = 10000,
      label,
      description,
      error,
      disabled = false,
      showToolbar = true,
      showWordCount = true,
      allowMedia = true,
      ...props
    },
    ref
  ) => {
    const [content, setContent] = useState(value);
    const [wordCount, setWordCount] = useState(0);
    const [lineCount, setLineCount] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const [isFocused, setIsFocused] = useState(false);

    // Forward the DOM node to parent ref if provided
    const setEditorRef = (node) => {
      editorRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    const [selectedText, setSelectedText] = useState('');
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);

    useLayoutEffect(() => {
      setContent(value);
      const plain = value.replace(/<[^>]+>/g, '');
      updateCounts(plain);
    }, [value]);

    const updateCounts = (text) => {
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const lines = text.split('\n').length;
      setWordCount(words);
      setLineCount(lines);
    };

    const handleContentChange = (e) => {
      // Support contentEditable by reading innerText/innerHTML
      const target = e.currentTarget;
      const text = target.innerText ?? '';
      const html = target.innerHTML ?? '';
      const next = html; // we store HTML to preserve formatting
      if (text.length <= maxLength) {
        setContent(next);
        updateCounts(text);
        onChange?.(next);
      } else {
        // Trim back to max by removing last input (basic guard)
        target.innerText = text.slice(0, maxLength);
        const trimmed = target.innerHTML;
        setContent(trimmed);
        updateCounts(target.innerText);
        onChange?.(trimmed);
      }
    };

    const handleFormat = (command, value = null) => {
      if (editorRef.current) {
        editorRef.current.focus();
        document.execCommand(command, false, value);
        const newContent = editorRef.current.innerHTML;
        onChange?.(newContent);
      }
    };

    const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const fileUrl = event.target.result;
          if (file.type.startsWith('image/')) {
            insertMedia('image', fileUrl, file.name);
          } else if (file.type.startsWith('video/')) {
            insertMedia('video', fileUrl, file.name);
          }
        };
        reader.readAsDataURL(file);
      }
    };

    const insertMedia = (type, url, name) => {
      const mediaHtml =
        type === 'image'
          ? `<img src="${url}" alt="${name}" style="max-width: 100%; height: auto; margin: 10px 0;" />`
          : `<video src="${url}" controls style="max-width: 100%; height: auto; margin: 10px 0;"></video>`;

      handleFormat('insertHTML', mediaHtml);
    };

    const insertLink = () => {
      const url = prompt('Enter URL:');
      if (url) {
        const text = selectedText || url;
        const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        handleFormat('insertHTML', linkHtml);
      }
    };

    const toolbarButtons = [
      { command: 'bold', icon: 'Bold', title: 'Bold' },
      { command: 'italic', icon: 'Italic', title: 'Italic' },
      { command: 'underline', icon: 'Underline', title: 'Underline' },
      {
        command: 'strikeThrough',
        icon: 'Strikethrough',
        title: 'Strikethrough',
      },
      { type: 'separator' },
      { command: 'insertUnorderedList', icon: 'List', title: 'Bullet List' },
      {
        command: 'insertOrderedList',
        icon: 'ListOrdered',
        title: 'Numbered List',
      },
      { type: 'separator' },
      { command: 'justifyLeft', icon: 'AlignLeft', title: 'Align Left' },
      { command: 'justifyCenter', icon: 'AlignCenter', title: 'Align Center' },
      { command: 'justifyRight', icon: 'AlignRight', title: 'Align Right' },
      { type: 'separator' },
      { action: 'link', icon: 'Link', title: 'Insert Link' },
      { action: 'media', icon: 'Image', title: 'Insert Media' },
      { type: 'separator' },
      { action: 'fullscreen', icon: 'Maximize', title: 'Fullscreen' },
    ];

    // Derive word/line counts from prop `value` when provided to reflect rerenders immediately
    // Normalize newlines from either plain text or HTML, robust against literal \n
    const normalizeToPlainText = (input) => {
      if (input == null) return null;
      const str = String(input);
      // If the string contains HTML tags or <br>, normalize those; also convert escaped \n to real newlines
      const withNewlines = str
        .replace(/<br\s*\/?>(?=)|<br\s*\/?/gi, '\n')
        .replace(/\\n/g, '\n')
        .replace(/<[^>]+>/g, '');
      return withNewlines;
    };

    const plainFromValue = normalizeToPlainText(value);
    const displayWordCount =
      plainFromValue != null
        ? plainFromValue.trim()
          ? plainFromValue.trim().split(/\s+/).length
          : 0
        : wordCount;
    const displayLineCount =
      plainFromValue != null
        ? plainFromValue.length
          ? plainFromValue.split('\n').length
          : 1
        : lineCount;

    return (
      <div
        className={cn(
          'space-y-2',
          isFullscreen && 'fixed inset-0 z-50 bg-background p-4',
          className
        )}
      >
        {label && (
          <label className='text-sm font-medium text-foreground'>{label}</label>
        )}

        <div
          className={cn(
            'border border-border rounded-lg overflow-hidden',
            error && 'border-destructive',
            disabled && 'opacity-50 pointer-events-none'
          )}
        >
          {showToolbar && (
            <div className='flex items-center gap-1 p-2 border-b border-border bg-secondary/30'>
              {toolbarButtons.map((button, index) => {
                if (button.type === 'separator') {
                  return (
                    <div key={index} className='w-px h-6 bg-border mx-1' />
                  );
                }

                if (button.action === 'link') {
                  return (
                    <Button
                      key={button.action}
                      variant='ghost'
                      size='sm'
                      onClick={insertLink}
                      title={button.title}
                    >
                      <Icon name={button.icon} className='h-4 w-4' />
                    </Button>
                  );
                }

                if (button.action === 'media') {
                  if (!allowMedia) return null;
                  return (
                    <Button
                      key={button.action}
                      variant='ghost'
                      size='sm'
                      onClick={() => fileInputRef.current?.click()}
                      title={button.title}
                    >
                      <Icon name={button.icon} className='h-4 w-4' />
                    </Button>
                  );
                }

                if (button.action === 'fullscreen') {
                  return (
                    <Button
                      key={button.action}
                      variant='ghost'
                      size='sm'
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      title={button.title}
                    >
                      <Icon
                        name={isFullscreen ? 'Minimize' : 'Maximize'}
                        className='h-4 w-4'
                      />
                    </Button>
                  );
                }

                return (
                  <Button
                    key={button.command}
                    variant='ghost'
                    size='sm'
                    onClick={() => handleFormat(button.command)}
                    title={button.title}
                  >
                    <Icon name={button.icon} className='h-4 w-4' />
                  </Button>
                );
              })}
            </div>
          )}

          <div className={cn('relative')}>
            {(!content || content === '<br>') && !isFocused && (
              <div className='absolute pointer-events-none opacity-50 p-4'>
                {placeholder}
              </div>
            )}
            <div
              ref={setEditorRef}
              role='textbox'
              aria-multiline='true'
              contentEditable={!disabled}
              className={cn(
                'min-h-[200px] p-4 focus:outline-none',
                isFullscreen && 'min-h-[calc(100vh-200px)]'
              )}
              style={{
                maxHeight: isFullscreen ? 'calc(100vh - 200px)' : '400px',
                overflowY: 'auto',
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onInput={handleContentChange}
              onMouseUp={() => {
                const selection = window.getSelection();
                setSelectedText(selection.toString());
              }}
              dangerouslySetInnerHTML={{ __html: content }}
              {...props}
            />
          </div>

          {(showWordCount || maxLength) && (
            <div className='flex justify-between items-center p-2 border-t border-border bg-secondary/30 text-xs text-muted-foreground'>
              <div className='flex gap-4'>
                {showWordCount && (
                  <>
                    <span>{displayWordCount} words</span>
                    <span>{displayLineCount} lines</span>
                  </>
                )}
              </div>
              {maxLength && (
                <span
                  className={
                    content.length >= Math.ceil(maxLength * 0.9)
                      ? 'text-warning'
                      : ''
                  }
                >
                  {content.length}/{maxLength}
                </span>
              )}
            </div>
          )}
        </div>

        {allowMedia && (
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*,video/*'
            onChange={handleFileUpload}
            className='hidden'
          />
        )}

        {description && !error && (
          <p className='text-xs text-muted-foreground'>{description}</p>
        )}

        {error && <p className='text-xs text-destructive'>{error}</p>}
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
