import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../config/supabase';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiBold, FiItalic, FiUnderline, FiLink, FiImage, FiCode, FiUpload } = FiIcons;

const RichTextEditor = ({ value, onChange, placeholder = 'Start writing...' }) => {
  const editorRef = useRef(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savedSelection, setSavedSelection] = useState(null);

  // Initialize editor content only once when component mounts
  useEffect(() => {
    if (editorRef.current && value !== undefined) {
      // Only set innerHTML if content is different to avoid cursor issues
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, []); // Empty dependency array - only run on mount

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      return selection.getRangeAt(0);
    }
    return null;
  };

  const restoreSelection = (range) => {
    if (range) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const handleCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current && onChange) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const handleInput = (e) => {
    // Handle input event directly without manipulating the content
    updateContent();
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          handleCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          handleCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          handleCommand('underline');
          break;
        case 'k':
          e.preventDefault();
          openLinkModal();
          break;
        default:
          break;
      }
    }
  };

  const openLinkModal = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText) {
      setSelectedText(selectedText);
      setLinkText(selectedText);
      setSavedSelection(saveSelection());
    } else {
      setSelectedText('');
      setLinkText('');
      setSavedSelection(null);
    }
    
    setLinkUrl('');
    setIsLinkModalOpen(true);
  };

  const insertLink = () => {
    if (!linkUrl.trim()) {
      alert('Please enter a URL');
      return;
    }

    let finalLinkText = linkText.trim();
    if (!finalLinkText) {
      finalLinkText = linkUrl;
    }

    if (savedSelection) {
      // Replace selected text with link
      restoreSelection(savedSelection);
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${finalLinkText}</a>`;
      document.execCommand('insertHTML', false, linkHtml);
    } else {
      // Insert new link at cursor position
      editorRef.current.focus();
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${finalLinkText}</a>`;
      document.execCommand('insertHTML', false, linkHtml);
    }

    updateContent();
    setLinkUrl('');
    setLinkText('');
    setSelectedText('');
    setSavedSelection(null);
    setIsLinkModalOpen(false);
  };

  const insertImageFromUrl = () => {
    if (imageUrl) {
      handleCommand('insertImage', imageUrl);
      setImageUrl('');
      setIsImageModalOpen(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const fileName = `blog/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('owner_photos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('owner_photos')
        .getPublicUrl(fileName);

      handleCommand('insertImage', publicUrl);
      setIsImageModalOpen(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  const formatBlock = (tag) => {
    handleCommand('formatBlock', tag);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex items-center space-x-1 flex-wrap">
        {/* Headings */}
        <select
          onChange={(e) => formatBlock(e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
          defaultValue=""
        >
          <option value="">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
        </select>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => handleCommand('bold')}
          className="p-1 hover:bg-gray-200 rounded"
          title="Bold (Ctrl+B)"
        >
          <SafeIcon icon={FiBold} className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleCommand('italic')}
          className="p-1 hover:bg-gray-200 rounded"
          title="Italic (Ctrl+I)"
        >
          <SafeIcon icon={FiItalic} className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleCommand('underline')}
          className="p-1 hover:bg-gray-200 rounded"
          title="Underline (Ctrl+U)"
        >
          <SafeIcon icon={FiUnderline} className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Links and Media */}
        <button
          type="button"
          onClick={openLinkModal}
          className="p-1 hover:bg-gray-200 rounded"
          title="Insert Link (Ctrl+K)"
        >
          <SafeIcon icon={FiLink} className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setIsImageModalOpen(true)}
          className="p-1 hover:bg-gray-200 rounded"
          title="Insert Image"
        >
          <SafeIcon icon={FiImage} className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Lists */}
        <button
          type="button"
          onClick={() => handleCommand('insertUnorderedList')}
          className="p-1 hover:bg-gray-200 rounded text-sm"
          title="Bullet List"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => handleCommand('insertOrderedList')}
          className="p-1 hover:bg-gray-200 rounded text-sm"
          title="Numbered List"
        >
          1.
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Code */}
        <button
          type="button"
          onClick={() => handleCommand('formatBlock', 'pre')}
          className="p-1 hover:bg-gray-200 rounded"
          title="Code Block"
        >
          <SafeIcon icon={FiCode} className="h-4 w-4" />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className="p-4 min-h-[300px] focus:outline-none"
        style={{
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          direction: 'ltr', // Ensure left-to-right text direction
          textAlign: 'left', // Ensure left text alignment
          unicodeBidi: 'normal' // Ensure normal text flow
        }}
        placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">
              {selectedText ? 'Edit Link' : 'Insert Link'}
            </h3>
            
            {selectedText && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Text
                </label>
                <div className="bg-gray-50 p-2 rounded border text-sm text-gray-700">
                  "{selectedText}"
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link Text
              </label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder={selectedText || "Enter link text"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                autoFocus
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsLinkModalOpen(false);
                  setLinkUrl('');
                  setLinkText('');
                  setSelectedText('');
                  setSavedSelection(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={insertLink}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {selectedText ? 'Update Link' : 'Insert Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Image</h3>
            
            {/* Upload Image */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload-editor"
                  disabled={uploadingImage}
                />
                <label
                  htmlFor="image-upload-editor"
                  className="cursor-pointer inline-flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiUpload} className="h-4 w-4" />
                  <span>{uploadingImage ? 'Uploading...' : 'Choose File'}</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
              </div>
            </div>

            <div className="text-center text-gray-500 text-sm mb-4">
              — or —
            </div>

            {/* Image URL */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsImageModalOpen(false);
                  setImageUrl('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={insertImageFromUrl}
                disabled={!imageUrl}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;