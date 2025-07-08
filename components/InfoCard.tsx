import React from 'react';
import type { GroundingSource, Language } from '../types';
import { ExternalLink } from 'lucide-react';
import { texts } from '../constants';

interface DataSourceCardProps {
  sources: GroundingSource[];
  lang: Language;
}

const DataSourceCard: React.FC<DataSourceCardProps> = ({ sources, lang }) => {
  if (!sources || sources.length === 0) return null;
  const text = texts[lang];

  return (
    <div className="bg-black/20 p-4 sm:p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-white/20 animate-fade-in-up transition-all duration-300 hover:bg-black/30 hover:border-white/30">
      <h3 className={`text-lg font-semibold mb-3 ${lang === 'bn' ? 'font-bengali' : ''}`}>
        {text.sourcesTitle}
      </h3>
      <ul className="space-y-2 text-sm">
        {sources.map((source, index) => (
          <li key={index}>
            <a 
              href={source.uri} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 text-blue-300 hover:text-blue-200 transition-colors group"
            >
              <ExternalLink size={14} className="flex-shrink-0" />
              <span className="truncate group-hover:underline">{source.title || (source.uri ? new URL(source.uri).hostname : 'Untitled Source')}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DataSourceCard;