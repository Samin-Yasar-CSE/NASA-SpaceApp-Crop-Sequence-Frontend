import { Sprout, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-500">
            <Sprout className="h-5 w-5 text-crop-green-600" />
            <span className="text-sm font-medium">CropSeq</span>
            <span className="text-xs text-gray-400">— NASA Space Apps Challenge</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a
              href="https://www.spaceappschallenge.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-crop-green-600 transition-colors"
            >
              NASA Space Apps <ExternalLink className="h-3 w-3" />
            </a>
            <span>Powered by NASA Earth Observations</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
