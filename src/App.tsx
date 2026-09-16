/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Code2, Layers, ArrowRight } from 'lucide-react';

export default function App() {
  const suggestions = [
    {
      title: 'Interactive Dashboard',
      description: 'Analytics, data visualization charts, and metric monitoring.',
    },
    {
      title: 'Productivity Tool',
      description: 'Task organizer, kanban board, notes, or project planner.',
    },
    {
      title: 'AI-Powered Assistant',
      description: 'Smart chat assistant, document analyzer, or content studio.',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col justify-between p-6 md:p-12 font-sans selection:bg-neutral-200">
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-8 border-b border-neutral-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-semibold tracking-tight text-base text-neutral-900">
            AI Studio Workspace
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Environment Ready
        </div>
      </header>

      <main className="max-w-4xl w-full mx-auto my-auto py-12">
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-950 leading-tight">
            What would you like to build today?
          </h1>
          <p className="text-base text-neutral-600 leading-relaxed">
            Tell me about your application idea, required features, or visual design preferences. I will write the code, configure the architecture, and bring it to life directly in your preview.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {suggestions.map((item, index) => (
            <div
              key={index}
              id={`suggestion-card-${index}`}
              className="group bg-white border border-neutral-200/80 rounded-xl p-5 hover:border-neutral-300 transition-all duration-150"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center mb-3">
                {index === 0 && <Layers className="w-4 h-4" />}
                {index === 1 && <Code2 className="w-4 h-4" />}
                {index === 2 && <Sparkles className="w-4 h-4" />}
              </div>
              <h2 className="text-sm font-semibold text-neutral-900 mb-1">
                {item.title}
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="max-w-4xl w-full mx-auto pt-6 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-2">
        <span>Ready to code • React 19, Vite, Tailwind CSS</span>
        <span>Type a prompt to get started</span>
      </footer>
    </div>
  );
}

