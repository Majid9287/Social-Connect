import React from "react";

const ConfirmationModal = ({ onCancel, onConfirm,text,loading }) => {
  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center  bg-gray-900 bg-opacity-70">
      <div className="bg-white p-8 rounded-lg m-2">
        <h3 className="text-lg font-medium text-gray-900 mb-4 ">
          {text}
        </h3>
        <div className="flex justify-end">
          <button
            className="text-white hover:text-gray-900 mr-4 bg-blue-500 px-2 rounded-md"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="text-red-600 hover:text-red-900 hover:bg-red-500 px-2 rounded-md border border-red-500"
            onClick={onConfirm}
          >
           {loading?"deleting..":"Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
