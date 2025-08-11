import { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';

const PuchAIPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const whatsappLink = "https://puch.ai/mcp/HUbLKIfDQQ";

  const handleOpenLink = () => {
    window.open(whatsappLink, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#282c2f] rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="text-white">
          <h2 className="text-2xl font-bold mb-4 text-center">Please don't close this!!!</h2>

          <div className="space-y-4">
            <p className="text-gray-300">
              Hey, I'm Yash Malik. I need your help. I am participating in a hackathon where I need to get 500+ unique users on my WhatsApp chatbot tool.
            </p>

            <div className="bg-[#1a1d21] p-4 rounded-lg">
              <p className="text-sm text-gray-300 mb-3">
                1. Click the link below to open WhatsApp:
              </p>

              <button
                onClick={handleOpenLink}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <span>Open WhatsApp Link</span>
                <ExternalLink size={16} />
              </button>

              <div
                className="mt-3 p-2 bg-[#0f1114] rounded text-xs text-gray-400 break-all"
                style={{
                  userSelect: 'text',
                  WebkitUserSelect: 'text',
                  MozUserSelect: 'text',
                  msUserSelect: 'text',
                  cursor: 'text'
                }}
              >
                {whatsappLink}
              </div>
            </div>

            <div className="bg-[#1a1d21] p-4 rounded-lg space-y-2">
              <p className="text-sm text-gray-300">
                2. Send the message that appears in the chat box
              </p>
              <p className="text-sm text-gray-300">
                3. Send any random YouTube video link to the chat
              </p>
            </div>
            <div className="bg-[#1a1d21] p-4 rounded-lg space-y-2">
              <p className="text-sm text-gray-300">
                4. Please share this with your friends and family to do the same.
              </p>
            </div>

            {/* Sam.webp image - responsive with side cropping */}
            <div className="w-full h-32 overflow-hidden rounded-lg">
              <img
                src={`/jportal/sam.webp`}
                alt="Sam"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div>
                <p className="text-xs text-gray-400">
                  I've never posted ads here and I don't plan to.
                  <br />
                  This is a one-time request to help me out.
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuchAIPopup;
