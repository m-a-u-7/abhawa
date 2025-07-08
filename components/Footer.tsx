import React from 'react';
import { Facebook } from 'lucide-react';
import { texts } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="w-full text-center py-4 mt-12">
      <div className="flex items-center justify-center gap-3 text-white/50">
        <p className="text-sm">
          {texts.en.footerCredit}
        </p>
        <a
          href="https://www.facebook.com/m.a.u.arari"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Developer's Facebook Profile"
          className="hover:text-white/80 transition-colors"
        >
          <Facebook size={25} />
        </a>
      </div>
    </footer>
  );
};

export default Footer;