import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useTransaction } from '../contexts/TransactionContext';

export default function TransactionStatus() {
  const { status, resetStatus } = useTransaction();
  const [show, setShow] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const router = useRouter();

  // Handle auto-dismiss and navigation
  useEffect(() => {
    if (!status) return;

    // Show notification if there's a status message or error
    if (status.currentStep || status.error) {
      setShow(true);
      setIsClosing(false);
      
      // Auto-hide success messages after 5 seconds
      if (status.success) {
        const timer = setTimeout(() => {
          handleClose();
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    } else {
      handleClose();
    }
  }, [status]);

  const handleClose = () => {
    if (isClosing) return;
    
    setIsClosing(true);
    setShow(false);
    
    // Wait for the fade-out animation to complete before resetting
    const timer = setTimeout(() => {
      if (status?.success && status.redirectTo) {
        router.push(status.redirectTo);
      }
      resetStatus();
    }, 300);
    
    return () => clearTimeout(timer);
  };

  if (!show) return null;

  const getStatusStyles = () => {
    let baseStyles = 'fixed bottom-4 right-4 p-4 rounded-lg shadow-lg max-w-sm z-50 transform transition-all duration-300 ';
    
    if (isClosing) {
      baseStyles += 'translate-x-full opacity-0';
    } else {
      baseStyles += 'translate-x-0 opacity-100';
    }

    if (status.error) {
      return baseStyles + ' bg-red-50 border-l-4 border-red-500';
    } else if (status.success) {
      return baseStyles + ' bg-green-50 border-l-4 border-green-500';
    } else {
      return baseStyles + ' bg-blue-50 border-l-4 border-blue-500';
    }
  };

  const getStatusIcon = () => {
    if (status.error) {
      return <XCircleIcon className="h-6 w-6 text-red-500" />;
    } else if (status.success) {
      return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
    } else {
      return <InformationCircleIcon className="h-6 w-6 text-blue-500 animate-pulse" />;
    }
  };

  const getStatusTitle = () => {
    if (status.error) return 'Transaction Failed';
    if (status.success) return 'Success!';
    return 'Processing Transaction';
  };

  return (
    <div className={getStatusStyles()}>
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          {getStatusIcon()}
        </div>
        <div className="ml-3 w-0 flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            {getStatusTitle()}
          </h3>
          <div className="mt-1 text-sm text-gray-600">
            {status.error?.message || status.currentStep}
          </div>
          
          {status.txHash && (
            <div className="mt-2">
              <a
                href={`https://testnet.snowtrace.io/tx/${status.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View on Explorer
              </a>
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={handleClose}
            className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span className="sr-only">Close</span>
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
