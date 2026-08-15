import React, { useState, useRef, useEffect } from 'react';
import { Search, Compass, Library, Plus, ArrowUp, Loader2, Globe, FileText, GraduationCap, MessageSquare, PlaySquare, PenTool, Image as ImageIcon, Video, Lightbulb, ChevronDown, Trash2, Moon, Sun } from 'lucide-react';
import Markdown from 'react-markdown';

type SearchMode = 'web' | 'academic' | 'reddit' | 'youtube' | 'writing' | 'image' | 'video' | 'suggestion';

const modes: { id: SearchMode, label: string, icon: any }[] = [
  { id: 'web', label: 'Web', icon: Globe },
  { id: 'academic', label: 'Academic', icon: GraduationCap },
  { id: 'reddit', label: 'Reddit', icon: MessageSquare },
  { id: 'youtube', label: 'YouTube', icon: PlaySquare },
  { id: 'writing', label: 'Writing', icon: PenTool },
  { id: 'image', label: 'Image', icon: ImageIcon },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'suggestion', label: 'Suggestion', icon: Lightbulb }
];

const ModeSelector = ({ mode, setMode, position = 'down' }: { mode: SearchMode, setMode: (mode: SearchMode) => void, position?: 'up' | 'down' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeMode = modes.find(m => m.id === mode) || modes[0];
  const ActiveIcon = activeMode.icon;

  return (
    <div className="border-t border-[#e0e0da] dark:border-[#333333] bg-[#f8f8f5] dark:bg-[#1a1a1a] rounded-b-3xl p-2 px-4 relative flex items-center" ref={dropdownRef}>
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider pr-3 border-r border-[#e0e0da] dark:border-[#333333] mr-3">Focus</span>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-white dark:bg-[#1e1e1e] text-gray-800 dark:text-gray-200 shadow-sm border border-[#e0e0da] dark:border-[#333333] transition-colors hover:bg-gray-50 dark:bg-gray-800"
      >
        <ActiveIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        {activeMode.label}
        <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute ${position === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'} left-16 w-48 bg-white dark:bg-[#1e1e1e] rounded-xl shadow-lg border border-[#e0e0da] dark:border-[#333333] overflow-hidden z-50`}>
          <div className="flex flex-col py-1 max-h-64 overflow-y-auto no-scrollbar">
            {modes.map((m) => {
              const Icon = m.icon;
              const isActive = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMode(m.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-left ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-700 hover:bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`} />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  console.log("App component rendered");
  const [query, setQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [mode, setMode] = useState<SearchMode>('web');
  const [messages, setMessages] = useState<{query: string, result: string, sources: {title: string, uri: string}[], isSearching?: boolean, error?: string}[]>([]);
  const [recentChats, setRecentChats] = useState<{id: string, title: string, messages: any[]}[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const currentQuery = query.trim();
    setQuery('');
    
    let currentThreadId = activeThreadId;
    if (!activeSearch) {
      setActiveSearch(currentQuery);
      currentThreadId = Date.now().toString();
      setActiveThreadId(currentThreadId);
    }
    
    setMessages(prev => [...prev, { query: currentQuery, result: '', sources: [], isSearching: true, error: '' }]);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: currentQuery, mode })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response body');

      let buffer = '';
      let finalResult = '';
      let finalSources: any[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr.trim() === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.type === 'sources') {
                finalSources = parsed.data;
                setMessages(prev => {
                  const newArr = [...prev];
                  newArr[newArr.length - 1].sources = finalSources;
                  return newArr;
                });
              } else if (parsed.type === 'text') {
                finalResult += parsed.data;
                setMessages(prev => {
                  const newArr = [...prev];
                  newArr[newArr.length - 1].result = finalResult;
                  return newArr;
                });
              }
            } catch (e) {
              console.error('Error parsing stream data', e);
            }
          }
        }
      }
      
      setMessages(prev => {
        const newArr = [...prev];
        newArr[newArr.length - 1].isSearching = false;
        
        // Update recent chats
        setRecentChats(recent => {
          const existingIndex = recent.findIndex(r => r.id === currentThreadId);
          if (existingIndex >= 0) {
            const newRecent = [...recent];
            newRecent[existingIndex] = { ...newRecent[existingIndex], messages: newArr };
            return newRecent;
          } else {
            return [{ id: currentThreadId!, title: activeSearch || currentQuery, messages: newArr }, ...recent];
          }
        });
        
        return newArr;
      });
    } catch (err: any) {
      setMessages(prev => {
        const newArr = [...prev];
        newArr[newArr.length - 1].error = err.message;
        newArr[newArr.length - 1].isSearching = false;
        return newArr;
      });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-screen bg-[#f3f3ee] dark:bg-[#121212] text-[#1e1e1e] dark:text-[#f3f3ee] font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#e0e0da] dark:border-[#333333] bg-[#f8f8f5] dark:bg-[#1a1a1a] flex flex-col p-4 hidden md:flex">
        <div className="flex items-center gap-2 font-semibold text-xl tracking-tight mb-8">
          <Globe className="w-6 h-6" />
          <span>Perplexity AI</span>
        </div>
        
        <button 
          onClick={() => { setActiveSearch(''); setMessages([]); setActiveThreadId(null); setQuery(''); }}
          className="flex items-center gap-3 w-full p-2.5 rounded-full bg-white dark:bg-[#1e1e1e] border border-[#e0e0da] dark:border-[#333333] shadow-sm hover:shadow text-sm font-medium transition-all mb-6"
        >
          <div className="bg-[#1e1e1e] dark:bg-[#f3f3ee] text-white dark:text-[#1e1e1e] p-1 rounded-full">
            <Plus className="w-4 h-4" />
          </div>
          New
        </button>

        <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar pb-4">
          {recentChats.length > 0 && (
            <div className="pt-6">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">Recent</h3>
              <div className="space-y-1">
                {recentChats.map((chat) => (
                  <div key={chat.id} className="group flex items-center justify-between w-full p-2 rounded-lg text-sm font-medium hover:bg-[#ebebe5] dark:hover:bg-[#2a2a2a] dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors">
                    <button 
                      onClick={() => {
                        setActiveSearch(chat.title);
                        setMessages(chat.messages);
                        setActiveThreadId(chat.id);
                        setQuery('');
                      }}
                      className="flex items-center gap-3 flex-1 text-left truncate"
                    >
                      <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <span className="truncate">{chat.title}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRecentChats(prev => prev.filter(c => c.id !== chat.id));
                        if (activeThreadId === chat.id) {
                          setMessages([]);
                          setActiveSearch('');
                          setActiveThreadId(null);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-all flex-shrink-0"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>
        <div className="mt-auto p-4 border-t border-[#e0e0da] dark:border-[#333333]">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center gap-3 w-full p-2 rounded-lg text-sm font-medium hover:bg-[#ebebe5] dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {isDarkMode ? 'Light Mode' : 'Night Mode'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-white dark:bg-[#1e1e1e]">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-[#e0e0da] dark:border-[#333333] bg-white dark:bg-[#1e1e1e]">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Globe className="w-5 h-5" />
            <span>Perplexity AI</span>
          </div>
          <button onClick={() => { setActiveSearch(''); setMessages([]); setActiveThreadId(null); setQuery(''); }}>
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto w-full relative scroll-smooth pb-32">
          {!activeSearch ? (
            <div className="h-full flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full pt-10">
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-10 text-center text-[#1e1e1e] dark:text-[#f3f3ee]">
                Where knowledge begins
              </h1>
              
              <div className="w-full relative shadow-sm hover:shadow-md transition-shadow rounded-3xl bg-white dark:bg-[#1e1e1e] border border-[#e0e0da] dark:border-[#333333] focus-within:border-gray-400 dark:focus-within:border-gray-600 focus-within:ring-2 focus-within:ring-gray-100 dark:focus-within:ring-gray-800 flex flex-col">
                <form onSubmit={handleSearch} className="w-full relative">
                  <div className="relative flex items-center w-full overflow-hidden rounded-t-3xl">
                    <div className="pl-5 pr-2">
                      <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ask anything..."
                      className="w-full py-4 pr-14 outline-none text-lg bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-400"
                      autoFocus
                    />
                    <button 
                      type="submit" 
                      disabled={!query.trim()}
                      className="absolute right-3 p-2 bg-[#1e1e1e] dark:bg-[#f3f3ee] hover:bg-black dark:hover:bg-white text-white dark:text-[#1e1e1e] rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowUp className="w-5 h-5" />
                    </button>
                  </div>
                </form>
                
                {/* Mode Selector */}
                <ModeSelector mode={mode} setMode={setMode} />
              </div>
              
              <div className="mt-8 flex gap-2 flex-wrap justify-center">
                {['Latest AI models', 'Guide to building a portfolio', 'Top travel destinations'].map(s => (
                  <button 
                    key={s} 
                    onClick={() => { setQuery(s); }}
                    className="px-4 py-2 bg-[#f8f8f5] dark:bg-[#1a1a1a] hover:bg-[#ebebe5] dark:hover:bg-[#2a2a2a] dark:bg-[#2a2a2a] border border-[#e0e0da] dark:border-[#333333] rounded-full text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full p-4 md:p-8 pt-8">
              
              {messages.map((msg, index) => (
                <div key={index} className="mb-12 border-b border-[#e0e0da] dark:border-[#333333] pb-12 last:border-0">
                  {/* Question */}
                  <div className="mb-8">
                    <h2 className="text-3xl font-medium text-[#1e1e1e] dark:text-[#f3f3ee]">{msg.query}</h2>
                  </div>

                  {msg.error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-8">
                      {msg.error}
                    </div>
                  )}

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mb-10">
                      <div className="flex items-center gap-2 mb-4 text-[#1e1e1e] dark:text-[#f3f3ee]">
                        <FileText className="w-5 h-5" />
                        <h3 className="font-semibold text-lg">Sources</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {msg.sources.slice(0,4).map((source, i) => (
                          <a 
                            key={i} 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex flex-col p-3 bg-[#f8f8f5] dark:bg-[#1a1a1a] border border-[#e0e0da] dark:border-[#333333] rounded-xl hover:bg-white dark:hover:bg-[#1e1e1e] hover:shadow-md transition-all group"
                          >
                            <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase font-medium tracking-wider mb-1 line-clamp-1">{new URL(source.uri).hostname.replace('www.', '')}</span>
                            <span className="text-sm font-medium text-[#1e1e1e] dark:text-[#f3f3ee] line-clamp-2 group-hover:text-blue-600 dark:text-blue-400 transition-colors">{source.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Answer */}
                  {(msg.result || msg.isSearching) && (
                    <div className="mb-2">
                      <div className="flex items-center gap-2 mb-4 text-[#1e1e1e] dark:text-[#f3f3ee]">
                        <Search className="w-5 h-5" />
                        <h3 className="font-semibold text-lg">Answer</h3>
                      </div>
                      
                      <div className="prose prose-gray max-w-none prose-p:leading-relaxed dark:prose-invert prose-pre:bg-[#f8f8f5] dark:prose-pre:bg-[#1a1a1a] prose-pre:text-gray-800 dark:prose-pre:text-gray-200 prose-pre:border prose-pre:border-[#e0e0da] dark:prose-pre:border-[#333333]">
                        <div className="markdown-body text-gray-800 dark:text-gray-200">
                          <Markdown>{msg.result}</Markdown>
                        </div>
                      </div>
                      
                      {msg.isSearching && (
                        <div className="mt-4 flex items-center gap-2 text-gray-400 dark:text-gray-500">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Synthesizing...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Bottom Search Bar for active search */}
        {activeSearch && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white dark:from-[#1e1e1e] via-white dark:via-[#1e1e1e] to-transparent pb-6">
            <div className="max-w-3xl mx-auto w-full">
               <div className="w-full relative shadow-[0_0_15px_rgba(0,0,0,0.05)] rounded-3xl bg-white dark:bg-[#1e1e1e] border border-[#e0e0da] dark:border-[#333333] focus-within:border-gray-400 dark:focus-within:border-gray-600 focus-within:ring-2 focus-within:ring-gray-100 dark:focus-within:ring-gray-800 flex flex-col">
                 <form onSubmit={handleSearch} className="w-full relative">
                  <div className="relative flex items-center w-full overflow-hidden rounded-t-3xl bg-[#f8f8f5] dark:bg-[#1a1a1a] focus-within:bg-white dark:focus-within:bg-[#1e1e1e] transition-colors">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ask a follow up..."
                      className="w-full py-3 pl-5 pr-12 outline-none text-base bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-500"
                    />
                    <button 
                      type="submit" 
                      disabled={!query.trim()}
                      className="absolute right-2 p-1.5 bg-[#1e1e1e] dark:bg-[#f3f3ee] hover:bg-black dark:hover:bg-white text-white dark:text-[#1e1e1e] rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  </div>
                </form>
                <ModeSelector mode={mode} setMode={setMode} position="up" />
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
