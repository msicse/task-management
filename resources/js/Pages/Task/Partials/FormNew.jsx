import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ImageResize } from 'quill-image-resize-module-react';
import * as Quill from 'quill';

Quill.register('modules/imageResize', ImageResize);

const RichTextForm = () => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const quillRef = useRef(null);

  // Handle Excel paste
  const handlePaste = (e) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const html = clipboardData.getData('text/html');
    if (html && html.includes('<table')) {
      e.preventDefault();
      const range = quillRef.current.getEditor().getSelection();
      quillRef.current.getEditor().clipboard.dangerouslyPasteHTML(range.index, html);
    }
  };

  // Handle image upload
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      // In a real app, you would upload the image to a server here
      // For demo, we'll use a FileReader to get a data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();
        quill.insertEmbed(range.index, 'image', imageUrl, 'user');
      };
      reader.readAsDataURL(file);
    };
  };

  // Quill modules configuration
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
    imageResize: {
      parchment: Quill.import('parchment'),
      modules: ['Resize', 'DisplaySize']
    },
    clipboard: {
      matchVisual: false
    }
  };

  // Quill formats
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log({ title, content });
  };

  return (
    <div className="rich-text-form-container">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-control"
            placeholder="Enter title"
            required
          />
        </div>

        <div className="form-group">
          <label>Content</label>
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            onPaste={handlePaste}
            placeholder="Write something amazing..."
            className="rich-text-editor"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default RichTextForm;
