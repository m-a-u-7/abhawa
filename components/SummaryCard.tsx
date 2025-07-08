import React from 'react';
import type { Language } from '../types';

interface SummaryCardProps {
  title: string;
  content: string;
  lang: Language;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, content, lang }) => {
  return (
    <div className="bg-black/20 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-white/20 animate-fade-in-up transition-all duration-300 hover:bg-black/30 hover:border-white/30">
      <h3 className={`text-xl font-semibold mb-3 ${lang === 'bn' ? 'font-bengali' : ''}`}>{title}</h3>
      <p className={`text-white/90 text-base leading-relaxed ${lang === 'bn' ? 'font-bengali' : ''}`}>{content}</p>
    </div>
  );
};

export default SummaryCard;