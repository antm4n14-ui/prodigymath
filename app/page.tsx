'use client';

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [url, setUrl] = useState('https://www.google.com');
  const [showConsole, setShowConsole] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [consoleInput, setConsoleInput] = useState('');
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Keyboard shortcut: Ctrl+Shift+I
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        setShowConsole(prev => !prev);
        if (!showConsole) {
          setTimeout(() => {
            const input = document.getElementById('console-input') as HTMLInputElement;
            if (input) input.focus();
          }, 100);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showConsole]);

  const navigateTo = (e: React.FormEvent) => {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).querySelector('input') as HTMLInputElement;
    let newUrl = input.value;
    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
      newUrl = 'https://' + newUrl;
    }
    setUrl(newUrl);
    setIframeKey(prev => prev + 1);
    setConsoleLogs([]);
  };

  // Execute JS in iframe using srcdoc method
  const executeJS = () => {
    if (!consoleInput.trim()) return;

    const iframe = iframeRef.current;
    if (iframe) {
      try {
        // Try to access iframe content
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) {
          const result = (doc as any).defaultView?.eval(consoleInput);
          setConsoleLogs(prev => [...prev, `> ${consoleInput}`]);
          if (result !== undefined) {
            setConsoleLogs(prev => [...prev, `← ${JSON.stringify(result)}`]);
          }
        } else {
          setConsoleLogs(prev => [...prev, '❌ Cannot access iframe (cross-origin)']);
        }
      } catch (err) {
        setConsoleLogs(prev => [...prev, `❌ ${(err as Error).message}`]);
      }
      setConsoleInput('');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#1a1a1a' }}>
      
      {/* Toolbar */}
      <div style={{
        padding: '8px 12px',
        background: '#2d2d2d',
        borderBottom: '1px solid #444',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexShrink: 0,
        flexWrap: 'wrap'
      }}>
        <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>🌐</span>
        <form onSubmit={navigateTo} style={{ flex: 1, display: 'flex', gap: '8px', minWidth: '200px' }}>
          <input
            type="text"
            defaultValue="https://www.google.com"
            style={{
              flex: 1,
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid #555',
              background: '#3d3d3d',
              color: '#fff',
              outline: 'none',
              fontSize: '14px'
            }}
            placeholder="Enter URL..."
          />
          <button type="submit" style={{
            padding: '6px 18px',
            borderRadius: '20px',
            border: 'none',
            background: '#007bff',
            color: '#fff',
            cursor: 'pointer'
          }}>
            Go
          </button>
        </form>
        <span style={{ color: '#888', fontSize: '11px' }}>
          Ctrl+Shift+I
        </span>
      </div>

      {/* Iframe - Using srcdoc to bypass CORS */}
      <iframe
        ref={iframeRef}
        key={iframeKey}
        srcDoc={`
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { margin: 0; overflow: hidden; }
                iframe { width: 100vw; height: 100vh; border: none; }
              </style>
            </head>
            <body>
              <iframe src="${url}" style="width:100%;height:100%;border:none;"></iframe>
            </body>
          </html>
        `}
        style={{
          flex: 1,
          width: '100%',
          border: 'none',
          background: '#fff'
        }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation"
        title="Browser"
      />

      {/* Console Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(120, 80, 255, 0.4)',
          zIndex: 999,
          color: '#fff',
          fontSize: '24px',
          fontWeight: 'bold',
          fontFamily: 'monospace',
          userSelect: 'none'
        }}
        onClick={() => {
          setShowConsole(!showConsole);
          if (!showConsole) {
            setTimeout(() => {
              const input = document.getElementById('console-input') as HTMLInputElement;
              if (input) input.focus();
            }, 100);
          }
        }}
        title="Toggle Console (Ctrl+Shift+I)"
      >
        ›
      </div>

      {/* Console Panel */}
      {showConsole && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '460px',
            maxWidth: '90vw',
            height: '320px',
            maxHeight: '50vh',
            background: 'rgba(18, 18, 26, 0.97)',
            border: '1px solid #2a2a35',
            borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backdropFilter: 'blur(20px)',
            zIndex: 1000,
            fontFamily: 'monospace'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '6px 12px',
              background: 'rgba(255,255,255,0.03)',
              borderBottom: '1px solid #1e1e28',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
              cursor: 'grab'
            }}
          >
            <span style={{ color: '#888', fontSize: '12px' }}>🔓 F12 Console</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setConsoleLogs([])}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#555',
                  cursor: 'pointer',
                  fontSize: '11px',
                  padding: '2px 6px'
                }}
              >
                Clear
              </button>
              <button
                onClick={() => setShowConsole(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#f87171',
                  cursor: 'pointer',
                  fontSize: '13px',
                  padding: '2px 6px'
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Output */}
          <div
            style={{
              flex: 1,
              padding: '8px 12px',
              overflowY: 'auto',
              fontSize: '12px',
              lineHeight: '1.6',
              color: '#d4d4d4',
              background: 'rgba(0,0,0,0.2)'
            }}
          >
            {consoleLogs.length === 0 && (
              <div style={{ color: '#555', fontStyle: 'italic' }}>Execute JavaScript on the page...</div>
            )}
            {consoleLogs.map((log, i) => (
              <div key={i} style={{
                color: log.startsWith('❌') ? '#f87171' :
                       log.startsWith('←') ? '#34d399' :
                       log.startsWith('>') ? '#fbbf24' :
                       '#60a5fa',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}>
                {log}
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{
            display: 'flex',
            borderTop: '1px solid #1e1e28',
            flexShrink: 0,
            padding: '6px 8px',
            gap: '6px',
            background: 'rgba(0,0,0,0.2)'
          }}>
            <input
              id="console-input"
              type="text"
              value={consoleInput}
              onChange={(e) => setConsoleInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && executeJS()}
              placeholder="Enter JavaScript..."
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid #2a2a35',
                borderRadius: '6px',
                color: '#fff',
                padding: '6px 12px',
                fontSize: '13px',
                outline: 'none',
                fontFamily: 'monospace'
              }}
              autoFocus
            />
            <button
              onClick={executeJS}
              style={{
                background: '#7c3aed',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                padding: '6px 14px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Run
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
