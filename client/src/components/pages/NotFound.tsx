import React from "react";

const NotFound: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">Page not found</p>
        <button 
          onClick={() => window.history.back()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFound;
