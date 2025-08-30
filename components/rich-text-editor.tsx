"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Commencez à écrire...",
  className = "",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  // Check which formats are currently active at cursor position
  const updateActiveFormats = useCallback(() => {
    try {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
      });
    } catch (error) {
      // Fallback if queryCommandState is not supported
      console.warn("queryCommandState not supported", error);
    }
  }, []);

  const handleCommand = useCallback(
    (command: string) => {
      document.execCommand(command, false);
      editorRef.current?.focus();
      // Update active formats after command
      setTimeout(updateActiveFormats, 0);
    },
    [updateActiveFormats]
  );

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
    // Update active formats when content changes
    updateActiveFormats();
  }, [onChange, updateActiveFormats]);

  // Update active formats when selection changes
  const handleSelectionChange = useCallback(() => {
    updateActiveFormats();
  }, [updateActiveFormats]);

  // Initialize content only once when component mounts
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      if (value) {
        editorRef.current.innerHTML = value;
      }
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  // Add event listener for selection changes
  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [handleSelectionChange]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    updateActiveFormats();
  }, [updateActiveFormats]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Handle keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "b":
            e.preventDefault();
            handleCommand("bold");
            break;
          case "i":
            e.preventDefault();
            handleCommand("italic");
            break;
          case "u":
            e.preventDefault();
            handleCommand("underline");
            break;
        }
      }
    },
    [handleCommand]
  );

  return (
    <div
      className={`border rounded-md ${
        isFocused ? "ring-2 ring-blue-500 border-blue-500" : "border-gray-300"
      } ${className}`}
    >
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 flex gap-1">
        <Button
          type="button"
          variant={activeFormats.bold ? "default" : "ghost"}
          size="sm"
          className={`h-8 w-8 p-0 ${
            activeFormats.bold
              ? "bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300"
              : ""
          }`}
          onClick={() => handleCommand("bold")}
          title="Gras (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant={activeFormats.italic ? "default" : "ghost"}
          size="sm"
          className={`h-8 w-8 p-0 ${
            activeFormats.italic
              ? "bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300"
              : ""
          }`}
          onClick={() => handleCommand("italic")}
          title="Italique (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant={activeFormats.underline ? "default" : "ghost"}
          size="sm"
          className={`h-8 w-8 p-0 ${
            activeFormats.underline
              ? "bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300"
              : ""
          }`}
          onClick={() => handleCommand("underline")}
          title="Souligné (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="p-3 min-h-[120px] focus:outline-none text-sm"
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />

      {/* Placeholder */}
      {(!value || value === "") && !isFocused && (
        <div
          className="absolute pointer-events-none text-gray-400 text-sm"
          style={{
            top: "52px", // Account for toolbar height
            left: "12px",
          }}
        >
          {placeholder}
        </div>
      )}

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
