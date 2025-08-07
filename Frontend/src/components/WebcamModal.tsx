import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import { X, Camera, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface WebcamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageSrc: string) => void;
}

export default function WebcamModal({ isOpen, onClose, onCapture }: WebcamModalProps) {
  const webcamRef = useRef<Webcam>(null);
  const [captured, setCaptured] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');

  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImageSrc(imageSrc);
      setCaptured(true);
      toast.success('Photo captured successfully!');
    }
  };

  const handleConfirm = () => {
    if (imageSrc) {
      onCapture(imageSrc);
      setCaptured(false);
      setImageSrc('');
      onClose();
      toast.success('Attendance marked successfully!');
    }
  };

  const handleRetake = () => {
    setCaptured(false);
    setImageSrc('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Facial Recognition Check-in
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative bg-slate-100 rounded-xl overflow-hidden aspect-video">
                {!captured ? (
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover"
                    videoConstraints={{
                      facingMode: "user"
                    }}
                  />
                ) : (
                  <img
                    src={imageSrc}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div className="flex space-x-3">
                {!captured ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={capturePhoto}
                    className="flex-1 flex items-center justify-center space-x-2 bg-cyan-500 text-white px-4 py-3 rounded-xl font-medium hover:bg-cyan-600 transition-colors"
                  >
                    <Camera className="h-5 w-5" />
                    <span>Capture Photo</span>
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRetake}
                      className="flex-1 bg-slate-200 text-slate-700 px-4 py-3 rounded-xl font-medium hover:bg-slate-300 transition-colors"
                    >
                      Retake
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleConfirm}
                      className="flex-1 flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-3 rounded-xl font-medium hover:bg-green-600 transition-colors"
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span>Confirm</span>
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}