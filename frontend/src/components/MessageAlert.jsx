import React from 'react';
import { AlertCircle } from 'lucide-react';

const MessageAlert = ({ message }) => {
  if (!message.text) return null;

  return (
    <div className={`mb-4 p-3 rounded-md flex items-center ${
      message.type === 'error' ? 'bg-red-100 text-red-700' : 
      message.type === 'info' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
    }`}>
      {message.type === 'error' ? (
        <AlertCircle className="mr-2 h-5 w-5" />
      ) : message.type === 'info' ? (
        <div className="mr-2 h-5 w-5 text-blue-500">ℹ</div>
      ) : (
        <div className="mr-2 h-5 w-5 text-green-500">✓</div>
      )}
      <span>{message.text}</span>
    </div>
  );
};

export default MessageAlert;
